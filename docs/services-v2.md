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

Both video packages now include one full-day shoot of up to eight hours and 8–12 finished videos in a mix of lengths. Content Essentials uses standard editing; Cinematic Production uses more advanced editing, color grading, and sound design. This follows the November 6 clarification that editing is the difference between the packages. The previous short-form-only and editing-credit models are superseded. Lengths and deliverables are agreed before filming based on the project and usable footage. Prices are unchanged.

The expanded service panels have been reduced to prices, package choices, and key inclusions. Technical specifications and detailed exclusions are retained below for the complete pricing package.

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

`tests/services.cjs` checks the archived file digests and old pricing, every new package price, video deliverable limits, responsive comparisons, keyboard accordions, stable summary heights, complete first-screen layout, inquiry preselection, validation, mocked submission and rejection, and no-JavaScript fallback. It verifies the inquiry section is byte-for-byte unchanged from V1.

Screenshots are saved locally under `.qa/` (not published or committed). Reference captures include `services-v2-desktop.png`, `services-v2-tablet.png`, `services-v2-video-desktop.png`, and the mobile package images. The full test captures include open/closed pages and smaller laptop viewports.

Verification completed in Chromium and WebKit across 320–1920px layouts, including the archive, package comparisons, first-screen fit, keyboard controls, and mocked inquiry delivery. The public homepage, photography, video, and magazine suites also passed. The publication check remains within the host limit at 849.2 MB. The V2 commit changes no unrelated page or portal files; independently ongoing portal work is outside this pricing update.

Real email delivery is not re-tested by sending an inquiry; provider submissions are mocked. Live payments are not touched. Publish only after explicit authorization.

## Details retained for the complete pricing package

These are internal reference notes, not a completed client agreement. The `docs` directory is excluded from publication. Public descriptions have been shortened without changing prices. The video quantities and session duration were separately updated at the user's explicit request on November 6: both packages now include a full-day shoot and 8–12 videos, differing in editing treatment.

### Photography

- Monthly partnerships include one shoot per month; standalone sessions are also available.
- Digital Half Day: up to four hours, including standard color and exposure adjustments.
- Digital Full Day: up to eight hours, including standard color and exposure adjustments.
- Film Full Day: up to eight hours, including standard processing and scanning.
- Final selections and delivery dates are agreed before production. No fixed photograph count is promised.
- Selected photographs are delivered digitally. Prints are separately available.
- Detailed retouching, beauty services, hair, makeup, wardrobe styling, additional locations, talent, specialized equipment, and other production expenses are separately quoted and approved.

### Both video packages

- One full-day filming session of up to eight hours.
- 8–12 finished videos in a mix of lengths. Formats, lengths, and final deliverables are agreed before filming based on the project and usable footage.
- Captions, appropriate licensed music, and digital delivery.
- The filming allocation and number of videos are the same in both packages. Editing treatment is the distinction.
- Preparation, filming conditions, and usable footage affect the agreed output. Do not promise unspecified video lengths or unlimited editing work.
- Original scripts, extensive creative direction, additional shoot days, larger crews, and work outside the approved brief are separately quoted.
- Neither package includes subjective editing revision rounds. Production errors that materially fail the agreed specifications are corrected. Confirm these conditions in the proposal and agreement.
- The previous eight-credit system and twelve-short-videos limit are obsolete, not additional restrictions on these packages. Historical copy remains in Git at `0d30f59`.

### Content Essentials — editing

- Founding: $1,500/month. Standalone: $1,800.
- Simple cuts and transitions, basic color correction, and audio cleanup.
- Standard or automated captions, simple titles, licensed music, and a consistent editing style.
- Excludes specialist cinematic editing, elaborate sound design, advanced visual effects, extensive custom animation, and ongoing social account management.

### Cinematic Production — editing

- Founding: $2,500/month. Standalone: $3,000.
- Individualized editing, enhanced color grading, advanced pacing, and sound design.
- Specialist editors where appropriate.
- Complex visual effects, extensive animation, and requirements beyond the approved brief are separately quoted.

### Website Design & Development

- Development is a one-time project fee. Partner rates require an active monthly service agreement.
- Landing Page: one responsive page with a standard contact form or call-to-action and limited, predefined features.
- Squarespace: up to four pages, custom platform styling, responsive layouts, and basic contact functionality.
- Custom Starter: up to four custom-coded pages, reusable components, responsive layouts, and standard contact functionality.
- These three packages use client-provided copy and images.
- Advanced Custom: more elaborate design, additional pages, custom interactions, integrations, complex content structures, and specialized development, quoted for each project.
- Hosting, domains, platform subscriptions, and third-party services are separate. Complex integrations and extensive content development are separately quoted.
- Optional maintenance, content updates, and technical support are available.
- Confirm pages, features, delivery dates, and the review process in the proposal; no unlimited revisions are promised.

### Social Media Content

- Both packages include twenty visuals based on supplied brand direction, delivered digitally and ready to publish.
- Standard Visuals uses efficient, repeatable production with AI-assisted images or templates and consistent styling. It excludes extensive individual art direction, elaborate compositing, and custom campaigns.
- Custom Visuals provides more individual creative treatment, AI-assisted imagery where appropriate, digital editing and composition, and greater variety.
- Scheduling and publishing are available for a separate monthly fee.
- Account management, community engagement, analytics, advertising management, and daily account monitoring are excluded.

### Creative Direction & Custom Productions

All services are quoted individually: concept development and campaign strategy; creative and art direction; scripts and storyboards; expanded crews and equipment; multi-day and multi-location production; advanced editing and retouching; brand identity and visual development.
