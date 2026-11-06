import {
  PortalError,
  fail,
  uuid,
  text,
  only,
  approvedOffer,
  stripeMode,
  checkoutParams,
  validateOffer,
  references,
  contractWindow,
  cancellationDate,
  timestamp,
} from "./domain.mjs";
const json = (data, status = 200, headers = {}) =>
  Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...headers,
    },
  });
export function createAPI(ctx) {
  const { repo, db, auth, stripe, env } = ctx;
  const origin = env.PORTAL_ORIGIN || "https://dylanforsberg.com";
  async function identity(req) {
    const bearer = req.headers.get("authorization") || "";
    if (!bearer.startsWith("Bearer ")) fail(401, "Please sign in.");
    const token = bearer.slice(7);
    const [{ data, error }, { data: claims, error: claimsError }] =
      await Promise.all([auth.auth.getUser(token), auth.auth.getClaims(token)]);
    if (
      error ||
      claimsError ||
      !data?.user ||
      claims?.claims?.sub !== data.user.id
    )
      fail(401, "Your session has expired. Please sign in again.");
    const admin = !!(await repo.one("admins", { user_id: data.user.id }));
    return {
      id: data.user.id,
      email: data.user.email,
      admin,
      aal: claims.claims.aal,
    };
  }
  function administrator(user) {
    if (!user.admin) fail(403, "Administrator access required.");
    if (user.aal !== "aal2")
      fail(403, "Complete two-factor verification for administrator access.");
  }
  function notifications(key, client, subject, message) {
    const recipients = [client?.email, env.ADMIN_NOTIFICATION_EMAIL].filter(
      Boolean,
    );
    return [...new Set(recipients)].map((recipient) => ({
      dedupe_key: key + ":" + recipient,
      recipient,
      subject,
      message,
    }));
  }
  async function notify(key, client, subject, message) {
    for (const n of notifications(key, client, subject, message))
      await repo.notify(n);
  }
  async function state(user) {
    if (user.admin && user.aal !== "aal2")
      return { role: "admin", needsMfa: true };
    const clients = user.admin
      ? await repo.all("clients")
      : await repo.all("clients", { user_id: user.id });
    if (!clients.length && !user.admin)
      fail(
        403,
        "This account does not have a client invitation. Please contact Dylan.",
      );
    const projects = (
      await Promise.all(
        clients.map((c) => repo.all("projects", { client_id: c.id })),
      )
    ).flat();
    const offers = (
      await Promise.all(
        projects.map((p) => repo.all("offers", { project_id: p.id })),
      )
    ).flat();
    const related = async (table) =>
      (
        await Promise.all(
          offers.map((o) => repo.all(table, { offer_id: o.id })),
        )
      ).flat();
    const [agreements, payments, subscriptions, terms, cancellations] =
      await Promise.all(
        [
          "agreements",
          "payments",
          "subscriptions",
          "contract_terms",
          "cancellations",
        ].map(related),
      );
    // Do not send internal storage paths or customer IDs to the browser.
    return {
      role: user.admin ? "admin" : "client",
      mode: "test",
      clients: clients.map(({ stripe_customer_id, ...c }) => c),
      projects,
      offers,
      agreements: agreements.map(({ file_path, ...a }) => a),
      payments,
      subscriptions,
      terms: terms.map((t) => ({
        ...t,
        ...(t.status === "active"
          ? contractWindow(
              t.effective_at,
              offers.find((o) => o.id === t.offer_id).term_months,
              offers.find((o) => o.id === t.offer_id).notice_days,
            )
          : {}),
      })),
      cancellations,
      ...(user.admin
        ? {
            references,
            notifications: (await repo.recentNotifications()).map(
              ({ message, ...n }) => n,
            ),
          }
        : {}),
    };
  }
  async function checkout(user, b) {
    only(b, ["offer_id"]);
    stripeMode(env);
    uuid(b.offer_id);
    const found = await repo.owner(b.offer_id, user.id);
    return repo.lock("project:" + found.project.id, async () => {
      const {
        offer: o,
        project,
        client,
      } = await repo.owner(b.offer_id, user.id);
      approvedOffer(o, await repo.all("agreements", { offer_id: o.id }));
      if (
        o.billing === "monthly" &&
        o.effective_date &&
        o.effective_date !== new Date().toISOString().slice(0, 10)
      )
        fail(
          409,
          "Monthly billing must start on the agreed effective date (UTC). Please contact Dylan if that date needs to change; a new approved proposal is required.",
        );
      const paid = (await repo.all("payments", { offer_id: o.id })).some((p) =>
        ["paid", "refunded", "partially_refunded"].includes(p.status),
      );
      if (paid) fail(409, "This offer has already been paid.");
      const subs = await repo.all("subscriptions", { project_id: project.id });
      if (
        o.billing === "monthly" &&
        subs.some((s) => !["canceled", "incomplete_expired"].includes(s.status))
      )
        fail(409, "A subscription already exists for this project.");
      let attempt = (
        await repo.all("checkout_attempts", { offer_id: o.id })
      ).find((a) => a.status !== "expired");
      if (attempt?.stripe_session_id) {
        const session = await stripe.checkout.sessions.retrieve(
          attempt.stripe_session_id,
        );
        if (session.livemode) fail(409, "Live billing is disabled.");
        if (session.status === "complete")
          fail(
            409,
            "Payment is awaiting confirmation. Refresh the portal shortly.",
          );
        if (session.status === "open")
          return {
            clientSecret: session.client_secret,
            publishableKey: env.STRIPE_PUBLISHABLE_KEY,
          };
        await repo.update(
          "checkout_attempts",
          { id: attempt.id },
          { status: "expired" },
        );
        attempt = null;
      }
      if (
        attempt &&
        Date.now() - new Date(attempt.created_at).getTime() > 22 * 3600000
      )
        fail(
          409,
          "An earlier payment attempt needs administrator reconciliation before retrying.",
        );
      if (!attempt)
        attempt = await repo.insert("checkout_attempts", { offer_id: o.id });
      // Persist the attempt before calling Stripe. Every retry uses the same key and parameters.
      if (!client.stripe_customer_id) {
        const customer = await stripe.customers.create(
          {
            email: client.email,
            name: client.name,
            metadata: { portal_client_id: client.id },
          },
          { idempotencyKey: "portal-customer:" + client.id },
        );
        await repo.update(
          "clients",
          { id: client.id },
          { stripe_customer_id: customer.id },
        );
        client.stripe_customer_id = customer.id;
      }
      // Protect against an active Stripe subscription even if a webhook was delayed.
      if (o.billing === "monthly") {
        for await (const sub of stripe.subscriptions.list({
          customer: client.stripe_customer_id,
          status: "all",
          limit: 100,
        })) {
          if (
            sub.metadata?.portal_project_id === project.id &&
            !["canceled", "incomplete_expired"].includes(sub.status)
          )
            fail(
              409,
              "A subscription already exists; its payment status is being synchronized.",
            );
        }
      }
      const params = checkoutParams(
        o,
        project,
        client.stripe_customer_id,
        attempt,
        origin,
      );
      const session = await stripe.checkout.sessions.create(params, {
        idempotencyKey: "portal-checkout:" + attempt.id,
      });
      await repo.update(
        "checkout_attempts",
        { id: attempt.id },
        { stripe_session_id: session.id, status: "open" },
      );
      await repo.audit(user.id, "checkout.created", o.id);
      return {
        clientSecret: session.client_secret,
        publishableKey: env.STRIPE_PUBLISHABLE_KEY,
      };
    });
  }
  async function cancel(user, b) {
    only(b, ["offer_id", "reason", "requested_date"]);
    const {
      offer: o,
      project,
      client,
    } = await repo.owner(uuid(b.offer_id), user.id);
    return repo.lock("project:" + project.id, async () => {
      const sub = (await repo.all("subscriptions", { offer_id: o.id }))[0];
      const stored = await repo.one("contract_terms", { offer_id: o.id });
      if (!sub || !stored || sub.status === "canceled")
        fail(409, "No active agreement is available for this request.");
      const previous = (
        await repo.all("cancellations", { offer_id: o.id })
      ).find((c) => c.status !== "completed");
      if (previous) return previous;
      const term = contractWindow(
        stored.effective_at,
        o.term_months,
        o.notice_days,
      );
      const requested = b.requested_date ? timestamp(b.requested_date) : null;
      const request = {
        id: crypto.randomUUID(),
        offer_id: o.id,
        requested_by: user.id,
        reason: text(b.reason || "", 2000, false),
        requested_termination_at: requested,
        proposed_termination_at: cancellationDate(term, o, new Date()),
      };
      const record = await repo.rpc("create_cancellation", {
        request_doc: request,
        notices: notifications(
          "cancellation:" + request.id,
          client,
          "Cancellation request received",
          `Your cancellation request for ${project.title} has been recorded. Proposed agreement end: ${request.proposed_termination_at.slice(0, 10)}. An earlier date or applicable cancellation right can be reviewed. Final scheduling will be confirmed separately.`,
        ),
      });
      // Default is human review, always accepting requests, including requests for earlier termination.
      if (
        env.CANCELLATION_POLICY === "term_end" &&
        env.CANCELLATION_POLICY_REVIEWED === "true" &&
        !requested
      ) {
        await scheduleCancellation(
          record,
          o,
          sub,
          null,
          record.proposed_termination_at,
          "Scheduled under reviewed policy.",
        );
        return await repo.one("cancellations", { id: record.id });
      }
      return record;
    });
  }
  async function scheduleCancellation(record, o, sub, actor, date, note) {
    stripeMode(env);
    const at = new Date(timestamp(date));
    if (
      record.effective_termination_at &&
      +new Date(record.effective_termination_at) !== +at
    )
      fail(
        409,
        "A previous scheduling attempt must be reconciled at its recorded date before changing it.",
      );
    await repo.update(
      "cancellations",
      { id: record.id },
      {
        effective_termination_at: at.toISOString(),
        reviewed_by: actor,
        reviewed_at: new Date().toISOString(),
        admin_note: note,
      },
    );
    // Requests are durable before scheduling. Retrying uses a stable idempotency key.
    if (at <= new Date())
      await stripe.subscriptions.cancel(
        sub.id,
        { prorate: false, invoice_now: false },
        { idempotencyKey: "cancel:" + record.id },
      );
    else
      await stripe.subscriptions.update(
        sub.id,
        { cancel_at: Math.floor(+at / 1000), proration_behavior: "none" },
        { idempotencyKey: "cancel:" + record.id },
      );
    await repo.update(
      "cancellations",
      { id: record.id },
      {
        status: at <= new Date() ? "completed" : "scheduled",
        effective_termination_at: at.toISOString(),
        reviewed_by: actor,
        reviewed_at: new Date().toISOString(),
        admin_note: note,
      },
    );
    await repo.update(
      "contract_terms",
      { offer_id: o.id },
      { status: "nonrenewing", termination_at: at.toISOString() },
    );
    const { project, client } = await repo.owner(o.id, "", true);
    await notify(
      "cancellation-scheduled:" + record.id,
      client,
      "Cancellation scheduled",
      `${project.title}: your service termination is scheduled for ${at.toISOString().slice(0, 10)}. Please contact Dylan with any questions.`,
    );
  }
  async function upload(user, req) {
    administrator(user);
    const form = await req.formData(),
      offerId = uuid(form.get("offer_id"));
    const { offer, project } = await repo.owner(offerId, user.id, true);
    return repo.lock("project:" + project.id, async () => {
      const file = form.get("file");
      if (
        !file ||
        typeof file.arrayBuffer !== "function" ||
        file.size > 10485760 ||
        file.size < 5 ||
        file.type !== "application/pdf"
      )
        fail(400, "Upload a PDF up to 10 MB.");
      const bytes = new Uint8Array(await file.arrayBuffer());
      if (new TextDecoder().decode(bytes.slice(0, 5)) !== "%PDF-")
        fail(400, "This file is not a PDF.");
      const signed = form.get("status") === "signed",
        note = text(form.get("confirmation_note") || "", 2000, signed);
      const signedAt = signed ? timestamp(form.get("signed_at")) : null;
      if (
        signed &&
        (form.get("confirmed") !== "yes" || new Date(signedAt) > new Date())
      )
        fail(400, "Confirm actual execution and provide its date.");
      const hash = [
        ...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)),
      ]
        .map((n) => n.toString(16).padStart(2, "0"))
        .join("");
      const path =
        project.client_id + "/" + offer.id + "/" + crypto.randomUUID() + ".pdf";
      const { error } = await db.storage
        .from("client-agreements")
        .upload(path, bytes, { contentType: "application/pdf", upsert: false });
      if (error) throw new Error("Private upload failed");
      const agreement = await repo.insert("agreements", {
        offer_id: offer.id,
        version: offer.agreement_version,
        file_path: path,
        file_sha256: hash,
        original_name: text(file.name, 255),
        status: signed ? "signed" : "unsigned",
        signed_at: signedAt,
        confirmed_by: user.id,
        confirmation_note: note,
      });
      await repo.audit(
        user.id,
        signed ? "agreement.execution_confirmed" : "agreement.attached",
        agreement.id,
      );
      return { id: agreement.id };
    });
  }
  async function action(user, name, b, req) {
    switch (name) {
      case "state":
        return state(user);
      case "checkout":
        return checkout(user, b);
      case "accept": {
        only(b, ["offer_id"]);
        const { offer, project, client } = await repo.owner(
          uuid(b.offer_id),
          user.id,
        );
        return repo.lock("project:" + project.id, async () => {
          const current = await repo.one("offers", { id: offer.id });
          if (current.state === "superseded")
            fail(
              409,
              "This proposal has been replaced. Refresh to see the current version.",
            );
          if (current.state !== "accepted") {
            await repo.update(
              "offers",
              { id: offer.id, state: "published" },
              {
                state: "accepted",
                accepted_by: user.id,
                accepted_at: new Date().toISOString(),
              },
            );
            await repo.audit(user.id, "proposal.accepted", offer.id);
          }
          await notify(
            "accepted:" + offer.id,
            client,
            "Proposal accepted",
            `Proposal v${offer.version} for ${project.title} has been accepted. This records scope approval, not a contract signature.`,
          );
          return { accepted: true };
        });
      }
      case "billing": {
        only(b, []);
        stripeMode(env);
        const client = await repo.one("clients", { user_id: user.id });
        if (!client?.stripe_customer_id)
          fail(
            409,
            "Billing becomes available after your first payment session.",
          );
        if (!env.STRIPE_PORTAL_CONFIGURATION_ID)
          fail(503, "Billing management is not configured yet.");
        const configuration =
          await stripe.billingPortal.configurations.retrieve(
            env.STRIPE_PORTAL_CONFIGURATION_ID,
          );
        if (configuration.features?.subscription_update?.enabled)
          fail(503, "Billing configuration requires administrator review.");
        // A dedicated configuration controls permitted cancellation rights; never disable them silently.
        const session = await stripe.billingPortal.sessions.create({
          customer: client.stripe_customer_id,
          configuration: configuration.id,
          return_url: origin + "/client/#billing",
        });
        return { url: session.url };
      }
      case "agreement-download": {
        only(b, ["agreement_id"]);
        const agreement = await repo.one("agreements", {
          id: uuid(b.agreement_id),
        });
        if (!agreement) fail(404, "Document not found.");
        if (user.admin) administrator(user);
        await repo.owner(agreement.offer_id, user.id, user.admin);
        const { data, error } = await db.storage
          .from("client-agreements")
          .createSignedUrl(agreement.file_path, 60, {
            download: agreement.original_name,
          });
        if (error) throw new Error("Document unavailable");
        return { url: data.signedUrl };
      }
      case "cancel":
        return cancel(user, b);
      case "agreement-upload":
        return upload(user, req);
      case "client-create": {
        administrator(user);
        only(b, ["name", "email"]);
        const email = text(b.email, 254).toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
          fail(400, "Enter a valid email.");
        const client = await repo.insert("clients", {
          name: text(b.name, 200),
          email,
        });
        await repo.audit(user.id, "client.created", client.id);
        return { id: client.id };
      }
      case "invite": {
        administrator(user);
        only(b, ["client_id"]);
        const client = await repo.one("clients", { id: uuid(b.client_id) });
        if (!client) fail(404, "Client not found.");
        return repo.lock("invite:" + client.id, async () => {
          if (!client.user_id) {
            const existing = await repo.rpc("invited_user", {
              email_address: client.email,
            });
            if (existing) {
              await repo.update(
                "clients",
                { id: client.id },
                { user_id: existing },
              );
              const { error } = await auth.auth.signInWithOtp({
                email: client.email,
                options: {
                  shouldCreateUser: false,
                  emailRedirectTo: origin + "/client/",
                },
              });
              if (error)
                fail(
                  429,
                  "The email could not be sent yet. Please wait and try again.",
                );
            } else {
              const { data, error } = await db.auth.admin.inviteUserByEmail(
                client.email,
                { redirectTo: origin + "/client/" },
              );
              if (error)
                fail(
                  409,
                  "Invitation could not be sent. Check the authentication provider email configuration and retry.",
                );
              await repo.update(
                "clients",
                { id: client.id },
                { user_id: data.user.id },
              );
            }
          } else {
            const { error } = await auth.auth.signInWithOtp({
              email: client.email,
              options: {
                shouldCreateUser: false,
                emailRedirectTo: origin + "/client/",
              },
            });
            if (error)
              fail(
                429,
                "The email could not be sent yet. Please wait and try again.",
              );
          }
          await repo.audit(user.id, "client.invited", client.id);
          return { sent: true };
        });
      }
      case "project-create": {
        administrator(user);
        only(b, ["client_id", "title", "offer"]);
        const client = await repo.one("clients", { id: uuid(b.client_id) });
        if (!client) fail(404, "Client not found.");
        const projectId = crypto.randomUUID();
        const offer = validateOffer(b.offer, user.id, projectId, 1);
        await repo.rpc("publish_offer", {
          project_doc: {
            id: projectId,
            client_id: client.id,
            title: text(b.title, 200),
          },
          offer_doc: offer,
        });
        return { project_id: projectId };
      }
      case "offer-create": {
        administrator(user);
        only(b, ["project_id", "offer"]);
        const project = await repo.one("projects", { id: uuid(b.project_id) });
        if (!project) fail(404, "Project not found.");
        return repo.lock("project:" + project.id, async () => {
          const previous = await repo.all("offers", { project_id: project.id });
          const offer = validateOffer(
            b.offer,
            user.id,
            project.id,
            Math.max(0, ...previous.map((o) => o.version)) + 1,
          );
          if (offer.kind === "primary") {
            if (
              previous.some(
                (o) => o.kind === "primary" && o.state === "accepted",
              )
            )
              fail(
                409,
                "Accepted scope is immutable. Create a separately approved additional charge or a new project.",
              );
          }
          const id = await repo.rpc("publish_offer", {
            project_doc: null,
            offer_doc: offer,
          });
          return { id };
        });
      }
      case "cancel-review": {
        administrator(user);
        only(b, ["request_id", "effective_date", "note"]);
        const record = await repo.one("cancellations", {
          id: uuid(b.request_id),
        });
        if (!record || record.status !== "requested")
          fail(409, "This request has already been processed.");
        const { offer, project } = await repo.owner(
          record.offer_id,
          user.id,
          true,
        );
        return repo.lock("project:" + project.id, async () => {
          const latest = await repo.one("cancellations", { id: record.id });
          if (latest.status !== "requested")
            fail(409, "This request has already been processed.");
          const sub = (
            await repo.all("subscriptions", { offer_id: offer.id })
          )[0];
          if (!sub) fail(409, "Subscription not found.");
          await scheduleCancellation(
            latest,
            offer,
            sub,
            user.id,
            b.effective_date,
            text(b.note, 2000),
          );
          await repo.audit(user.id, "cancellation.scheduled", record.id);
          return { scheduled: true };
        });
      }
      default:
        fail(404, "Not found.");
    }
  }
  return async (req) => {
    const requestOrigin = req.headers.get("origin");
    const allowed = [
      origin,
      ...(env.PORTAL_EXTRA_ORIGINS || "").split(",").filter(Boolean),
    ];
    const headers =
      requestOrigin && allowed.includes(requestOrigin)
        ? {
            "Access-Control-Allow-Origin": requestOrigin,
            Vary: "Origin",
            "Access-Control-Allow-Headers":
              "authorization, apikey, content-type, x-client-info",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
          }
        : {};
    if (requestOrigin && !allowed.includes(requestOrigin))
      return json({ error: "Origin not permitted." }, 403);
    if (req.method === "OPTIONS")
      return new Response(null, { status: 204, headers });
    if (req.method !== "POST")
      return json({ error: "Method not allowed." }, 405, headers);
    try {
      const user = await identity(req),
        name = new URL(req.url).pathname.split("/").filter(Boolean).at(-1);
      const max = name === "agreement-upload" ? 11000000 : 50000;
      if (Number(req.headers.get("content-length") || 0) > max)
        fail(413, "Request is too large.");
      let body = {};
      if (name !== "agreement-upload") {
        const raw = await req.text();
        if (raw.length > max) fail(413, "Request is too large.");
        try {
          body = JSON.parse(raw || "{}");
        } catch {
          fail(400, "Invalid request.");
        }
      }
      return json(await action(user, name, body, req), 200, headers);
    } catch (e) {
      return json(
        {
          error:
            e instanceof PortalError
              ? e.message
              : "This request could not be completed. Please try again or contact Dylan.",
        },
        e instanceof PortalError ? e.status : 500,
        headers,
      );
    }
  };
}
