# Services page inquiries

The page remains at `/services.html`, with `noindex, nofollow` and no incoming navigation links from other pages. Its own **Inquire** navigation link opens the inquiry form on the same page.

## Current mode: email drafts

No email-form backend was present in this static GitHub Pages site. `data-form-endpoint` on `#inquiry-form` is intentionally empty. No account was created and no subscription purchased.

The form validates name, email, and project description, defaults to email communication, and reveals optional phone and calling-time fields only for **Phone call**. It builds a complete draft addressed to **Dylan.Forsberg@gmail.com**, with a subject of **New Project Inquiry — [Service] — [Client Name]**.

**Prepare Email Draft** displays a full, copyable draft and a `mailto:` link. The client must open their email app, review the message, and send it themselves. This mode never claims that a message was sent. Some email apps truncate long `mailto:` links, so the complete copyable draft is always available and longer messages get a specific copy/paste reminder. If JavaScript is disabled, a direct email link remains available.

Client details are not placed in the page URL, logged, or saved to browser storage. No scheduling, new tracking, mailing list, or account creation is included in the client flow.

## Enable direct delivery with Formspree

This requires the site owner's account and recipient verification. Do not put account passwords, API keys, SMTP credentials, or CAPTCHA secrets in the repository.

1. Sign in to [Formspree](https://formspree.io/) with an owner-controlled account. Create a form and verify **Dylan.Forsberg@gmail.com** as its target email. Confirm email notifications are enabled. See [HTML form setup](https://help.formspree.io/articles/building-your-form/building-an-html-form/).
2. Keep hosted CAPTCHA/spam protection enabled and restrict the form to the production domain in its settings. The form includes a `_gotcha` honeypot and a local honeypot check; browser checks are supplemental, not a substitute for server-side filtering and rate limits. See [honeypot filtering](https://help.formspree.io/articles/building-your-form/honeypot-spam-filtering/).
3. Copy the **public form endpoint**, such as `https://formspree.io/f/FORM_ID`, from the Integration tab. Replace only `data-form-endpoint=""` on `#inquiry-form` in `services.html` with the real endpoint. Do not paste an email address or API token there. The enhancement accepts only HTTPS Formspree `/f/` endpoints.
4. The button becomes **Send Inquiry**. Valid submissions use an ordinary HTTPS form POST to Formspree, which handles its hosted spam verification and confirmation/error page. This avoids requiring a separate CAPTCHA integration or third-party JavaScript. A draft fallback remains available. The local page only reports a handoff; it never displays an unverified success message or interprets URL parameters as proof of delivery.
5. The `email` field provides the client's reply address; `subject` provides the explicit subject; `message` contains all fields with readable labels. Optional call details are omitted when Email is selected. See [reply-to fields](https://help.formspree.io/articles/building-your-form/email-reply-to-address/) and [subject lines](https://help.formspree.io/articles/building-your-form/email-subject-line/).
6. Test using a clearly labeled inquiry from an address you control. Complete the hosted challenge, confirm the provider's receipt page, then check the actual inbox and spam folder. Reply to verify the reply-to address. Check that the service, name, timeline, and communication preference appear correctly. Do not consider an HTTP handoff or a mocked test proof of inbox delivery.
7. If delivery fails, keep the endpoint empty until resolved, or return to the form and choose **Use an Email Draft Instead**. Do not configure a custom success redirect that asserts delivery based solely on visiting a URL.

Until these steps are completed, actual inbox delivery via a backend is **not configured or verified**. The mailto/copy fallback is functional without credentials.

## Validation

There is no build command: this repository serves static HTML/CSS/JavaScript. Run the existing suite with `npm test`, or `node tests/services.cjs` for this page. `SITE_URL`, `BROWSER_PATH`, and `BROWSER_ENGINE=webkit` can select the preview and browser.

Services checks cover desktop/tablet/mobile layouts, native accordion keyboard controls, reduced motion, validation/focus, email defaults, optional call fields, draft encoding, long-message fallback, honeypot blocking, and a **mocked** Formspree POST including subject/reply-to and all details. The mock does not send an email and does not verify a provider account or inbox.

Screenshots are written to the ignored `.qa/` directory. No example client information is retained outside the test itself.
