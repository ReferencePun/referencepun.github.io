# Services page inquiries

The page remains at `/services.html`, with `noindex, nofollow` and no incoming navigation links from other pages. Its own **Inquire** navigation link scrolls to the visible inquiry form. Each of the five service disclosures also has an **Inquire about this service** link that preselects the corresponding service without clearing other fields. Links scroll to the page bottom when the entire form and footer fit; on shorter screens they align the start of the form beneath the sticky header. Scrolling respects reduced motion.

## Direct email delivery

**Send Inquiry** sends the completed form directly to an activated Formspree endpoint using HTTPS POST. Visitors do not need to open an email application. Formspree handles spam verification, confirmation, and delivery to the verified receiving address.

The form requires name, email, service of interest, and project description. Business / Organization, Preferred Timeline, and Phone are optional. Phone accepts international formats and is included as a backup contact in the notification. Email remains the reply method.

The notification subject is **New Project Inquiry — [Service] — [Client Name]**. The `email` field supplies Reply-To, and `message` contains all fields with readable labels. Full descriptions are sent in the request body, without mailto length limits. The page does not log client details or save them in browser storage.

## Delivery configuration

The owner supplied `https://formspree.io/f/xvkkywde` as the delivery endpoint. It is configured as both `action` and `data-form-endpoint` on `#inquiry-form`. Submit stays disabled if that configuration is missing or invalid. The existing direct email link remains available. Automated checks use a mocked endpoint; actual inbox receipt must be checked separately.

1. Create a form in the site owner's Formspree account and verify **Dylan.Forsberg@gmail.com** as its receiving address. Follow [Formspree's HTML form setup](https://help.formspree.io/articles/building-your-form/building-an-html-form/).
2. Copy the public endpoint from the form's Integration tab, such as `https://formspree.io/f/FORM_ID`. Set both `data-form-endpoint` and `action` on `#inquiry-form` to that verified endpoint. No password, secret, or API key belongs in this repository.
3. Keep hosted spam verification enabled and restrict the form to the production domain. The page also uses a `_gotcha` honeypot and prevents accidental duplicate submissions. See [honeypot filtering](https://help.formspree.io/articles/building-your-form/honeypot-spam-filtering/).
4. Publish and submit a clearly labeled test inquiry with an address you control. Complete any hosted verification, confirm receipt in the actual inbox or spam folder, and check that reply-to, phone, and all project details are correct. A mocked response or HTTP handoff is not proof of inbox delivery.

The page shows a handoff message only; the provider confirms receipt after processing the request. A rejection is not displayed as success. If the visitor returns after a failed submission, the button becomes usable again. No JavaScript means the direct email link is available instead of an unenhanced form submission.

Official references: [Reply-To](https://help.formspree.io/articles/building-your-form/email-reply-to-address/), [subjects](https://help.formspree.io/articles/building-your-form/email-subject-line/).

## Verification

The repository serves static HTML/CSS/JavaScript. Run `node tests/services.cjs` for this page or the existing full suite. `SITE_URL`, `BROWSER_PATH`, and `BROWSER_ENGINE=webkit` select the preview and browser.

Services checks cover desktop/tablet/mobile layouts, native accordion keyboard controls, reduced motion, validation/focus, required service selection, visible form/navigation, optional international phone numbers, full direct POST contents, unconfigured-endpoint protection, honeypot blocking, and mocked provider acceptance/rejection. Tests intercept all submissions and do not send email or verify a real provider account.

Screenshots are written to the ignored `.qa/` directory.
