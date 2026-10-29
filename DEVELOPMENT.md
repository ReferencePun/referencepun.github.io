# Local development

The site is static HTML, CSS, and JavaScript. Serve the repository root with a local HTTP server; there is no production build step.

## Homepage preview

The `website-homepage` branch is a local draft. It has not been pushed or published. `index.html` is the overview; the original portrait gallery is at `portrait.html`, with its photograph sequence unchanged. Vogue and Chanel have dedicated selections at `vogue.html` and `chanel.html`. Homepage styles live in `css/home.css`. Its features are portraits, Vogue, Chanel, the Devil in Me film, and Transmission; writing and landscape sections are omitted from the homepage. All nine press excerpts are placed alongside related visual material.

The Vogue spreads are a temporary selection, pending the owner's preferred shoot/images. These are published spreads of Dylan's editorials, rather than unrelated stock photographs. Source pages:

- https://models.com/work/vogue-me-freestyle-1 (October 2017)
- https://models.com/work/vogue-me-light-up (June 2017)
- https://models.com/work/vogue-me-as-you-are (August 2016)

The originals in `images/home/originals/` also include poster frames for the existing Vimeo films 803186311 and 651829056. Chanel images and all other photographs and magazine covers come from the existing site. Press excerpts come from `transmission.html`; the homepage attributes them to reviews of Transmission. Publication figures come from `info.html`. `images/home/originals/transmission-spread.jpg` is a full-page rendering of pages 10–11 of the existing Issue 01 PDF, displayed as a magazine spread alongside the OAK quote.

Run `npm run images:home` to regenerate the small WebP derivatives and `js/home-images.js`. The homepage includes static image dimensions and responsive sources, so its content works without JavaScript. The featured galleries use the shared photograph viewer. Keep gallery links in the header pointed at `portrait.html` rather than `/`.

## Gallery photographs

Edit the selections in `js/portfolio.js`, `js/landscapes.js`, or `js/extra_images.js`, keeping their intended sequence. Original photographs remain in place and are used by the image viewer.

Install the development dependencies with `npm install`, then run `npm run images` to regenerate WebP sizes, dimensions in `js/gallery-images.js`, and the shared link photograph. Commit these generated assets alongside selection changes. The converter preserves the full composition and converts gallery derivatives to sRGB.

Run `npm test` while the site is served at `http://127.0.0.1:4174`. Set `SITE_URL` for a different local URL. Install Chromium with `npx playwright install chromium` if needed; `BROWSER_PATH` can select an existing Chromium executable. The tests cover deferred loading, layout stability, keyboard focus, touch navigation, mobile menus, and sharing metadata.
