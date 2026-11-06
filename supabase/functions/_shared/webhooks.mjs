import {
  stripeId,
  isoUnix,
  contractWindow,
  stripeMode,
  PortalError,
} from "./domain.mjs";
const supported = new Set([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.async_payment_failed",
  "checkout.session.expired",
  "payment_intent.succeeded",
  "payment_intent.payment_failed",
  "payment_intent.processing",
  "invoice.paid",
  "invoice.payment_failed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "charge.refunded",
  "refund.created",
  "refund.updated",
]);
export function createWebhook(ctx) {
  const { repo, stripe, env, cryptoProvider } = ctx;
  async function eventTarget(event) {
    const object = event.data.object;
    if (event.type.startsWith("checkout.")) {
      const s = await stripe.checkout.sessions.retrieve(object.id);
      return { offerId: s.metadata?.portal_offer_id, session: s };
    }
    if (event.type.startsWith("invoice.")) {
      const i = await stripe.invoices.retrieve(object.id);
      return {
        offerId:
          i.metadata?.portal_offer_id ||
          i.parent?.subscription_details?.metadata?.portal_offer_id,
        invoice: i,
        subscriptionId: stripeId(i.parent?.subscription_details?.subscription),
      };
    }
    if (event.type.startsWith("customer.subscription."))
      return {
        offerId: object.metadata?.portal_offer_id,
        subscriptionId: object.id,
      };
    if (event.type.startsWith("payment_intent.")) {
      const intent = await stripe.paymentIntents.retrieve(object.id);
      return { offerId: intent.metadata?.portal_offer_id, intent };
    }
    const chargeId =
      event.type === "charge.refunded" ? object.id : stripeId(object.charge);
    if (!chargeId) return {};
    const charge = await stripe.charges.retrieve(chargeId);
    if (!charge.payment_intent) return {};
    const intent = await stripe.paymentIntents.retrieve(
      stripeId(charge.payment_intent),
    );
    if (intent.metadata?.portal_offer_id)
      return { offerId: intent.metadata.portal_offer_id, intent, charge };
    const payments = await stripe.invoicePayments.list({
      payment: { type: "payment_intent", payment_intent: intent.id },
      limit: 10,
    });
    const invoiceId = stripeId(payments.data[0]?.invoice);
    if (!invoiceId) return {};
    const invoice = await stripe.invoices.retrieve(invoiceId);
    return {
      offerId: invoice.parent?.subscription_details?.metadata?.portal_offer_id,
      subscriptionId: stripeId(
        invoice.parent?.subscription_details?.subscription,
      ),
      invoice,
      intent,
      charge,
    };
  }
  async function snapshot(target, offer, project, client) {
    const changes = { notifications: [] };
    const now = new Date().toISOString();
    let session = target.session;
    if (!session && offer.billing === "one_time") {
      const attempt = (
        await repo.all("checkout_attempts", { offer_id: offer.id })
      ).find((a) => a.status !== "expired" && a.stripe_session_id);
      if (attempt)
        session = await stripe.checkout.sessions.retrieve(
          attempt.stripe_session_id,
        );
    }
    if (session) {
      if (
        stripeId(session.customer) !== client.stripe_customer_id ||
        session.livemode
      )
        throw new Error("Customer or mode mismatch");
      changes.checkout = {
        id: session.id,
        status:
          session.status === "complete"
            ? "complete"
            : session.status === "expired"
              ? "expired"
              : "open",
      };
    }
    const subId =
      target.subscriptionId ||
      stripeId(session?.subscription) ||
      (await repo.all("subscriptions", { offer_id: offer.id }))[0]?.id;
    let invoice = target.invoice;
    if (subId) {
      const sub = await stripe.subscriptions.retrieve(subId);
      if (
        stripeId(sub.customer) !== client.stripe_customer_id ||
        sub.metadata?.portal_offer_id !== offer.id ||
        sub.livemode
      )
        throw new Error("Subscription ownership mismatch");
      const item = sub.items.data[0];
      changes.subscription = {
        id: sub.id,
        project_id: project.id,
        offer_id: offer.id,
        status: sub.status,
        next_payment_at: isoUnix(item?.current_period_end),
        cancel_at: isoUnix(sub.cancel_at),
        updated_at: now,
      };
      if (!invoice && sub.latest_invoice)
        invoice = await stripe.invoices.retrieve(stripeId(sub.latest_invoice));
      const stored = await repo.one("contract_terms", { offer_id: offer.id });
      if (stored || invoice?.status === "paid") {
        const effective =
          stored?.effective_at ||
          (offer.effective_date
            ? offer.effective_date + "T00:00:00.000Z"
            : isoUnix(sub.start_date));
        const terms = contractWindow(
          effective,
          offer.term_months,
          offer.notice_days,
        );
        changes.term = {
          ...terms,
          offer_id: offer.id,
          subscription_id: sub.id,
          monthly_amount: Number(offer.amount),
          agreement_version: offer.agreement_version,
          status:
            sub.status === "canceled"
              ? "terminated"
              : sub.cancel_at
                ? "nonrenewing"
                : "active",
          termination_at:
            sub.status === "canceled"
              ? isoUnix(sub.ended_at || sub.canceled_at)
              : isoUnix(sub.cancel_at),
        };
      }
      if (invoice) {
        if (
          stripeId(invoice.customer) !== client.stripe_customer_id ||
          invoice.livemode ||
          stripeId(invoice.parent?.subscription_details?.subscription) !==
            sub.id
        )
          throw new Error("Invoice mismatch");
        changes.payment = {
          id: invoice.id,
          offer_id: offer.id,
          amount:
            invoice.status === "paid"
              ? invoice.amount_paid
              : invoice.amount_due,
          currency: invoice.currency,
          status:
            invoice.status === "paid"
              ? "paid"
              : invoice.attempted && invoice.status === "open"
                ? "failed"
                : invoice.status,
          paid_at: isoUnix(invoice.status_transitions?.paid_at),
          invoice_url: invoice.hosted_invoice_url,
          invoice_pdf: invoice.invoice_pdf,
          receipt_url: null,
          refunded_amount: 0,
          updated_at: now,
        };
        // Refund notifications may arrive separately from an invoice. Preserve confirmed refund totals.
        const previous = await repo.one("payments", { id: invoice.id });
        if (previous?.refunded_amount) {
          changes.payment.refunded_amount = previous.refunded_amount;
          changes.payment.status = previous.status;
        }
      }
      if (Number(item?.price?.unit_amount) !== Number(offer.amount))
        changes.notifications.push({
          dedupe_key: "price-review:" + sub.id + ":" + item?.price?.unit_amount,
          recipient: env.ADMIN_NOTIFICATION_EMAIL,
          subject: "Subscription price needs review",
          message: `The Stripe price for ${project.title} differs from accepted proposal v${offer.version}. The portal has not changed the agreed price. Review before further billing.`,
        });
    } else if (session?.payment_intent) {
      const intent = await stripe.paymentIntents.retrieve(
        stripeId(session.payment_intent),
        { expand: ["latest_charge"] },
      );
      if (
        stripeId(intent.customer) !== client.stripe_customer_id ||
        intent.livemode
      )
        throw new Error("Payment mismatch");
      const charge =
        intent.latest_charge && typeof intent.latest_charge === "object"
          ? intent.latest_charge
          : null;
      const refunded = charge?.amount_refunded || 0;
      invoice =
        invoice ||
        (session.invoice
          ? await stripe.invoices.retrieve(stripeId(session.invoice))
          : null);
      changes.payment = {
        id: intent.id,
        offer_id: offer.id,
        amount: intent.amount,
        currency: intent.currency,
        status:
          refunded >= intent.amount
            ? "refunded"
            : refunded
              ? "partially_refunded"
              : intent.status === "succeeded"
                ? "paid"
                : intent.status === "processing"
                  ? "processing"
                  : intent.last_payment_error
                    ? "failed"
                    : "pending",
        paid_at:
          intent.status === "succeeded"
            ? isoUnix(charge?.created) || now
            : null,
        invoice_url: invoice?.hosted_invoice_url || null,
        invoice_pdf: invoice?.invoice_pdf || null,
        receipt_url: charge?.receipt_url || null,
        refunded_amount: refunded,
        updated_at: now,
      };
    }
    // Subscription refunds: locate the affected invoice through Stripe's Invoice Payments API.
    if (target.charge?.amount_refunded > 0 && subId) {
      const payments = await stripe.invoicePayments.list({
        payment: {
          type: "payment_intent",
          payment_intent: stripeId(target.charge.payment_intent),
        },
        limit: 10,
      });
      const invoiceId = stripeId(payments.data[0]?.invoice);
      if (invoiceId) {
        const i = await stripe.invoices.retrieve(invoiceId);
        if (stripeId(i.customer) !== client.stripe_customer_id)
          throw new Error("Refund ownership mismatch");
        changes.payment = {
          id: i.id,
          offer_id: offer.id,
          amount: i.amount_paid,
          currency: i.currency,
          status:
            target.charge.amount_refunded >= i.amount_paid
              ? "refunded"
              : "partially_refunded",
          paid_at: isoUnix(i.status_transitions?.paid_at),
          invoice_url: i.hosted_invoice_url,
          invoice_pdf: i.invoice_pdf,
          receipt_url: target.charge.receipt_url,
          refunded_amount: target.charge.amount_refunded,
          updated_at: now,
        };
      }
    }
    const p = changes.payment;
    if (
      p &&
      ["paid", "failed", "refunded", "partially_refunded"].includes(p.status)
    ) {
      const subject =
        p.status === "paid"
          ? "Payment confirmed"
          : p.status === "failed"
            ? "Payment needs attention"
            : "Refund recorded";
      for (const recipient of new Set(
        [client.email, env.ADMIN_NOTIFICATION_EMAIL].filter(Boolean),
      ))
        changes.notifications.push({
          dedupe_key: `payment:${p.id}:${p.status}:${p.refunded_amount}:${recipient}`,
          recipient,
          subject,
          message: `${project.title}: ${subject.toLowerCase()}. Sign in to ${env.PORTAL_ORIGIN}/client/ for invoices, receipts, and billing management.`,
        });
      if (p.status === "paid")
        changes.project = { id: project.id, status: "active" };
    }
    changes.notifications = changes.notifications.filter((n) => n.recipient);
    return changes;
  }
  return async (req) => {
    if (req.method !== "POST")
      return new Response("Method not allowed", { status: 405 });
    let event;
    try {
      stripeMode(env);
      const raw = await req.text();
      if (raw.length > 1000000)
        return new Response("Request too large", { status: 413 });
      event = await stripe.webhooks.constructEventAsync(
        raw,
        req.headers.get("stripe-signature") || "",
        env.STRIPE_WEBHOOK_SECRET,
        300,
        cryptoProvider,
      );
    } catch {
      return new Response("Invalid webhook signature or configuration", {
        status: 400,
      });
    }
    if (event.livemode)
      return new Response("Live billing disabled", { status: 400 });
    if (!supported.has(event.type))
      return Response.json({ received: true, ignored: true });
    try {
      if (await repo.one("webhook_events", { id: event.id }))
        return Response.json({ received: true, duplicate: true });
      const target = await eventTarget(event);
      if (!target.offerId)
        return Response.json({ received: true, ignored: true });
      const offer = await repo.one("offers", { id: target.offerId });
      if (!offer) return Response.json({ received: true, ignored: true });
      await repo.lock("project:" + offer.project_id, async (leaseOwner) => {
        if (await repo.one("webhook_events", { id: event.id })) return;
        // Fetch again inside the per-project lock: older deliveries cannot overwrite newer Stripe state.
        const fresh = await eventTarget(event),
          { project, client } = await repo.owner(offer.id, "", true);
        const changes = await snapshot(fresh, offer, project, client);
        await repo.rpc("apply_event", {
          event_id: event.id,
          event_type: event.type,
          event_created: event.created,
          changes,
          project_id: offer.project_id,
          lease_owner: leaseOwner,
        });
      });
      return Response.json({ received: true });
    } catch {
      return new Response("Synchronization pending; retry this event", {
        status: 503,
      });
    }
  };
}
