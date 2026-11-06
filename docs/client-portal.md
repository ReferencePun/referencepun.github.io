# Private client portal

## Delivery status — November 6, 2026

The portal is connected locally to the **Transmission Media** Supabase project [`transmission-client-portal-test`](https://supabase.com/dashboard/project/bdecfvmwskddcsixphhd), in `us-east-1`, created with an approved $0/month quote on the Free plan. Migration `20261106132140_client_portal.sql` is applied, the private `client-agreements` bucket exists, and `portal-api`, `stripe-webhook`, and `portal-jobs` are deployed and active. All 14 portal tables have RLS enabled and deny anonymous reads. The local migration filename matches the hosted migration history.

`client/config.json` contains only this project's URL and public publishable key. Auth uses `https://dylanforsberg.com/client/` as its Site URL and permits only that exact redirect plus `http://127.0.0.1:4174/client/` for local testing. Public signup and anonymous sign-in are disabled, email confirmation is required, email links expire after 900 seconds, and TOTP is enabled. The seven nonpayment backend defaults from the configuration table are saved, with `Dylan.Forsberg@gmail.com` approved as the administrator/notification address, cancellation requests set to review, and renewal reminders disabled.

Stripe account **Transmission** is connected with test-mode access only. Dedicated billing configuration `bpc_1UYnTjHPkc6U1judas98QbV5` is active and saved in Supabase as `STRIPE_PORTAL_CONFIGURATION_ID`. It permits billing-detail/payment-method updates and invoice history, disables subscription price switching, and allows cancellation at the monthly billing-period end. The portal's separate contractual cancellation-review workflow is unchanged. Test webhook `we_1UYnU1HPkc6U1judueFWrObZ` is enabled at `https://bdecfvmwskddcsixphhd.supabase.co/functions/v1/stripe-webhook`, uses API version `2026-10-28.endive`, and subscribes to the 15 implemented events listed below. Both Stripe objects were retrieved again and verified as `livemode=false`. One clearly labeled synthetic test customer and one zero-dollar test invoice were later created for the connection check; neither has an email destination or payment method. No portal client/project/payment records, products, offers, subscriptions, card charges, or real payments were created.

The user saved all three Stripe credential values directly in Supabase; only their names and stored digests were inspected. The webhook signing-secret digest matches the created Stripe endpoint. A correctly signed synthetic unsupported event received HTTP 200; an invalid signature received HTTP 400. A subsequent real Stripe-generated `invoice.paid` event from the zero-dollar test invoice was delivered successfully to the account's only configured test webhook. Stripe reports zero pending deliveries and successful delivery, and Supabase recorded a POST to `stripe-webhook` returning HTTP 200. The deployed source matches the configured source and retrieves the invoice using the saved Stripe key before ignoring the event's absent portal-offer metadata. This verifies actual Stripe-initiated signed delivery and backend invoice-read authentication without modifying portal financial state. Publishable-key/account matching, a nonzero payment, Embedded Checkout, and subscription behavior remain unverified. No secret value has been written to the repository.

**Database/Storage backup and restore verification, frontend publication, and full checkout/subscription acceptance tests are still pending.** Custom SMTP and the required token-hash email templates are saved. The owner accepted a renewed administrator invitation and completed portal authenticator enrollment. Supabase confirms the email is verified, the portal administrator row exists, one TOTP factor is verified, and the current session has AAL2. The separate Supabase owner-account Security page also shows an enrolled authenticator. Invitations pointed to the local preview on this Mac; the normal production Site URL was restored after sending. Notification credentials match, the worker delivered a setup test email, and its five-minute schedule is active with a successful automatic run. No paid plan upgrade has been purchased. The public `/client/config.json` still returns 404; the portal implementation remains on a working branch. No nonzero payment or subscription lifecycle has been verified. Tax settings remain unchanged; automatic tax remains disabled, so tax treatment must be reviewed before live billing.

Resend is the selected email provider. Its current Free plan is $0/month for 3,000 emails/month, limited to 100/day ([pricing](https://resend.com/pricing)). Automated Stripe Projects initialization was rejected before execution because it accepted legal terms and created an external workspace without specific approval. A preview also confirmed that route needs a separate live-mode Stripe Projects sign-in. The owner instead completed Resend's own signup and terms acceptance; the authenticated Resend dashboard was verified. Resend reports both administrator invitations Delivered. The first expired before acceptance; the renewed invitation was accepted, and the owner confirmed sign-in and authenticator setup.

Resend domain `notify.dylanforsberg.com` (`6f5d35ff-f3a3-44ed-b651-208de976ea18`) is verified in `us-east-1`, with tracking off and receiving disabled. The sender is `Dylan Forsberg <portal@notify.dylanforsberg.com>`. After explicit owner approval, three new DNS records were saved in GoDaddy with one-hour TTLs: TXT `resend._domainkey.notify` with Resend's DKIM public key, CNAME `rsend.notify` → `rsend.forge.rmta.net`, and CNAME `send.notify` → `send.forge.rmta.net`. Public DNS returned the exact values, and Resend marked all three records and the domain Verified. Existing website and Zoho mail records were preserved; no optional root DMARC change was added. GoDaddy's original account sign-in succeeded after its Google sign-in redirect failed.

The owner created the Resend key from a sending-only form restricted to the verified domain, then entered it directly into Supabase. Custom SMTP is enabled with `smtp.resend.com`, port 465, username `resend`, and a stored hidden password. `RESEND_API_KEY` and `NOTIFICATION_FROM` have saved nonempty digests. The sender is `Dylan Forsberg <portal@notify.dylanforsberg.com>`. The delivered invitation verifies SMTP. A queued setup notification to the approved administrator address was sent through the deployed worker: HTTP 200, `sent: 1`, `emailConfigured: true`, a persisted provider ID, and Resend status Delivered. This verifies the separate notification API route. No private credential was read or written into the repository. Keep open/click tracking disabled for authentication emails.

Migration `20261106164411_portal_scheduler_extensions.sql` enables `pg_cron` and `pg_net`. Vault contains the public `portal_function_url` endpoint and a server-generated, 32-byte random `portal_job_secret`; only its length/digest were inspected. Anonymous and ordinary authenticated roles have no Vault schema access. The owner copied the token directly into `PORTAL_JOB_SECRET`; its stored digest matches Vault. Migration `20261106174753_portal_notification_schedule.sql` creates the five-minute `portal-notifications` job inactive for safe initial provisioning. The configured project has since activated it. Its automatic run at `2026-11-06T18:40:00Z` succeeded and the resulting HTTP request returned 200 with zero pending messages. An invalid worker bearer token still returns 401. Renewal reminders remain disabled.

The Supabase account Security page shows an enrolled Google Authenticator app, added by the owner, separately from the verified portal TOTP. The approved Free plan does not include automatic daily database backups; Supabase recommends regular off-site CLI exports ([backup documentation](https://supabase.com/docs/guides/platform/backups)). Database backups also exclude Storage file contents. No paid backup add-on or upgrade was enabled. Set up and test private database and document-file recovery before using real client records.

Verified after deployment: unsigned API and worker calls are rejected, unconfigured webhook requests are rejected, production/local CORS preflights succeed, other origins are rejected, direct anonymous client-table reads are denied, and the public Auth settings confirm signup is disabled. The portal build, all 20 local tests, and the mocked desktop/mobile browser suite pass. Browser fixtures now intercept config explicitly, so they do not depend on this project's real public configuration.

Supabase's health advisor is clear. Its security advisor flags three intentional, read-only ownership/MFA helper functions callable by signed-in users; these check the current user's identity and return booleans. Server-only tables intentionally have no client policies. Performance advisories identify unindexed foreign keys and a per-row Auth lookup; address these before the portal grows beyond the small-studio workload. These notices are not evidence of successful end-to-end acceptance.

This release rejects live Stripe keys in code. It cannot be turned into live billing merely by replacing environment variables. Do not invite real clients to pay until the test acceptance checklist below has been completed and live activation explicitly approved.

Implemented paths:

- Invitation-only email access using Supabase Auth; no password UI.
- Client-owned proposals, prices, agreements, payments, subscriptions, and contract terms.
- Administrator interface with mandatory authenticator verification (TOTP/AAL2).
- New clients, invitations, custom offers, additional one-time charges, and explicit proposal versions.
- Atomic proposal publication; accepted proposals and document records are immutable.
- Separate scope acceptance and confirmed contract execution. Uploading an unsigned file never satisfies the agreement gate.
- Private PDFs with SHA-256 record and 60-second download links issued after authorization.
- One-time and monthly Embedded Checkout using trusted server records, distributed locks, and persistent idempotency attempts.
- Authoritative signed webhooks, current-state reconciliation, transactional event deduplication, invoices, receipts, failures, and refunds.
- Dedicated Stripe customer billing portal; self-service subscription price changes are rejected.
- Separate three-month agreement records, cancellation requests, administrative scheduling, and optional renewal reminders.
- Durable notification queue with optional Resend delivery.

Not implemented: electronic signing, document generation, scheduling, crew assignments, milestones, production tracking, deliverable uploads, or automatic future price increases. Those can be added to the project/offer model without replacing payment or permission boundaries. External provider behavior and actual iPhone payments remain unverified until account setup.

## Existing architecture and checkpoint

The existing website is static HTML, CSS, and browser JavaScript. GitHub Pages publishes the `main` branch of `ReferencePun/referencepun.github.io`, using `_config.yml` and `CNAME`. The existing inquiry form posts to Formspree. There was no active backend, database, or authentication service. The old CMS configuration does not provide a payment backend.

Checkpoint: `checkpoint/before-client-portal-20261105`, commit `9062edb295375d830cadee1e19d2dfb161aa011b`.

The public website, navigation, prices page, galleries, reader, videos, and Formspree form are preserved. No public purchase buttons are added. Only `/client/` is new. Backend source and build tooling are excluded from the Pages artifact. This repository is public: **never put client records, signed agreements, environment secrets, or real test-client data into any repository file**.

## Hosting design

GitHub Pages cannot run authenticated Stripe server calls. Keep it as the public host and add one Supabase project for Auth, Postgres, private Storage, and Edge Functions. This avoids a second hosting provider solely for API functions.

```text
GitHub Pages /client/      Public shell, no client data
          │ signed-in Bearer token
          ▼
Supabase portal-api       Auth getUser + verified claims + ownership/AAL2
          ├── Postgres    RLS, immutable offers, contract terms, audit, outbox
          ├── Storage     Private agreement PDFs
          └── Stripe      Test customers, Embedded Checkout, billing portal
Stripe ── signed raw webhook ──► stripe-webhook ──► transactional state
Scheduled portal-jobs ──► optional Resend notifications / renewal reminders
```

No public-site host or DNS migration is required. The payment form is on `dylanforsberg.com/client/`; API calls use the Supabase project domain. Stripe may open payment authentication/redirect methods or its customer billing portal on Stripe's domain. No promise is made that every billing screen stays embedded.

Supabase may have hosting/storage/email costs. This setup uses the approved Free plans and project region; no paid upgrade or add-on has been enabled.

## 1. Create and secure the Supabase project

1. Create a dedicated project for portal testing, or use an existing suitable project after reviewing the migration. Keep live client data separate from tests.
2. Configure database backups and account MFA. The project owner is a highly privileged account.
3. Install the supported Supabase CLI and link from the repository root:

   ```sh
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   supabase db push
   ```

   Inspect the target project before running `db push`. The migration creates `portal_*` tables, policies, privileged server functions, and the private `client-agreements` bucket. It does not seed real clients or Stripe products.
4. In Auth, set Site URL to `https://dylanforsberg.com/client/` and allow that exact redirect. Add `http://127.0.0.1:4174/client/` only if testing the local shell. Disable public signup. Leave email login and TOTP MFA enabled. Use short-lived email links and configure email rate limits.
5. Configure a verified custom SMTP sender in Supabase Auth. The default development email service is not suitable for sending client invitations reliably. An email provider can supply both SMTP and notification sending.
6. **Customize both Auth email templates.** This implementation consumes token hashes in the fragment, removes them immediately, and verifies them with Auth. This also lets a client open the email on a different device. Use:

   Magic Link template:
   ```html
   <a href="{{ if .RedirectTo }}{{ .RedirectTo }}{{ else }}{{ .SiteURL }}{{ end }}#token_hash={{ .TokenHash }}&amp;type=email">Sign in to your client portal</a>
   ```
   Invite User template:
   ```html
   <a href="{{ if .RedirectTo }}{{ .RedirectTo }}{{ else }}{{ .SiteURL }}{{ end }}#token_hash={{ .TokenHash }}&amp;type=invite">Accept your client invitation</a>
   ```

   Do not use default implicit access-token fragment templates: the app intentionally does not consume those. Do not enable link tracking that rewrites or visits sign-in tokens. The portal also accepts PKCE callback codes, which require the requesting browser. If you enable Auth CAPTCHA later, wire its token into the login form first.
7. In the Auth dashboard, invite the studio administrator at the verified studio address. Copy that account's UUID and run this once in the private SQL editor:

   ```sql
   insert into public.portal_admins(user_id)
   values ('REPLACE_WITH_AUTH_USER_UUID'::uuid)
   on conflict do nothing;
   ```

   The administrator does not need a client record. Open the invitation after frontend/backend configuration and enroll an authenticator. Only an AAL2 session can administer data or issue private document links as administrator. Browser metadata cannot grant a role. Recovery from a lost authenticator must be handled by the authenticated project owner in Supabase, with identity verification; there is no public bypass.

## 2. Configure Stripe in a sandbox/test environment

Use your existing Stripe account's sandbox. Do not create live products or charges. The pinned official SDK is `stripe@23.1.0`, API version `2026-10-28.endive`; the browser loads Stripe.js `endive` and uses `createEmbeddedCheckoutPage`. Sessions use `ui_mode: embedded_page`.

1. Select the Stripe test environment. Configure your business name/branding and payment methods. The surrounding portal uses Garamond and the existing warm background; Stripe controls the payment fields. Choose supported Stripe branding/font settings rather than modifying payment inputs.
2. Store the test secret key and publishable key in Supabase Function Secrets. Never paste a real secret into chat, tracked files, browser JavaScript, or client config. Use the names in `supabase/functions/.env.example`. Supabase automatically supplies its URL, anon key, and service-role key to hosted functions; keep the service-role key server-only.
3. Create a **dedicated test Customer Portal configuration**. Enable payment-method/billing-information updates and invoice access. Disable subscription product/price/quantity switching. Decide permitted Stripe cancellation behavior after reviewing legal obligations and the agreement; the API does not silently disable cancellation rights. The contractual request form remains available separately.
4. Save that configuration ID as `STRIPE_PORTAL_CONFIGURATION_ID`. No product/price IDs need to be entered: each approved offer creates inline test price data at checkout. Reference rates in the admin UI do not create products or payment requests by themselves.
5. Add the eventual HTTPS webhook endpoint shown below in Stripe, with API version matching the backend, and save its signing secret as `STRIPE_WEBHOOK_SECRET`.

Amounts are integer US cents in trusted records. The client sends only an offer UUID. Tax, coupons, adjustable quantities, and adaptive currency pricing are disabled in this first version so the displayed charge is the approved amount. Agree any tax treatment and include it explicitly in the approved price before live use. This is not a tax calculation system.

## 3. Deploy the server functions and shell

Set secrets in the Supabase dashboard rather than shell command arguments/history. Required and optional configuration:

| Setting | Purpose |
| --- | --- |
| `PORTAL_ORIGIN` | Exact frontend origin, normally `https://dylanforsberg.com` |
| `PORTAL_EXTRA_ORIGINS` | Optional comma-separated explicit local test origins; no wildcard |
| `STRIPE_SECRET_KEY` | Private `sk_test_…` / appropriately scoped `rk_test_…` |
| `STRIPE_PUBLISHABLE_KEY` | Matching `pk_test_…` |
| `STRIPE_WEBHOOK_SECRET` | Signing secret for this deployed test webhook |
| `STRIPE_PORTAL_CONFIGURATION_ID` | Dedicated test billing portal configuration |
| `ADMIN_NOTIFICATION_EMAIL` | Studio notification recipient |
| `PORTAL_JOB_SECRET` | Strong random private token for scheduled jobs |
| `CANCELLATION_POLICY` | `review` by default; optionally `term_end` after review |
| `CANCELLATION_POLICY_REVIEWED` | Must also be `true` before term-end scheduling is automatic |
| `RENEWAL_REMINDERS_ENABLED` | `false` until delivery is configured and reviewed |
| `RENEWAL_REMINDER_DAYS` | Suggested `45` |
| `RESEND_API_KEY` | Optional private notification API key |
| `NOTIFICATION_FROM` | Optional verified sender, e.g. `Studio <billing@YOUR_VERIFIED_DOMAIN>` |

The deployed functions use Supabase's automatic `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`. For local function serving only, supply these in a private ignored environment file. `.env.example` contains placeholders only.

```sh
supabase functions deploy portal-api
supabase functions deploy stripe-webhook
supabase functions deploy portal-jobs
```

Gateway JWT verification is disabled in `config.toml` **because each function has its own authentication**: verified Auth user/claims for `portal-api`, raw Stripe signature for `stripe-webhook`, private bearer token for `portal-jobs`. Do not remove these internal checks.

Set the two **public** values in `client/config.json`:

```json
{
  "supabaseUrl": "https://YOUR_PROJECT_REF.supabase.co",
  "supabasePublishableKey": "sb_publishable_REPLACE_WITH_PUBLIC_KEY"
}
```

An anonymous legacy JWT key is also supported, but a service-role or secret key is never acceptable here. The build rejects secret-style keys and unexpected config fields. Then:

```sh
npm ci --prefix portal
npm run portal:build
npm run portal:test
npm ci
# Serve this repository at 127.0.0.1:4174 in another terminal.
python3 -m http.server 4174 --bind 127.0.0.1
# In your testing terminal:
npm run portal:test:browser
```

`client/portal.js` is a generated public bundle; commit it after source changes. Do not edit it directly. Stage the intended files, run `npm run site:config`, and run the public suite with `npm test`. Publishing the static shell continues through the existing reviewed GitHub Pages main-branch workflow; deploying functions is a separate explicit step. Do not migrate the public site.

## 4. Webhook endpoint and events

Endpoint:

```text
https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook
```

Subscribe to these test events:

```text
checkout.session.completed
checkout.session.async_payment_succeeded
checkout.session.async_payment_failed
checkout.session.expired
payment_intent.succeeded
payment_intent.payment_failed
payment_intent.processing
invoice.paid
invoice.payment_failed
customer.subscription.created
customer.subscription.updated
customer.subscription.deleted
charge.refunded
refund.created
refund.updated
```

The raw body is verified with the official SDK. A lease-owner check also prevents an expired webhook worker from committing over a newer worker. Stored metadata maps Stripe objects to private offers. The handler takes a per-project database lease, retrieves current Stripe state again inside that lease, and commits the snapshot, notifications, and processed event ID together. Failed persistence returns an error so Stripe retries. Duplicate delivery is harmless. Unrelated account events without portal offer metadata are ignored.

A return URL never marks a payment paid. The portal refreshes while confirmation arrives. A completed Checkout Session with a delayed webhook is blocked from creating a new checkout. The billing history distinguishes processing, failed, paid, and refunded status.

## 5. Email delivery and renewal reminders

Supabase Auth SMTP handles invitations/sign-in links. `portal-jobs` handles studio/client business notifications via Resend. Stripe receipt and failed-payment/recovery email settings should also be enabled in the test account as appropriate; actual test email behavior depends on provider settings.

Notifications are durably queued on proposal acceptance, confirmed payment/failure/refund, and cancellation requests/scheduling. Without the worker/provider, they remain visibly **queued**, not sent. Renewals are optional and disabled initially.

To schedule the worker, use Supabase Cron + `pg_net`. Store `portal_function_url` and `portal_job_secret` in **Supabase Vault** through the private dashboard; the URL value is `https://YOUR_PROJECT_REF.supabase.co/functions/v1/portal-jobs`. After enabling Cron/pg_net, this SQL contains no secret literals:

```sql
select cron.schedule(
 'portal-notifications', '*/5 * * * *',
 $$select net.http_post(
   url := (select decrypted_secret from vault.decrypted_secrets where name='portal_function_url'),
   headers := jsonb_build_object(
     'Content-Type','application/json',
     'Authorization','Bearer '||(select decrypted_secret from vault.decrypted_secrets where name='portal_job_secret')
   ),
   body := '{}'::jsonb,
   timeout_milliseconds := 90000
 );$$
);
```

Enable renewal reminders only after confirming delivery. One reminder per agreement renewal is queued once it enters the configured window; run the worker regularly. Email delivery uses provider idempotency; uncertain attempts older than 23 hours are marked `needs_review` instead of blindly resent. “Sent” means the provider accepted the email, not proven inbox delivery. Review the provider dashboard for bounce/delivery status. No generic agreement or legal notice text is generated as a replacement for your signed terms.

When provisioning from the included scheduler migration, the job starts inactive. After both private token copies match and the worker delivery test succeeds, activate the existing job without creating a second schedule:

```sql
select cron.alter_job(jobid, active := true)
from cron.job where jobname = 'portal-notifications';
```

## Studio workflow

1. Keep the public inquiry form and email discussion unchanged.
2. Sign in as administrator, complete authenticator verification, create the client, and send the invitation.
3. Create a project with client-specific scope, deliverables, payment terms, schedule, amount, and agreement version. Reference prices are only suggestions. Choose one-time billing for website projects unless a separate maintenance plan is approved.
4. The client reviews and accepts the private proposal. An accepted version cannot be edited. Replace only unaccepted primary offers; add a separate one-time offer for additional charges. A replacement recurring agreement/rate requires a new approved project/offer and deliberate reconciliation of the old subscription, not an invisible price change.
5. Sign the actual agreement separately. Upload its PDF and confirm execution with the date/time and evidence note. Agreement files are append-only and private. Optional unsigned drafts can be attached first. No checkbox is represented as a contract signature.
6. The client pays through Embedded Checkout after scope acceptance and the agreement gate. The monthly rate, renewal terms, and cancellation notice are displayed before activation.
7. Webhooks confirm payment; the client can view invoices/receipts and open Manage Billing. Schedule production by email for now.

The admin UI does not issue refunds or manually charge a saved payment method. Process any separately approved refund in Stripe; its webhook updates the portal. Approved extra work gets a separate client-approved offer and checkout. There are no arbitrary off-session charges.

## Contract term and cancellation behavior

Monthly invoices and contract terms are separate records. Contract boundaries use calendar months anchored to the original effective date, including month-end/leap-year behavior. Notice is measured in whole 24-hour days from the boundary, in UTC; confirm the signed agreement's timezone/boundary interpretation before use. A blank effective date starts the term on subscription creation. An explicit date must match the agreement. Monthly checkout with a specified effective date is allowed only on that date (UTC), preventing immediate monthly billing before or after the agreed start. A missed start requires a new approved proposal/agreement, not a hidden date change. No retroactive installments or prorated trial charges are inferred.

Default cancellation policy: always accept the electronic request, record its timestamp and requested earlier date, queue receipt/admin notice, and display a proposed agreement end. The administrator reviews applicable rights and schedules the approved termination date in Stripe. Stripe is instructed to use that exact date, not simply the next monthly period end. Automated term-end scheduling additionally requires both policy flags and is bypassed when the client requests an earlier date.

Do not use these configurable dates as legal advice or a reason to deny a legally required cancellation. Review the agreement and applicable rules before enabling automatic scheduling. Cancellation does not automatically calculate refunds or prorate; any required refund must be handled explicitly. A cancellation made through Stripe or its billing portal is reflected by webhook, even if it differs from the usual contract date. Signed contract status is never changed by successful payment alone.

If Stripe scheduling fails, the requested date/review remain stored and the request remains awaiting scheduling. Retry the same recorded date. Changing an ambiguous scheduling attempt to another date requires administrator reconciliation in Stripe first. Do not represent a queued request as a confirmed cancellation.

## Failure recovery and operational checks

- An invitation that expires before first acceptance must be renewed by the studio administrator through Supabase Auth's invitation action. With public signup disabled, a normal OTP request for an invited but unconfirmed account returned `422: Signups not allowed for this instance`; the portal intentionally conceals account-existence errors. Renewing the invitation for the existing address worked without creating a duplicate account. Keep public signup disabled and do not manually confirm an email to bypass invitation verification.
- In Stripe, monitor webhook failures and replay failed events after resolving configuration/database errors. A completed return page is not payment evidence.
- A checkout attempt without a recorded Stripe session after a network/database interruption retries with the same persisted idempotency key. A very old ambiguous attempt is blocked for review. Search Stripe by `portal_offer_id`, `portal_project_id`, and idempotency request history, record the confirmed session/status, or mark the attempt expired **only after proving there is no active/completed session/subscription**. Never delete the attempt to bypass duplicate protection.
- Stripe session expiry is fixed when the attempt is created. If no remote session exists and that creation window has expired, reconcile and expire that local attempt before retrying; the client cannot bypass this protection.
- Review `portal_notifications` with `queued`, `sending`, or `needs_review` status. Do not claim a delivery from a queue row alone.
- After billing changes outside the portal, verify the signed webhook updated the dashboard. A mismatched Stripe subscription price queues an admin alert; the portal never silently edits the client's accepted price.
- The notification worker queries only pending messages in batches of 30; administration shows the most recent 100 notifications. Other initial history views retrieve bounded provider result sets (Supabase's default row limit). It is intended for a small private studio, not thousands of records per client. Add paginated history/admin views before those limits are approached.
- Treat Auth accounts, service-role access, database backups, and PDF retention as private business records. Verify restores, rotate compromised keys, and keep dependencies current. GitHub Pages cannot supply custom response security headers such as `frame-ancestors`; the shell includes a strict meta CSP, no-referrer, and no third-party analytics. If stricter browser security headers become necessary, add an explicitly approved proxy/hosting capability without silently moving the public site.

## Test coverage and acceptance

Automated local tests run with synthetic records, no real clients:

- Real PostgreSQL engine (PGlite): migration, RLS isolation, no anonymous reads/client financial writes, MFA admin policies, immutable proposals, atomic publication/event rollback and deduplication.
- API tests: identity/ownership, amount/price/client tampering, agreement version gate, concurrent checkout/reuse, live-key rejection, contract dates, earlier cancellation requests, scheduling retry, signed download authorization, dedicated billing configuration.
- Official Stripe SDK: valid raw-body webhook signatures and tampering rejection. Stripe API responses are simulated for confirmed/failed/refunded payments, duplicates, stale events, and persistence failure.
- Browser tests: invitation screen, proposal acceptance, agreement gate, simulated checkout mounting/closing, billing/cancellation navigation, admin MFA gate, desktop and mobile widths. Stripe and Auth responses are intercepted; these are **not** real payment or email tests.
- Existing public website suite and comparison against the checkpoint protect the public pages. Deno validates the three function entry points; the browser bundle builds separately.

After configuring providers, complete and record this **real test-mode acceptance checklist** before live approval:

1. Invite two test users. Confirm each can receive/open a single-use sign-in link, including a phone; expired/used links fail. Confirm sign-out.
2. Verify client A cannot read client B's project/document through the API or direct database API; verify an ordinary user and an admin without TOTP cannot administer.
3. Create one-time and monthly custom-price offers. Confirm pending scope/unsigned agreement block checkout. Record a real test agreement execution only when actually confirmed.
4. Submit payment with Stripe's official test card `4242 4242 4242 4242`, future expiry, and test CVC. Confirm exact amount, currency, receipt/invoice, and webhook payment state. No real card details.
5. Exercise Stripe's documented decline and authentication-required test methods. Confirm no paid status on failed/pending payments and successful recovery through Manage Billing.
6. Double-click/reload payment; verify only one active session/subscription. Replay a signed event and deliver an older event; verify no duplicate payment or notification.
7. Use Stripe Billing testing/test clocks on a dedicated test subscription to verify subsequent invoices, failure handling, and cancellation. Confirm monthly next-charge dates differ from the separate three-month renewal.
8. Request nonrenewal before/after the deadline and an earlier termination. Confirm admin notification, visible request receipt, exact scheduled date, and webhook-confirmed completion. Test a refund and PDF/receipt access.
9. Open Embedded Checkout and any enabled redirect payment methods on an actual iPhone in Safari and a desktop browser. Verify authentication return, no horizontal scrolling, and matching business branding. A hosted Checkout fallback has not been enabled; if a required method proves incompatible, add an explicitly tested server-selected fallback using the same ownership/amount/idempotency safeguards.
10. Verify SMTP and Resend delivery, renewal reminders, Stripe receipt/failure notices, webhook retry monitoring, private storage permissions, and no secrets in published files.

Use [Stripe's official testing documentation](https://docs.stripe.com/testing) for current cards and simulated failures. A succeeded API fixture is not evidence of a real Stripe payment.

## Safely moving to live billing later

This release intentionally stops at test mode. First complete the real acceptance checklist and obtain explicit approval for live billing. Then make a small reviewed release that allows a deliberate live environment, uses a separate live database/customer/configuration namespace, validates that all keys/objects/webhooks share that mode, and changes client labels accordingly. Do not mix test customers/subscriptions with live keys or remove the mode guard casually.

Before that release, confirm actual agreement/cancellation policy, taxes, privacy/retention requirements, verified senders, Stripe business/payment-method settings, backups, monitoring, and customer portal permissions. Provision live secrets only in provider settings, create the live webhook/configuration, repeat noncharging configuration checks, and approve the first live transaction separately. Do not generate live products, offers, or subscriptions automatically from the reference catalogue.

## Official implementation references

- [Stripe Embedded Checkout](https://docs.stripe.com/payments/accept-a-payment?payment-ui=checkout&ui=embedded-page)
- [Stripe webhooks](https://docs.stripe.com/webhooks)
- [Stripe cancellation dates](https://docs.stripe.com/billing/subscriptions/cancel)
- [Stripe customer portal configuration](https://docs.stripe.com/customer-management/configure-portal)
- [Supabase passwordless email authentication](https://supabase.com/docs/guides/auth/auth-email-passwordless)
- [Supabase Edge Function dependencies](https://supabase.com/docs/guides/functions/dependencies)
- [Supabase private Storage access](https://supabase.com/docs/guides/storage/security/access-control)
