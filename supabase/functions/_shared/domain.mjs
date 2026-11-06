export class PortalError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
export const fail = (status, message) => {
  throw new PortalError(status, message);
};
export const uuid = (v) => {
  if (
    typeof v !== "string" ||
    !/^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(
      v,
    )
  )
    fail(400, "Invalid record.");
  return v;
};
export function text(v, max = 6000, required = true) {
  if (typeof v !== "string" || v.length > max || (required && !v.trim()))
    fail(400, "Please complete the required fields within their limits.");
  return v.trim();
}
export function only(body, keys) {
  if (
    !body ||
    Array.isArray(body) ||
    Object.keys(body).some((k) => !keys.includes(k))
  )
    fail(400, "Unexpected request fields.");
}
export function amount(v) {
  if (!Number.isSafeInteger(v) || v <= 0 || v > 100000000)
    fail(400, "Enter an amount between $0.01 and $1,000,000.");
  return v;
}
export function timestamp(v) {
  const d = new Date(v);
  if (!v || !Number.isFinite(+d)) fail(400, "Enter a valid date and time.");
  return d.toISOString();
}
export function isoDate(v) {
  if (!v) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v) || timestamp(v).slice(0, 10) !== v)
    fail(400, "Enter a valid date.");
  return v;
}
export function addMonths(input, count) {
  const d = new Date(input),
    day = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + count);
  const last = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0),
  ).getUTCDate();
  d.setUTCDate(Math.min(day, last));
  return d;
}
export function contractWindow(
  effective,
  months = 3,
  notice = 30,
  now = new Date(),
) {
  const start = new Date(effective);
  if (!Number.isFinite(+start)) fail(400, "Invalid contract start.");
  let term = 0;
  while (+addMonths(start, (term + 1) * months) <= +now) term++;
  const current = addMonths(start, term * months),
    end = addMonths(start, (term + 1) * months);
  return {
    effective_at: start.toISOString(),
    initial_term_end: addMonths(start, months).toISOString(),
    current_term_start: current.toISOString(),
    renewal_at: end.toISOString(),
    cancellation_deadline: new Date(+end - notice * 86400000).toISOString(),
  };
}
export function cancellationDate(term, offer, requestedAt) {
  const t = new Date(requestedAt);
  return t <= new Date(term.cancellation_deadline)
    ? term.renewal_at
    : contractWindow(
        term.effective_at,
        offer.term_months,
        offer.notice_days,
        new Date(term.renewal_at),
      ).renewal_at;
}
export function approvedOffer(o, agreements) {
  if (o.state !== "accepted")
    fail(409, "Review and accept this proposal before payment.");
  if (
    o.requires_agreement &&
    !agreements.some(
      (a) =>
        a.offer_id === o.id &&
        a.status === "signed" &&
        a.version === o.agreement_version &&
        a.signed_at,
    )
  )
    fail(
      409,
      "Payment becomes available after the signed agreement is confirmed.",
    );
  amount(Number(o.amount));
  if (!["monthly", "one_time"].includes(o.billing) || o.currency !== "usd")
    fail(409, "The approved price needs administrator review.");
}
export function stripeMode(env) {
  const key = env.STRIPE_SECRET_KEY || "";
  // This release deliberately cannot make live charges. Enabling live billing needs a reviewed code change.
  if (!key.startsWith("sk_test_") && !key.startsWith("rk_test_"))
    fail(503, "Test payments are not configured.");
  if (!env.STRIPE_PUBLISHABLE_KEY?.startsWith("pk_test_"))
    fail(503, "Test checkout is not configured.");
  return "test";
}
export function checkoutParams(o, project, customer, attempt, origin) {
  const metadata = {
    portal_offer_id: o.id,
    portal_project_id: project.id,
    portal_client_id: project.client_id,
  };
  const params = {
    mode: o.billing === "monthly" ? "subscription" : "payment",
    ui_mode: "embedded_page",
    customer,
    client_reference_id: o.id,
    metadata,
    adaptive_pricing: { enabled: false },
    automatic_tax: { enabled: false },
    allow_promotion_codes: false,
    return_url: origin + "/client/?checkout={CHECKOUT_SESSION_ID}",
    expires_at: Math.floor(new Date(attempt.expires_at).getTime() / 1000),
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: o.currency,
          unit_amount: Number(o.amount),
          product_data: { name: project.title + " — " + o.service },
          ...(o.billing === "monthly"
            ? { recurring: { interval: "month" } }
            : {}),
        },
      },
    ],
  };
  if (o.billing === "monthly")
    params.subscription_data = {
      metadata,
      description: `Proposal v${o.version}; ${o.term_months}-month agreement, billed monthly; ${o.notice_days}-day notice. Agreement ${o.agreement_version}.`,
    };
  else {
    params.payment_intent_data = { metadata };
    params.invoice_creation = { enabled: true, invoice_data: { metadata } };
  }
  return params;
}
export const references = [
  { service: "Digital Photography", monthly: 200000, standalone: 240000 },
  { service: "Film Photography", monthly: 250000, standalone: 300000 },
  { service: "Video Production", monthly: 200000, standalone: 240000 },
  { service: "20 Social Media Visuals", monthly: 50000, standalone: 60000 },
  { service: "Squarespace Website", partner: 200000, standalone: 240000 },
  { service: "Custom Website", partner: 300000, standalone: 360000 },
  { service: "Creative Direction & Custom Productions" },
];
export function validateOffer(b, actor, project, version) {
  const billing = b.billing;
  if (!["monthly", "one_time"].includes(billing))
    fail(400, "Select a billing type.");
  const kind = b.kind || "primary";
  if (
    !["primary", "additional"].includes(kind) ||
    (kind === "additional" && billing !== "one_time")
  )
    fail(
      400,
      "Additional charges must be separately approved one-time offers.",
    );
  const months = Number(b.term_months ?? 3),
    notice = Number(b.notice_days ?? 30);
  if (
    !Number.isInteger(months) ||
    months < 1 ||
    months > 36 ||
    !Number.isInteger(notice) ||
    notice < 0 ||
    notice > 365
  )
    fail(400, "Invalid agreement term.");
  return {
    project_id: project,
    version,
    kind,
    service: text(b.service, 160),
    description: text(b.description),
    deliverables: text(b.deliverables),
    production_schedule: text(b.production_schedule || "", 2000, false),
    amount: amount(b.amount),
    currency: "usd",
    billing,
    payment_terms: text(b.payment_terms, 2000),
    term_months: months,
    notice_days: notice,
    effective_date: isoDate(b.effective_date),
    agreement_version: text(b.agreement_version, 100),
    requires_agreement: b.requires_agreement !== false,
    created_by: actor,
    state: "published",
  };
}
export const stripeId = (o) => (typeof o === "string" ? o : o?.id);
export const isoUnix = (s) => (s ? new Date(s * 1000).toISOString() : null);
