import test from "node:test";
import assert from "node:assert/strict";
import Stripe from "stripe";
import { createWebhook } from "../../supabase/functions/_shared/webhooks.mjs";
import { context, ids } from "./support.mjs";
const official = new Stripe("sk_test_fixture");
function signed(e, override) {
  const raw = JSON.stringify(e),
    sig = official.webhooks.generateTestHeaderString({
      payload: raw,
      secret: "whsec_fixture_only",
    });
  return new Request("https://test.invalid", {
    method: "POST",
    headers: { "stripe-signature": sig },
    body: override || raw,
  });
}
const event = (id, type, object) => ({
  id,
  type,
  created: Math.floor(Date.now() / 1000),
  livemode: false,
  data: { object },
});
function setup() {
  const c = context();
  c.stripe.webhooks = official.webhooks;
  c.cryptoProvider = Stripe.createSubtleCryptoProvider();
  const s = {
    id: "cs_test_fixture",
    metadata: { portal_offer_id: ids.offer },
    customer: "cus_test",
    livemode: false,
    status: "complete",
    payment_intent: "pi_test",
    invoice: "in_test",
  };
  c.sessions.set(s.id, s);
  c.repo.rows.checkout_attempts.push({
    id: "attempt",
    offer_id: ids.offer,
    stripe_session_id: s.id,
    status: "open",
  });
  c.stripe.paymentIntents = {
    retrieve: async () => ({
      id: "pi_test",
      customer: "cus_test",
      livemode: false,
      status: "succeeded",
      amount: 200000,
      currency: "usd",
      latest_charge: {
        id: "ch_test",
        created: 1700000000,
        amount_refunded: 0,
        receipt_url: "https://pay.stripe.com/receipts/test",
      },
    }),
  };
  c.stripe.invoices = {
    retrieve: async () => ({
      id: "in_test",
      customer: "cus_test",
      livemode: false,
      status: "paid",
      amount_paid: 200000,
      currency: "usd",
      metadata: { portal_offer_id: ids.offer },
      hosted_invoice_url: "https://invoice.stripe.com/test",
      invoice_pdf: "https://files.stripe.com/test",
      status_transitions: { paid_at: 1700000000 },
    }),
  };
  return c;
}
test("Stripe SDK verifies raw body signatures and rejects tampering", async () => {
  const c = setup(),
    h = createWebhook(c),
    e = event("evt_sig", "checkout.session.completed", {
      id: "cs_test_fixture",
    });
  assert.equal(
    (await h(signed(e, JSON.stringify({ ...e, livemode: true })))).status,
    400,
  );
  assert.equal(
    (
      await h(
        new Request("https://test.invalid", { method: "POST", body: "{}" }),
      )
    ).status,
    400,
  );
  assert.equal(c.repo.rows.payments.length, 0);
});
test("payment confirmation, duplicates and out-of-order events", async () => {
  const c = setup(),
    h = createWebhook(c),
    e = event("evt_paid", "checkout.session.completed", {
      id: "cs_test_fixture",
    });
  assert.equal((await h(signed(e))).status, 200);
  assert.equal(c.repo.rows.payments[0].status, "paid");
  assert.equal((await h(signed(e))).status, 200);
  assert.equal(c.repo.rows.payments.length, 1);
  const count = c.repo.rows.notifications.length;
  assert.equal(
    (
      await h(
        signed(
          event("evt_old_failure", "checkout.session.async_payment_failed", {
            id: "cs_test_fixture",
          }),
        ),
      )
    ).status,
    200,
  );
  assert.equal(c.repo.rows.payments[0].status, "paid");
  assert.equal(c.repo.rows.notifications.length, count);
});
test("paid and failed subscription invoices keep monthly billing distinct from contract", async () => {
  const c = setup();
  c.repo.rows.offers[0].billing = "monthly";
  c.sessions.get("cs_test_fixture").subscription = "sub_test";
  let paid = true;
  c.stripe.subscriptions.retrieve = async () => ({
    id: "sub_test",
    customer: "cus_test",
    livemode: false,
    metadata: { portal_offer_id: ids.offer },
    status: paid ? "active" : "past_due",
    start_date: Math.floor(Date.parse("2026-01-31T12:00Z") / 1000),
    latest_invoice: "in_monthly",
    items: {
      data: [
        {
          price: { unit_amount: 200000 },
          current_period_end: Math.floor(Date.parse("2026-12-05") / 1000),
        },
      ],
    },
  });
  c.stripe.invoices.retrieve = async () => ({
    id: "in_monthly",
    customer: "cus_test",
    livemode: false,
    status: paid ? "paid" : "open",
    attempted: true,
    amount_paid: paid ? 200000 : 0,
    amount_due: 200000,
    currency: "usd",
    parent: {
      subscription_details: {
        subscription: "sub_test",
        metadata: { portal_offer_id: ids.offer },
      },
    },
    status_transitions: { paid_at: paid ? 1700000000 : null },
  });
  const h = createWebhook(c);
  assert.equal(
    (
      await h(
        signed(event("evt_subpaid", "invoice.paid", { id: "in_monthly" })),
      )
    ).status,
    200,
  );
  assert.equal(
    c.repo.rows.contract_terms[0].initial_term_end,
    "2026-04-30T12:00:00.000Z",
  );
  assert.equal(
    c.repo.rows.subscriptions[0].next_payment_at,
    "2026-12-05T00:00:00.000Z",
  );
  paid = false;
  assert.equal(
    (
      await h(
        signed(
          event("evt_subfailed", "invoice.payment_failed", {
            id: "in_monthly",
          }),
        ),
      )
    ).status,
    200,
  );
  assert.equal(c.repo.rows.subscriptions[0].status, "past_due");
  assert.equal(c.repo.rows.payments[0].status, "failed");
  assert.ok(
    c.repo.rows.notifications.some(
      (n) => n.subject === "Payment needs attention",
    ),
  );
});
test("database failure causes retry instead of acknowledgement", async () => {
  const c = setup();
  c.repo.rpc = async () => {
    throw Error("DB offline");
  };
  assert.equal(
    (
      await createWebhook(c)(
        signed(
          event("evt_db", "checkout.session.completed", {
            id: "cs_test_fixture",
          }),
        ),
      )
    ).status,
    503,
  );
  assert.equal(c.repo.rows.webhook_events.length, 0);
});
test("confirmed refunds stay refunded after stale payment events", async () => {
  const c = setup();
  const refunded = {
    id: "ch_test",
    customer: "cus_test",
    payment_intent: "pi_test",
    created: 1700000000,
    amount_refunded: 50000,
    receipt_url: "https://pay.stripe.com/receipts/test",
  };
  c.stripe.charges = { retrieve: async () => refunded };
  c.stripe.paymentIntents.retrieve = async () => ({
    id: "pi_test",
    customer: "cus_test",
    livemode: false,
    metadata: { portal_offer_id: ids.offer },
    status: "succeeded",
    amount: 200000,
    currency: "usd",
    latest_charge: refunded,
  });
  const h = createWebhook(c);
  assert.equal(
    (await h(signed(event("evt_refund", "charge.refunded", { id: "ch_test" }))))
      .status,
    200,
  );
  assert.equal(c.repo.rows.payments[0].status, "partially_refunded");
  assert.equal(c.repo.rows.payments[0].refunded_amount, 50000);
  await h(
    signed(
      event("evt_stale_paid", "checkout.session.completed", {
        id: "cs_test_fixture",
      }),
    ),
  );
  assert.equal(c.repo.rows.payments[0].refunded_amount, 50000);
  assert.equal(c.repo.rows.payments[0].status, "partially_refunded");
});
test("one-time card failures are recorded without marking the offer paid", async () => {
  const c = setup();
  c.sessions.get("cs_test_fixture").status = "open";
  c.stripe.paymentIntents.retrieve = async () => ({
    id: "pi_test",
    customer: "cus_test",
    livemode: false,
    metadata: { portal_offer_id: ids.offer },
    status: "requires_payment_method",
    amount: 200000,
    currency: "usd",
    last_payment_error: { code: "card_declined" },
  });
  assert.equal(
    (
      await createWebhook(c)(
        signed(
          event("evt_card_failed", "payment_intent.payment_failed", {
            id: "pi_test",
          }),
        ),
      )
    ).status,
    200,
  );
  assert.equal(c.repo.rows.payments[0].status, "failed");
  assert.equal(c.repo.rows.projects[0].status, "proposal");
  assert.ok(
    c.repo.rows.notifications.some(
      (n) => n.subject === "Payment needs attention",
    ),
  );
});
