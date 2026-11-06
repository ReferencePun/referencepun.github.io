# Services & Pricing V2

Implemented November 6, 2026 on `website-homepage`. This is a package and pricing update to the existing catalogue, not a redesign. The visible page remains “Services & Pricing.” No production deployment or Stripe billing changes are included.

## V1 preservation

Before editing the site, all existing work—including the three previously untracked font-preview files—was committed:

- Commit: `e90ba764e5cd4b6479df28a40a6f4faa4c5c08bf`
- Annotated tag: `services-v1`
- Backup branch: `backup/services-v1`
- Unlinked preview: `/services-v1.html`

The archived HTML references frozen copies of both stylesheets, all three scripts, and the background texture in `archive/services-v1/`. It retains the original pricing, accordions, mobile navigation, and inquiry form. The inquiry endpoint still points to the existing Formspree form; submissions from the archive are real if a visitor explicitly submits. Automated checks intercept submissions and do not email anyone.

`docs/services-v1-manifest.json` records the checkpoint and SHA-256 digests of the archived page and its dependencies. Tests verify that these files have not changed. The font request uses the original EB Garamond settings. The archive is excluded from search indexing and is not added to navigation.

### Restore the V1 pricing page

From the repository, first save any new work. Restore only the pricing implementation and its tests, preserving the client portal and other subsequent work:

```sh
git restore --source=services-v1 -- services.html css/services.css tests/services.cjs
git diff -- services.html css/services.css tests/services.cjs
```

Review, test, and commit the restoration. This does not deploy it. The archive and documentation can remain in place. For a read-only comparison, use `git show services-v1:services.html` or open `/services-v1.html`. The full checkpoint is also available on `backup/services-v1`; avoid resetting the whole site simply to change pricing.

## Package rates

| Service / package | Founding or partner rate | Standalone |
| --- | --- | --- |
| Digital photography — Half Day | $1,500 | $1,800 |
| Digital photography — Full Day | $2,000 | $2,400 |
| Film photography — Full Day | $2,500 | $3,000 |
| Content Essentials | $1,500/month | $1,800 |
| Cinematic Production | $2,500/month | $3,000 |
| Landing Page | $1,000 | $1,200 |
| Squarespace Website | $1,500 | $1,800 |
| Custom Starter Website | $2,000 | $2,400 |
| Advanced Custom Website | From $3,000 | Custom Quote |
| Standard Visuals | $200/month | $240 |
| Custom Visuals | $500/month | $600 |
| Creative Direction & Custom Productions | Custom Quote | Custom Quote |

Photography founding rates apply to the monthly partnership's one session per month; the catalogue and package table use the amounts without `/mo`, as specified in the brief. Website fees are one-time charges; partner rates require an active monthly agreement.

Content Essentials includes a session of up to four hours and a target of up to twelve videos of thirty seconds or less, subject to preparation, filming conditions, and usable footage. Cinematic Production includes a session of up to eight hours and eight editing credits: short ≤30 seconds/1 credit, medium ≤1 minute/2 credits, long ≤2 minutes/4 credits. Credits apply only to Cinematic Production. Neither package includes subjective editing revisions; production errors that materially fail agreed specifications are corrected.

## Design and behavior

- Retains five accordions, the existing type, colors, column grid, dividers, full-width expanded highlights, and Details / Hide details controls.
- Package comparisons sit inside their service accordion, side by side on desktop and stacked on phones.
- Tablet starting-price prefixes wrap consistently to keep amounts readable in the existing narrow columns.
- Preserves the inquiry form, Formspree connection, five service categories, service preselection, mobile menu, and email-first flow.
- Keeps Process specific to photography/video and updates duration to four or eight hours.
- Retains concise three-month renewal, advance billing, cancellation-notice, introductory-term guarantee, and advance rate-change disclosures.
- Leaves the homepage, portfolio, magazines, video, Info, shared navigation/styles, and private client portal unchanged.

## Validation

Run the existing static-site publication check and browser suite with `npm test` while the local HTTP server is running (default `http://127.0.0.1:4174`). There is no application build step for this static page; `npm run site:config` generates the publishing configuration if tracked assets change.

`tests/services.cjs` checks the archived file digests and old pricing, every new package price, cinematic credits, responsive comparisons, keyboard accordions, stable summary heights, complete first-screen layout, inquiry preselection, validation, mocked submission and rejection, and no-JavaScript fallback. It verifies the inquiry section is byte-for-byte unchanged from V1.

Screenshots are saved locally under `.qa/` (not published or committed). Reference captures include `services-v2-desktop.png`, `services-v2-tablet.png`, `services-v2-video-desktop.png`, and the mobile package images. The full test captures include open/closed pages and smaller laptop viewports.

Verification completed in Chromium and WebKit across 320–1920px layouts, including the archive, package comparisons, first-screen fit, keyboard controls, and mocked inquiry delivery. The public homepage, photography, video, and magazine suites also passed. The publication check remains within the host limit at 849.2 MB. The V2 commit changes no unrelated page or portal files; independently ongoing portal work is outside this pricing update.

Real email delivery is not re-tested by sending an inquiry; provider submissions are mocked. Live payments are not touched. Publish only after explicit authorization.
