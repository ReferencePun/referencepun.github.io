import { fail } from "../../supabase/functions/_shared/domain.mjs";
export const ids = {
  user: "11111111-1111-4111-8111-111111111111",
  other: "22222222-2222-4222-8222-222222222222",
  admin: "33333333-3333-4333-8333-333333333333",
  client: "44444444-4444-4444-8444-444444444444",
  project: "55555555-5555-4555-8555-555555555555",
  offer: "66666666-6666-4666-8666-666666666666",
};
export const baseOffer = {
  id: ids.offer,
  project_id: ids.project,
  version: 1,
  kind: "primary",
  service: "Video Production",
  description: "A privately approved film.",
  deliverables: "One finished film.",
  production_schedule: "To be agreed",
  amount: 200000,
  currency: "usd",
  billing: "one_time",
  payment_terms: "Payment in advance.",
  term_months: 3,
  notice_days: 30,
  effective_date: null,
  agreement_version: "2026-01",
  requires_agreement: true,
  state: "accepted",
  created_by: ids.admin,
  accepted_by: ids.user,
  accepted_at: "2026-11-05T12:00:00Z",
};
export function memoryRepo(overrides = {}) {
  const rows = {
    admins: [{ user_id: ids.admin }],
    clients: [
      {
        id: ids.client,
        user_id: ids.user,
        email: "client@example.test",
        name: "Test Client",
        stripe_customer_id: "cus_test",
      },
    ],
    projects: [
      {
        id: ids.project,
        client_id: ids.client,
        title: "Test film",
        status: "proposal",
      },
    ],
    offers: [structuredClone(baseOffer)],
    agreements: [
      {
        id: "77777777-7777-4777-8777-777777777777",
        offer_id: ids.offer,
        status: "signed",
        version: "2026-01",
        signed_at: "2026-11-05T10:00:00Z",
        file_path: "private/document.pdf",
      },
    ],
    checkout_attempts: [],
    payments: [],
    subscriptions: [],
    contract_terms: [],
    cancellations: [],
    webhook_events: [],
    notifications: [],
    audit: [],
    ...overrides,
  };
  const locks = new Set(),
    match = (r, f) => Object.entries(f).every(([k, v]) => r[k] === v);
  return {
    async queuedNotifications() {
      return rows.notifications
        .filter((n) => ["queued", "sending"].includes(n.status))
        .slice(0, 30);
    },
    async recentNotifications() {
      return rows.notifications.slice(-100).reverse();
    },
    rows,
    async all(t, f = {}) {
      return structuredClone((rows[t] || []).filter((r) => match(r, f)));
    },
    async one(t, f) {
      return (await this.all(t, f))[0] || null;
    },
    async insert(t, v) {
      const n = {
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        ...(t === "checkout_attempts"
          ? {
              status: "creating",
              expires_at: new Date(Date.now() + 3600000).toISOString(),
            }
          : {}),
        ...(t === "cancellations"
          ? { status: "requested", requested_at: new Date().toISOString() }
          : {}),
        ...v,
      };
      rows[t].push(n);
      return structuredClone(n);
    },
    async update(t, f, v) {
      rows[t].filter((r) => match(r, f)).forEach((r) => Object.assign(r, v));
      return this.all(t, f);
    },
    async audit(actor, action, id) {
      rows.audit.push({ actor, action, id });
    },
    async notify(n) {
      if (!rows.notifications.some((v) => v.dedupe_key === n.dedupe_key))
        rows.notifications.push({ ...n, status: "queued" });
    },
    async lock(k, fn) {
      if (locks.has(k)) fail(409, "Busy");
      locks.add(k);
      try {
        return await fn();
      } finally {
        locks.delete(k);
      }
    },
    async owner(id, user, admin = false) {
      const offer = await this.one("offers", { id });
      if (!offer) fail(404, "Not found");
      const project = await this.one("projects", { id: offer.project_id }),
        client = await this.one("clients", { id: project.client_id });
      if (!admin && client.user_id !== user) fail(404, "Not found");
      return { offer, project, client };
    },
    async rpc(name, p) {
      if (name === "create_cancellation") {
        const r = await this.insert("cancellations", p.request_doc);
        for (const n of p.notices) await this.notify(n);
        return r;
      }
      if (name !== "apply_event") throw Error("Unexpected RPC");
      if (rows.webhook_events.some((e) => e.id === p.event_id)) return;
      for (const [key, table] of [
        ["payment", "payments"],
        ["subscription", "subscriptions"],
        ["term", "contract_terms"],
      ])
        if (p.changes[key]) {
          const v = p.changes[key],
            field = key === "term" ? "offer_id" : "id",
            prev = rows[table].find((r) => r[field] === v[field]);
          if (prev) Object.assign(prev, v);
          else rows[table].push(v);
        }
      if (p.changes.checkout)
        await this.update(
          "checkout_attempts",
          { stripe_session_id: p.changes.checkout.id },
          { status: p.changes.checkout.status },
        );
      if (p.changes.project)
        await this.update(
          "projects",
          { id: p.changes.project.id },
          { status: p.changes.project.status },
        );
      for (const n of p.changes.notifications || []) await this.notify(n);
      rows.webhook_events.push({ id: p.event_id });
    },
  };
}
export function context(overrides = {}) {
  const repo = overrides.repo || memoryRepo(),
    calls = [],
    sessions = new Map();
  const env = {
    STRIPE_SECRET_KEY: "sk_test_placeholder",
    STRIPE_PUBLISHABLE_KEY: "pk_test_placeholder",
    STRIPE_WEBHOOK_SECRET: "whsec_fixture_only",
    PORTAL_ORIGIN: "https://dylanforsberg.com",
    ADMIN_NOTIFICATION_EMAIL: "admin@example.test",
    STRIPE_PORTAL_CONFIGURATION_ID: "bpc_fixture",
    ...overrides.env,
  };
  const stripe = {
    customers: { create: async () => ({ id: "cus_test" }) },
    subscriptions: {
      list: () => ({ async *[Symbol.asyncIterator]() {} }),
      update: async (id, p) => {
        calls.push(["cancel", id, p]);
        return { id, ...p };
      },
      cancel: async (id) => {
        calls.push(["cancel", id]);
        return { id };
      },
    },
    checkout: {
      sessions: {
        create: async (params, opts) => {
          calls.push(["checkout", params, opts]);
          await new Promise((r) => setTimeout(r, 15));
          const s = {
            id: "cs_test_fixture",
            client_secret: "test_client_secret",
            status: "open",
            livemode: false,
            customer: "cus_test",
            metadata: { portal_offer_id: ids.offer },
          };
          sessions.set(s.id, s);
          return s;
        },
        retrieve: async (id) => sessions.get(id),
      },
    },
    billingPortal: {
      configurations: {
        retrieve: async () => ({
          id: "bpc_fixture",
          features: { subscription_update: { enabled: false } },
        }),
      },
      sessions: {
        create: async (p) => {
          calls.push(["portal", p]);
          return { url: "https://billing.stripe.com/p/session/test" };
        },
      },
    },
    ...overrides.stripe,
  };
  const auth = {
    auth: {
      getUser: async (token) =>
        token === "invalid"
          ? { error: {} }
          : {
              data: {
                user: {
                  id:
                    token === "admin"
                      ? ids.admin
                      : token === "other"
                        ? ids.other
                        : ids.user,
                  email: "client@example.test",
                  user_metadata: { role: "admin" },
                },
              },
            },
      getClaims: async (token) => ({
        data: {
          claims: {
            sub:
              token === "admin"
                ? ids.admin
                : token === "other"
                  ? ids.other
                  : ids.user,
            aal: overrides.aal || "aal2",
          },
        },
      }),
    },
  };
  return { repo, env, stripe, auth, calls, sessions, db: {}, ...overrides };
}
export const request = (action, body = {}, token = "client") =>
  new Request("https://example.supabase.co/functions/v1/portal-api/" + action, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://dylanforsberg.com",
      ...(token ? { Authorization: "Bearer " + token } : {}),
    },
    body: JSON.stringify(body),
  });
