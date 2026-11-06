import { createClient } from "@supabase/supabase-js";
const content = document.querySelector("#portal-content"),
  message = document.querySelector("#portal-message"),
  signOut = document.querySelector("#sign-out");
const escape = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const money = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: Number(n) % 100 ? 2 : 0,
  }).format(Number(n) / 100);
const date = (d) =>
  d
    ? new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeZone: "UTC",
      }).format(new Date(d))
    : "To be agreed";
const title = (s) => String(s || "pending").replaceAll("_", " ");
let supabase,
  config,
  state,
  checkout,
  mfaFactor,
  viewGeneration = 0;
function status(text, error = false) {
  message.textContent = text;
  message.classList.toggle("error", error);
  if (error) message.scrollIntoView({ block: "nearest" });
}
function validURL(url) {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:") return "";
    if (u.hostname.endsWith(".stripe.com") || u.origin === config?.supabaseUrl)
      return u.href;
  } catch {}
  return "";
}
const link = (url, label) =>
  validURL(url)
    ? `<a href="${escape(validURL(url))}" target="_blank" rel="noopener noreferrer">${escape(label)}</a>`
    : "";
async function api(action, body = {}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Please sign in again.");
  const response = await fetch(
    config.supabaseUrl + "/functions/v1/portal-api/" + action,
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + session.access_token,
        apikey: config.supabasePublishableKey,
        ...(body instanceof FormData
          ? {}
          : { "Content-Type": "application/json" }),
      },
      body: body instanceof FormData ? body : JSON.stringify(body),
      cache: "no-store",
    },
  );
  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error("The portal is temporarily unavailable. Please try again.");
  }
  if (!response.ok)
    throw new Error(result.error || "This request could not be completed.");
  return result;
}
function login(available = true) {
  viewGeneration++;
  state = null;
  signOut.hidden = true;
  content.innerHTML = `<section class="login-panel"><p class="eyebrow">Client access</p><h1>A private space<br>for your project.</h1><p>Review proposals, agreements, and billing in one place.</p>${available ? `<form id="login-form"><label>Email address<input name="email" type="email" required autocomplete="email" maxlength="254"></label><button>Send secure sign-in link</button><small>Access is by invitation. Use the email address associated with your project.</small></form>` : `<p class="notice">Client access is being prepared. Please contact Dylan for your project details.</p>`}<p class="section"><a href="mailto:Dylan.Forsberg@gmail.com">Dylan.Forsberg@gmail.com</a></p></section>`;
  document
    .querySelector("#login-form")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();
      await busy(e.submitter, async () => {
        const email = new FormData(e.target).get("email");
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            shouldCreateUser: false,
            emailRedirectTo: location.origin + "/client/",
          },
        });
        // Never disclose whether an address is a client. Provider rate limits/CAPTCHA are configured in Auth.
        status(
          error?.status === 429
            ? "Please wait a minute before requesting another link."
            : "If this email has a client invitation, a secure sign-in link will arrive shortly.",
        );
      });
    });
}
async function busy(button, fn) {
  if (button) button.disabled = true;
  try {
    status("");
    await fn();
  } catch (e) {
    status(e.message || "Unable to complete this request.", true);
  } finally {
    if (button) button.disabled = false;
  }
}
async function load() {
  state = await api("state");
  signOut.hidden = false;
  if (state.needsMfa) {
    await mfa();
    return;
  }
  render();
  if (new URLSearchParams(location.search).has("checkout")) {
    history.replaceState(null, "", "/client/#billing");
    status(
      "Your payment status is being verified. Only confirmed Stripe payments appear as paid.",
    );
    let tries = 0;
    const interval = setInterval(async () => {
      if (++tries > 6 || !state) {
        clearInterval(interval);
        return;
      }
      try {
        state = await api("state");
        render();
      } catch {
        clearInterval(interval);
      }
    }, 5000);
  }
}
function render() {
  viewGeneration++;
  const section = location.hash.slice(1) || "overview";
  const name =
    state.role === "admin" ? "Studio administration" : state.clients[0]?.name;
  content.innerHTML = `<div class="portal-intro"><div><p class="eyebrow">${state.role === "admin" ? "Private studio" : "Client portal"}</p><h1>${escape(name)}</h1></div><p class="muted">Test mode · No live payments</p></div><nav class="portal-nav" aria-label="Client portal">${["Overview", "Projects", "Agreements", "Billing", ...(state.role === "admin" ? ["Administration"] : [])].map((n) => `<a href="#${n.toLowerCase()}" ${section === n.toLowerCase() ? 'aria-current="page"' : ""}>${n}</a>`).join("")}</nav><div id="view">${section === "projects" ? projects() : section === "agreements" ? agreements() : section === "billing" ? billing() : section === "administration" && state.role === "admin" ? admin() : overview()}</div>`;
  bind();
}
function overview() {
  return `<section class="editorial-row"><h2>Your projects</h2><div>${state.projects.length ? state.projects.map((p) => `<p><a href="#projects">${escape(p.title)}</a><br><small>${escape(title(p.status))}</small></p>`).join("") : "<p>Your approved project proposals will appear here.</p>"}</div></section><section class="editorial-row"><h2>Agreements & billing</h2><div><p>Review the scope and agreed price before accepting a proposal. Proposal approval is separate from signing your agreement.</p><p>Where an agreement is required, payment opens after its signed copy has been confirmed.</p><div class="actions"><a href="#agreements">Review agreements</a><a href="#billing">View billing</a></div></div></section>${state.terms.map((term) => termBlock(term)).join("")}`;
}
function termBlock(t) {
  return `<section class="editorial-row"><h3>${escape(state.projects.find((p) => p.id === state.offers.find((o) => o.id === t.offer_id)?.project_id)?.title)}<br><small>Contract term</small></h3><div><dl class="facts"><dt>Effective date</dt><dd>${date(t.effective_at)}</dd><dt>Initial term ends</dt><dd>${date(t.initial_term_end)}</dd><dt>Current term</dt><dd>${date(t.current_term_start)}–${date(t.renewal_at)}</dd><dt>Renewal date</dt><dd>${date(t.renewal_at)}</dd><dt>Notice deadline</dt><dd>${date(t.cancellation_deadline)}</dd><dt>Agreed monthly rate</dt><dd>${money(t.monthly_amount)}</dd><dt>Status</dt><dd>${escape(title(t.status))}</dd>${t.termination_at ? `<dt>Termination date</dt><dd>${date(t.termination_at)}</dd>` : ""}</dl><p><small>The monthly payment cycle and the contract term are separate. Price changes require a new approval.</small></p>${state.role === "client" && t.status === "active" ? `<button data-cancel="${t.offer_id}">Request cancellation or nonrenewal</button>` : ""}</div></section>`;
}
function projects() {
  return state.projects.length
    ? state.projects
        .map(
          (p) =>
            `<details class="project"><summary><h2>${escape(p.title)}</h2><span>${escape(title(p.status))}</span></summary>${state.offers
              .filter((o) => o.project_id === p.id)
              .sort((a, b) => b.version - a.version)
              .map((o) => offer(o))
              .join("")}</details>`,
        )
        .join("")
    : "<p>No projects yet.</p>";
}
function offer(o) {
  const signed = state.agreements.some(
    (a) =>
      a.offer_id === o.id &&
      a.status === "signed" &&
      a.version === o.agreement_version,
  );
  const paid = state.payments.some(
    (p) =>
      p.offer_id === o.id &&
      ["paid", "refunded", "partially_refunded"].includes(p.status),
  );
  const subscribed = state.subscriptions.some(
    (s) =>
      s.offer_id === o.id &&
      !["canceled", "incomplete_expired"].includes(s.status),
  );
  return `<article class="offer"><div class="offer-heading"><h3>${escape(o.service)} <small>Proposal ${o.version}${o.kind === "additional" ? " · Additional charge" : ""}</small></h3><p class="amount">${money(o.amount)}${o.billing === "monthly" ? "/month" : " · one-time"}</p></div><p class="muted">${escape(title(o.state))}</p><div class="offer-grid"><div><h4>Scope</h4><p class="prewrap">${escape(o.description)}</p><h4>Included deliverables</h4><p class="prewrap">${escape(o.deliverables)}</p><h4>Production schedule</h4><p class="prewrap">${escape(o.production_schedule || "To be agreed after approval and payment.")}</p></div><div><h4>Payment & agreement</h4><p class="prewrap">${escape(o.payment_terms)}</p>${o.billing === "monthly" ? `<p>Billed monthly in advance. ${o.term_months}-month commitment, renewing in successive ${o.term_months}-month terms. At least ${o.notice_days} days’ notice before renewal.</p><p>Contract start: ${o.effective_date ? date(o.effective_date) : "On subscription activation"}. The accepted rate is guaranteed for the initial term. Any future price change requires your agreement.</p>` : ""}<p>Agreement ${escape(o.agreement_version)}: ${signed ? "signed copy confirmed" : o.requires_agreement ? "signature required" : "not required for this offer"}.</p><p><small>Additional expenses require a separate approved offer.</small></p></div></div>${state.role === "client" && o.state !== "superseded" ? `<div class="actions">${o.state !== "accepted" ? `<button data-accept="${o.id}">Accept this proposal</button><small>Accepts scope and price; does not sign the agreement.</small>` : paid || subscribed ? "<span>View confirmed payment details under Billing.</span>" : !o.requires_agreement || signed ? `<button data-pay="${o.id}">${o.billing === "monthly" ? "Start monthly billing" : "Pay agreed amount"}</button>` : "<p>Payment will open after the signed agreement is confirmed.</p>"}</div>` : ""}</article>`;
}
function agreements() {
  return `<h2>Agreements</h2>${state.agreements.length ? state.agreements.map((a) => `<div class="billing-row"><div>${escape(state.projects.find((p) => p.id === state.offers.find((o) => o.id === a.offer_id)?.project_id)?.title)}<br><small>Agreement ${escape(a.version)}</small></div><div>${escape(a.status === "signed" ? "Signed" : "Awaiting signature")}</div><div>${a.signed_at ? date(a.signed_at) : "—"}</div><div><button data-document="${a.id}">Download ${a.status === "signed" ? "signed " : ""}PDF</button></div></div>`).join("") : "<p>Your client-specific agreement will appear here when it is attached.</p>"}<p class="notice">Agreements are signed separately. This portal records confirmed execution and stores your document securely.</p>`;
}
function billing() {
  return `<div class="offer-heading"><h2>Billing</h2>${state.role === "client" ? '<button id="manage-billing">Manage billing</button>' : ""}</div><p class="muted">Invoices, receipts, and payment methods are managed securely by Stripe.</p>${state.subscriptions.map((s) => `<p>${escape(state.projects.find((p) => p.id === s.project_id)?.title)} · ${escape(title(s.status))}<br><small>Next monthly payment: ${s.status === "canceled" || (s.cancel_at && new Date(s.cancel_at) <= new Date(s.next_payment_at)) ? "None scheduled" : date(s.next_payment_at)}${s.cancel_at ? " · Scheduled cancellation: " + date(s.cancel_at) : ""}</small></p>`).join("")}${
    state.payments.length
      ? state.payments
          .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
          .map(
            (p) =>
              `<div class="billing-row"><div>${escape(state.projects.find((pr) => pr.id === state.offers.find((o) => o.id === p.offer_id)?.project_id)?.title)}<br><small>${p.paid_at ? date(p.paid_at) : "Awaiting payment"}</small></div><div>${money(p.amount)}</div><div>${escape(title(p.status))}${p.refunded_amount ? `<br><small>${money(p.refunded_amount)} refunded</small>` : ""}</div><div>${link(p.invoice_url, "Invoice")}${link(p.invoice_pdf, "Download PDF")}${link(p.receipt_url, "Receipt")}</div></div>`,
          )
          .join("")
      : "<p>No payment history yet. Payments appear after confirmation from Stripe.</p>"
  }${state.terms.map(termBlock).join("")}${state.cancellations.length ? `<h3>Cancellation requests</h3>${state.cancellations.map((c) => `<p>Received ${date(c.requested_at)} · ${escape(title(c.status))}<br><small>${c.status !== "requested" && c.effective_termination_at ? "Confirmed end: " + date(c.effective_termination_at) : "Proposed agreement end: " + date(c.proposed_termination_at) + " · Awaiting review"}</small></p>`).join("")}` : ""}`;
}
const options = (rows, key, label) =>
  rows
    .map(
      (r) => `<option value="${escape(r[key])}">${escape(label(r))}</option>`,
    )
    .join("");
function admin() {
  return `<h2>Studio administration</h2><p>Create a private offer only after discussing the project and price with the client.</p>
 <details class="admin-panel"><summary>Clients & invitations</summary><form id="client-create"><div class="form-grid"><label>Client / business name<input name="name" required maxlength="200"></label><label>Client email<input name="email" required type="email" maxlength="254"></label></div><button>Create client</button></form><ul class="client-list">${state.clients.map((c) => `<li><span>${escape(c.name)}<br><small>${escape(c.email)}</small></span><button data-invite="${c.id}">${c.user_id ? "Send sign-in link" : "Send secure invitation"}</button></li>`).join("")}</ul></details>
 <details class="admin-panel"><summary>New project or approved charge</summary><form id="offer-create"><div class="form-grid"><label>Action<select name="action"><option value="new">New project</option><option value="additional">Additional one-time charge</option><option value="revision">Replace an unaccepted proposal</option></select></label><label>Existing project (for charges / revisions)<select name="project_id"><option value="">Select project</option>${options(state.projects, "id", (p) => p.title)}</select></label><label>Client (new project)<select name="client_id"><option value="">Select client</option>${options(state.clients, "id", (c) => c.name)}</select></label><label>Project title (new project)<input name="title" maxlength="200"></label><label>Service<select name="service">${options(state.references, "service", (r) => r.service)}</select></label><label>Billing<select name="billing"><option value="one_time">One-time</option><option value="monthly">Monthly in advance</option></select></label><label>Agreed price (USD)<input name="amount" type="number" min="0.01" max="1000000" step="0.01" required></label><label>Agreement version<input name="agreement_version" required placeholder="e.g. Studio services 2026-01" maxlength="100"></label><label class="form-wide">Service description<textarea name="description" required maxlength="6000"></textarea></label><label class="form-wide">Included deliverables<textarea name="deliverables" required maxlength="6000"></textarea></label><label class="form-wide">Payment terms<textarea name="payment_terms" required maxlength="2000"></textarea></label><label class="form-wide">Production schedule, if agreed<textarea name="production_schedule" maxlength="2000"></textarea></label><label>Contract term (months)<input name="term_months" value="3" type="number" min="1" max="36"></label><label>Notice before renewal (days)<input name="notice_days" value="30" type="number" min="0" max="365"></label><label>Effective date (optional)<input name="effective_date" type="date"><small>Blank: starts when the monthly subscription activates. A specific date must match the signed agreement; monthly checkout opens only on that date (UTC).</small></label><label class="check"><input name="requires_agreement" type="checkbox" checked>Require a confirmed signed agreement before payment</label></div><p id="reference-price" class="notice"></p><button>Publish private proposal</button></form></details>
 <details class="admin-panel"><summary>Attach an agreement</summary><form id="agreement-upload"><div class="form-grid"><label>Project & proposal<select name="offer_id" required><option value="">Select proposal</option>${options(
   state.offers.filter((o) => o.state !== "superseded"),
   "id",
   (o) =>
     state.projects.find((p) => p.id === o.project_id)?.title +
     " · v" +
     o.version,
 )}</select></label><label>PDF document<input name="file" type="file" accept="application/pdf" required></label><label>Status<select name="status"><option value="unsigned">Unsigned agreement</option><option value="signed">Executed agreement</option></select></label><label>Execution date & time (local)<input name="signed_at" type="datetime-local"></label><label class="form-wide">Confirmation note<textarea name="confirmation_note" maxlength="2000" placeholder="How execution was confirmed; signing provider or email reference."></textarea></label><label class="check form-wide"><input name="confirmed" type="checkbox" value="yes">I have confirmed actual execution of this agreement. Uploading a file alone does not mark it signed.</label></div><button>Store private agreement</button></form></details>
 <details class="admin-panel"><summary>Cancellation & renewal requests</summary>${state.cancellations.length ? state.cancellations.map((c) => `<article class="offer"><h3>${escape(state.projects.find((p) => p.id === state.offers.find((o) => o.id === c.offer_id)?.project_id)?.title)}</h3><p>Received ${date(c.requested_at)} · ${escape(title(c.status))}</p><p class="prewrap">${escape(c.reason || "No additional reason supplied.")}</p><p>Proposed end: ${date(c.proposed_termination_at)}${c.requested_termination_at ? " · Requested earlier end: " + date(c.requested_termination_at) : ""}</p>${c.status === "requested" ? `<form class="cancel-review"><input type="hidden" name="request_id" value="${c.id}"><label>Approved termination date & time<input name="effective_date" type="datetime-local" required value="${c.effective_termination_at ? escape(new Date(new Date(c.effective_termination_at).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)) : ""}" ${c.effective_termination_at ? "readonly" : ""}></label><label>Review note<textarea name="note" required maxlength="2000"></textarea></label><button>Confirm & schedule termination</button></form>` : ""}</article>`).join("") : "<p>No requests yet.</p>"}</details>
 <details class="admin-panel"><summary>Notification delivery</summary>${state.notifications.length ? state.notifications.map((n) => `<p>${escape(n.subject)} · ${escape(title(n.status))}<br><small>${escape(n.recipient)} · ${date(n.created_at)}</small></p>`).join("") : "<p>No queued notifications.</p>"}<p class="muted">Queued messages require the configured email provider and scheduled worker. “Sent” records provider acceptance, not inbox delivery.</p></details>`;
}
function bind() {
  document.querySelectorAll("[data-accept]").forEach(
    (b) =>
      (b.onclick = () =>
        busy(b, async () => {
          if (
            !confirm(
              "Accept the scope and price in this proposal? This does not sign your agreement.",
            )
          )
            return;
          await api("accept", { offer_id: b.dataset.accept });
          await load();
          status(
            "Proposal accepted. Your agreement status is shown separately.",
          );
        })),
  );
  document
    .querySelectorAll("[data-pay]")
    .forEach((b) => (b.onclick = () => busy(b, () => pay(b.dataset.pay))));
  document.querySelectorAll("[data-document]").forEach(
    (b) =>
      (b.onclick = () =>
        busy(b, async () => {
          const r = await api("agreement-download", {
            agreement_id: b.dataset.document,
          });
          if (!validURL(r.url)) throw new Error("Document link unavailable.");
          location.assign(r.url);
        })),
  );
  document.querySelector("#manage-billing")?.addEventListener("click", (e) =>
    busy(e.target, async () => {
      const r = await api("billing");
      if (!validURL(r.url)) throw new Error("Billing link unavailable.");
      location.assign(r.url);
    }),
  );
  document
    .querySelectorAll("[data-cancel]")
    .forEach((b) => (b.onclick = () => cancelForm(b.dataset.cancel)));
  document.querySelectorAll("[data-invite]").forEach(
    (b) =>
      (b.onclick = () =>
        busy(b, async () => {
          await api("invite", { client_id: b.dataset.invite });
          await load();
          status(
            "The sign-in email was submitted to the authentication provider.",
          );
        })),
  );
  const clientForm = document.querySelector("#client-create");
  if (clientForm)
    clientForm.onsubmit = (e) => {
      e.preventDefault();
      busy(e.submitter, async () => {
        await api(
          "client-create",
          Object.fromEntries(new FormData(clientForm)),
        );
        await load();
        status("Client created. Open Clients & invitations to send access.");
      });
    };
  const form = document.querySelector("#offer-create");
  if (form) {
    const price = () => {
      const r = state.references.find(
        (r) => r.service === form.elements.service.value,
      );
      document.querySelector("#reference-price").textContent = r?.standalone
        ? `Reference only: standalone ${money(r.standalone)}${r.monthly ? ", founding monthly " + money(r.monthly) : ", partner " + money(r.partner)}. Enter the client’s explicitly agreed amount above.`
        : "Enter the individually approved quote. No automatic price is selected.";
    };
    form.elements.service.onchange = price;
    price();
    form.onsubmit = (e) => {
      e.preventDefault();
      busy(e.submitter, async () => {
        const values = Object.fromEntries(new FormData(form)),
          action = values.action;
        const offer = {
          ...values,
          amount: Math.round(Number(values.amount) * 100),
          requires_agreement: form.elements.requires_agreement.checked,
          term_months: Number(values.term_months),
          notice_days: Number(values.notice_days),
          kind: action === "additional" ? "additional" : "primary",
        };
        delete offer.action;
        delete offer.client_id;
        delete offer.project_id;
        delete offer.title;
        if (action === "new")
          await api("project-create", {
            client_id: values.client_id,
            title: values.title,
            offer,
          });
        else
          await api("offer-create", { project_id: values.project_id, offer });
        await load();
        status(
          "Private proposal saved. The client must accept it before payment.",
        );
      });
    };
  }
  const agreementForm = document.querySelector("#agreement-upload");
  if (agreementForm)
    agreementForm.onsubmit = (e) => {
      e.preventDefault();
      busy(e.submitter, async () => {
        const data = new FormData(agreementForm);
        if (data.get("signed_at"))
          data.set("signed_at", new Date(data.get("signed_at")).toISOString());
        await api("agreement-upload", data);
        await load();
        status("Agreement stored privately.");
      });
    };
  document.querySelectorAll(".cancel-review").forEach(
    (f) =>
      (f.onsubmit = (e) => {
        e.preventDefault();
        busy(e.submitter, async () => {
          const b = Object.fromEntries(new FormData(f));
          b.effective_date = new Date(b.effective_date).toISOString();
          if (
            !confirm("Schedule this subscription to end on the approved date?")
          )
            return;
          await api("cancel-review", b);
          await load();
          status("Termination scheduling confirmed.");
        });
      }),
  );
}
function cancelForm(id) {
  const view = document.querySelector("#view");
  view.innerHTML = `<h2>Cancellation or nonrenewal request</h2><p>Your request is recorded immediately. The studio will confirm the effective termination date under your agreement and any applicable cancellation rights.</p><form id="cancel-form"><label>Notes or reason (optional)<textarea name="reason" maxlength="2000"></textarea></label><label>Requested termination date (optional)<input name="requested_date" type="date"><small>You may request an earlier date where applicable. Leaving this blank requests the next eligible agreement end.</small></label><div class="actions"><button>Submit request</button><a href="#billing" id="cancel-back">Back to billing</a></div></form>`;
  document.querySelector("#cancel-back").onclick = (e) => {
    e.preventDefault();
    location.hash = "billing";
    render();
  };
  const form = document.querySelector("#cancel-form");
  form.onsubmit = (e) => {
    e.preventDefault();
    busy(e.submitter, async () => {
      const r = await api("cancel", {
        offer_id: id,
        ...Object.fromEntries(new FormData(form)),
      });
      location.hash = "billing";
      await load();
      status(
        "Request received on " +
          date(r.requested_at) +
          ". " +
          (r.status !== "requested" && r.effective_termination_at
            ? "Confirmed end: " + date(r.effective_termination_at)
            : "Proposed end: " +
              date(r.proposed_termination_at) +
              ". The studio will confirm scheduling."),
      );
    });
  };
  window.scrollTo(0, 0);
}
async function pay(id) {
  const generation = ++viewGeneration;
  const o = state.offers.find((o) => o.id === id);
  content.querySelector("#view").innerHTML =
    `<h2>Secure payment</h2><p>${money(o.amount)}${o.billing === "monthly" ? " per month, billed in advance" : " one-time"}</p>${o.billing === "monthly" ? `<p>${o.term_months}-month agreement. ${o.notice_days}-day notice before renewal. Price changes require your approval.</p>` : ""}<p class="notice">Stripe test mode. Use test payment details only.</p><a href="#projects" id="close-checkout">Back to projects</a><div id="checkout-container"></div>`;
  document.querySelector("#close-checkout").onclick = (e) => {
    e.preventDefault();
    checkout?.destroy();
    checkout = null;
    render();
  };
  if (!window.Stripe)
    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://js.stripe.com/endive/stripe.js";
      script.onload = resolve;
      script.onerror = () =>
        reject(new Error("Secure checkout could not load. Please try again."));
      document.head.append(script);
    });
  if (generation !== viewGeneration) return;
  const result = await api("checkout", { offer_id: id });
  if (generation !== viewGeneration) return;
  checkout?.destroy();
  const embedded = await window
    .Stripe(result.publishableKey)
    .createEmbeddedCheckoutPage({
      fetchClientSecret: async () => result.clientSecret,
    });
  if (generation !== viewGeneration) {
    embedded.destroy();
    return;
  }
  checkout = embedded;
  checkout.mount("#checkout-container");
  window.scrollTo(0, 0);
}
async function mfa() {
  const { data, error } = await supabase.auth.mfa.listFactors();
  if (error) throw error;
  mfaFactor = data.totp?.find((f) => f.status === "verified")?.id;
  let qr = "";
  if (!mfaFactor) {
    for (const f of data.totp || [])
      if (f.status !== "verified")
        await supabase.auth.mfa.unenroll({ factorId: f.id });
    const enrolled = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "Studio administration",
    });
    if (enrolled.error) throw enrolled.error;
    mfaFactor = enrolled.data.id;
    qr = `<p>Scan this code with your authenticator app, then enter the six-digit code.</p><img class="mfa-qr" alt="Authenticator setup QR code" src="${escape(enrolled.data.totp.qr_code)}">`;
  }
  content.innerHTML = `<section class="login-panel"><p class="eyebrow">Administrator verification</p><h1>Secure studio access.</h1>${qr}<form id="mfa-form"><label>Authenticator code<input name="code" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}" maxlength="6" required></label><button>Verify & continue</button></form></section>`;
  document.querySelector("#mfa-form").onsubmit = (e) => {
    e.preventDefault();
    busy(e.submitter, async () => {
      const { error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: mfaFactor,
        code: new FormData(e.target).get("code"),
      });
      if (error)
        throw new Error(
          "That code could not be verified. Please try the current code.",
        );
      await load();
    });
  };
}
signOut.onclick = () =>
  busy(signOut, async () => {
    checkout?.destroy();
    checkout = null;
    await supabase.auth.signOut();
    history.replaceState(null, "", "/client/");
    status("");
    login();
  });
window.addEventListener("hashchange", () => {
  if (state && !state.needsMfa) {
    checkout?.destroy();
    checkout = null;
    render();
  }
});
async function start() {
  config = await (
    await fetch("/client/config.json", { cache: "no-store" })
  ).json();
  if (
    !/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(config.supabaseUrl) ||
    !config.supabasePublishableKey
  ) {
    login(false);
    return;
  }
  supabase = createClient(config.supabaseUrl, config.supabasePublishableKey, {
    auth: {
      flowType: "pkce",
      storage: sessionStorage,
      persistSession: true,
      detectSessionInUrl: false,
      autoRefreshToken: true,
    },
  });
  const token = new URLSearchParams(location.hash.slice(1));
  if (token.has("token_hash")) {
    const hash = token.get("token_hash"),
      type = token.get("type");
    history.replaceState(null, "", "/client/");
    if (!["email", "invite"].includes(type))
      throw new Error("This sign-in link is invalid.");
    const { error } = await supabase.auth.verifyOtp({ token_hash: hash, type });
    if (error)
      throw new Error(
        "This link has expired or has already been used. Request a new sign-in link.",
      );
  }
  const code = new URLSearchParams(location.search).get("code");
  if (code) {
    history.replaceState(null, "", "/client/");
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error)
      throw new Error(
        "Please open the sign-in link in the same browser where it was requested, or request a new link.",
      );
  }
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session) await load();
  else login();
  supabase.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_OUT") {
      checkout?.destroy();
      checkout = null;
      login();
    }
  });
}
start().catch((e) => {
  login(!!supabase);
  status(e.message || "Secure access could not load. Please try again.", true);
});
