import test from "node:test";
import assert from "node:assert/strict";
import { createAPI } from "../../supabase/functions/_shared/api.mjs";
import {
  contractWindow,
  addMonths,
  cancellationDate,
  stripeMode,
} from "../../supabase/functions/_shared/domain.mjs";
import { context, ids, request, baseOffer } from "./support.mjs";
test("authentication, ownership and administrator MFA", async () => {
  const c = context(),
    api = createAPI(c);
  assert.equal((await api(request("state", {}, null))).status, 401);
  assert.equal((await api(request("state", {}, "invalid"))).status, 401);
  assert.equal(
    (await api(request("checkout", { offer_id: ids.offer }, "other"))).status,
    404,
  );
  assert.equal(
    (await api(request("client-create", { name: "Evil", email: "x@y.test" })))
      .status,
    403,
  );
  const noMfa = createAPI(context({ aal: "aal1" }));
  assert.equal(
    (
      await noMfa(
        request("client-create", { name: "A", email: "a@b.test" }, "admin"),
      )
    ).status,
    403,
  );
  assert.deepEqual(await (await noMfa(request("state", {}, "admin"))).json(), {
    role: "admin",
    needsMfa: true,
  });
  const bad = request("state");
  bad.headers.set("Origin", "https://evil.test");
  assert.equal((await api(bad)).status, 403);
  assert.equal(c.calls.length, 0);
});
test("amount tampering, agreement and scope gates; payment not marked on return", async () => {
  const c = context(),
    api = createAPI(c);
  for (const extra of [
    { amount: 1 },
    { price_id: "price_cheap" },
    { client_id: ids.other },
  ])
    assert.equal(
      (await api(request("checkout", { offer_id: ids.offer, ...extra })))
        .status,
      400,
    );
  c.repo.rows.offers[0].state = "published";
  assert.equal(
    (await api(request("checkout", { offer_id: ids.offer }))).status,
    409,
  );
  c.repo.rows.offers[0].state = "accepted";
  c.repo.rows.agreements = [];
  assert.equal(
    (await api(request("checkout", { offer_id: ids.offer }))).status,
    409,
  );
  c.repo.rows.agreements = [
    {
      offer_id: ids.offer,
      version: "old",
      status: "signed",
      signed_at: "2026-01-01",
    },
  ];
  assert.equal(
    (await api(request("checkout", { offer_id: ids.offer }))).status,
    409,
  );
  c.repo.rows.agreements[0].version = "2026-01";
  assert.equal(
    (await api(request("checkout", { offer_id: ids.offer }))).status,
    200,
  );
  const p = c.calls[0][1];
  assert.equal(p.line_items[0].price_data.unit_amount, 200000);
  assert.equal(p.customer, "cus_test");
  assert.equal(p.ui_mode, "embedded_page");
  assert.equal(p.invoice_creation.enabled, true);
  assert.equal(c.repo.rows.payments.length, 0);
});
test("parallel clicks, retries and existing subscriptions prevent duplicate charges", async () => {
  const c = context(),
    api = createAPI(c);
  c.repo.rows.offers[0].billing = "monthly";
  const r = await Promise.all([
    api(request("checkout", { offer_id: ids.offer })),
    api(request("checkout", { offer_id: ids.offer })),
  ]);
  assert.deepEqual(r.map((x) => x.status).sort(), [200, 409]);
  assert.equal(
    (await api(request("checkout", { offer_id: ids.offer }))).status,
    200,
  );
  assert.equal(c.calls.filter((x) => x[0] === "checkout").length, 1);
  assert.equal(
    c.calls[0][1].line_items[0].price_data.recurring.interval,
    "month",
  );
  c.sessions.get("cs_test_fixture").status = "complete";
  assert.equal(
    (await api(request("checkout", { offer_id: ids.offer }))).status,
    409,
  );
  assert.equal(c.repo.rows.payments.length, 0);
  c.repo.rows.subscriptions.push({
    id: "sub_exists",
    project_id: ids.project,
    status: "past_due",
  });
  assert.equal(
    (await api(request("checkout", { offer_id: ids.offer }))).status,
    409,
  );
});
test("live keys fail closed", () => {
  assert.throws(() =>
    stripeMode({
      STRIPE_SECRET_KEY: "sk_live_placeholder",
      STRIPE_PUBLISHABLE_KEY: "pk_live_placeholder",
    }),
  );
  assert.throws(() =>
    stripeMode({
      STRIPE_SECRET_KEY: "sk_test_placeholder",
      STRIPE_PUBLISHABLE_KEY: "pk_live_placeholder",
    }),
  );
});
test("three-month terms, leap years, original monthly anchor and notice deadline", () => {
  assert.equal(
    addMonths("2024-01-31T12:00:00Z", 1).toISOString(),
    "2024-02-29T12:00:00.000Z",
  );
  const t = contractWindow(
    "2026-01-31T12:00:00Z",
    3,
    30,
    new Date("2026-05-01"),
  );
  assert.equal(t.current_term_start, "2026-04-30T12:00:00.000Z");
  assert.equal(t.renewal_at, "2026-07-31T12:00:00.000Z");
  assert.equal(t.cancellation_deadline, "2026-07-01T12:00:00.000Z");
  assert.equal(
    cancellationDate(t, baseOffer, new Date("2026-07-01T12:00:00Z")),
    t.renewal_at,
  );
  assert.equal(
    cancellationDate(t, baseOffer, new Date("2026-07-01T12:00:01Z")),
    "2026-10-31T12:00:00.000Z",
  );
});
test("durable cancellation requests accept earlier dates and default to review", async () => {
  const c = context(),
    api = createAPI(c);
  c.repo.rows.offers[0].billing = "monthly";
  c.repo.rows.subscriptions.push({
    id: "sub_test",
    offer_id: ids.offer,
    project_id: ids.project,
    status: "active",
  });
  c.repo.rows.contract_terms.push({
    offer_id: ids.offer,
    effective_at: "2026-11-05T12:00:00Z",
  });
  const r = await api(
    request("cancel", {
      offer_id: ids.offer,
      reason: "Earlier termination please",
      requested_date: "2026-11-06",
    }),
  );
  assert.equal(r.status, 200);
  assert.equal((await r.json()).status, "requested");
  assert.equal(c.repo.rows.cancellations.length, 1);
  assert.equal(c.repo.rows.notifications.length, 2);
  assert.equal(c.calls.length, 0);
  await api(request("cancel", { offer_id: ids.offer }));
  assert.equal(c.repo.rows.cancellations.length, 1);
});
test("billing portal blocks self-service price changes and binds Stripe customer", async () => {
  const c = context(),
    api = createAPI(c);
  assert.equal((await api(request("billing"))).status, 200);
  assert.equal(c.calls[0][1].customer, "cus_test");
  c.stripe.billingPortal.configurations.retrieve = async () => ({
    features: { subscription_update: { enabled: true } },
  });
  assert.equal((await api(request("billing"))).status, 503);
});
test("private data response excludes other clients and internal storage paths", async () => {
  const c = context();
  c.repo.rows.clients.push({
    id: ids.other,
    user_id: ids.other,
    name: "Other",
    email: "other@example.test",
  });
  c.repo.rows.projects.push({
    id: ids.other,
    client_id: ids.other,
    title: "Private",
  });
  const body = await (await createAPI(c)(request("state"))).json();
  assert.equal(body.clients.length, 1);
  assert.equal(body.projects.length, 1);
  assert.equal(body.agreements[0].file_path, undefined);
  assert.equal(body.clients[0].stripe_customer_id, undefined);
});
test("cancellation preserves original month-end and validates dates", async () => {
  const t = contractWindow("2026-01-31T12:00Z", 3, 30, new Date("2026-04-10"));
  assert.equal(
    cancellationDate(t, baseOffer, new Date("2026-04-10")),
    "2026-07-31T12:00:00.000Z",
  );
  const c = context();
  c.repo.rows.subscriptions.push({
    id: "sub_test",
    offer_id: ids.offer,
    status: "active",
  });
  c.repo.rows.contract_terms.push({
    offer_id: ids.offer,
    effective_at: "2026-11-05T00:00:00Z",
  });
  assert.equal(
    (
      await createAPI(c)(
        request("cancel", {
          offer_id: ids.offer,
          requested_date: "not-a-date",
        }),
      )
    ).status,
    400,
  );
  assert.equal(c.repo.rows.cancellations.length, 0);
});
test("signed documents remain private, including administrator MFA", async () => {
  const c = context();
  let downloads = 0;
  c.db = {
    storage: {
      from: () => ({
        createSignedUrl: async (path, ttl) => {
          downloads++;
          assert.equal(ttl, 60);
          assert.equal(path, "private/document.pdf");
          return {
            data: {
              signedUrl:
                "https://example.supabase.co/storage/v1/object/sign/test",
            },
          };
        },
      }),
    },
  };
  const body = { agreement_id: c.repo.rows.agreements[0].id },
    api = createAPI(c);
  assert.equal(
    (await api(request("agreement-download", body, "other"))).status,
    404,
  );
  assert.equal(downloads, 0);
  assert.equal((await api(request("agreement-download", body))).status, 200);
  assert.equal(downloads, 1);
  const weak = context({ aal: "aal1", db: c.db });
  assert.equal(
    (await createAPI(weak)(request("agreement-download", body, "admin")))
      .status,
    403,
  );
});
test("cancellation scheduling keeps the chosen date after a Stripe timeout", async () => {
  const c = context();
  c.repo.rows.offers[0].billing = "monthly";
  c.repo.rows.subscriptions.push({
    id: "sub_test",
    offer_id: ids.offer,
    project_id: ids.project,
    status: "active",
  });
  c.repo.rows.contract_terms.push({
    offer_id: ids.offer,
    effective_at: "2026-11-05T12:00:00Z",
  });
  const api = createAPI(c);
  const record = await (
    await api(request("cancel", { offer_id: ids.offer }))
  ).json();
  const original = c.stripe.subscriptions.update;
  c.stripe.subscriptions.update = async () => {
    throw Error("timeout");
  };
  const b = {
    request_id: record.id,
    effective_date: "2027-02-05T12:00:00Z",
    note: "Confirmed against signed agreement.",
  };
  assert.equal((await api(request("cancel-review", b, "admin"))).status, 500);
  assert.equal(c.repo.rows.cancellations[0].status, "requested");
  assert.equal(
    c.repo.rows.cancellations[0].effective_termination_at,
    "2027-02-05T12:00:00.000Z",
  );
  assert.equal(
    (
      await api(
        request(
          "cancel-review",
          { ...b, effective_date: "2027-03-05T12:00:00Z" },
          "admin",
        ),
      )
    ).status,
    409,
  );
  c.stripe.subscriptions.update = original;
  assert.equal((await api(request("cancel-review", b, "admin"))).status, 200);
  assert.equal(c.calls[0][2].cancel_at, Date.parse(b.effective_date) / 1000);
  assert.equal(c.calls[0][2].cancel_at_period_end, undefined);
});
test("dated contracts cannot silently begin monthly charges outside their agreed start date", async () => {
  const c = context(),
    api = createAPI(c);
  c.repo.rows.offers[0].billing = "monthly";
  for (const effective_date of ["2020-01-01", "2099-01-01"]) {
    c.repo.rows.offers[0].effective_date = effective_date;
    assert.equal(
      (await api(request("checkout", { offer_id: ids.offer }))).status,
      409,
    );
  }
  assert.equal(c.calls.length, 0);
  c.repo.rows.offers[0].effective_date = new Date().toISOString().slice(0, 10);
  assert.equal(
    (await api(request("checkout", { offer_id: ids.offer }))).status,
    200,
  );
});
