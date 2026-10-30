# Local development

The site is static HTML, CSS, and JavaScript. Serve the repository root with a local HTTP server; there is no production build step.

## Homepage preview

The `website-homepage` branch is a local draft. It has not been pushed or published. `index.html` is the overview; the original portrait gallery is at `portrait.html`, with its photograph sequence unchanged. Vogue and Chanel have dedicated selections at `vogue.html` and `chanel.html`. Homepage styles live in `css/home.css`. Its features are portraits, Vogue, Chanel, the Devil in Me film, and Transmission; writing and landscape sections are omitted from the homepage. All nine press excerpts are placed alongside related visual material.

The homepage uses all 29 files selected by the owner in `/Users/dylanforsberg/Desktop/homepage` on October 30, 2026. `content/home-selection.json` records the supplied filenames, original source paths, groups, and SHA-256 matches. Every supplied file matches an existing optimized gallery image byte for byte, so the site reuses those assets and does not depend on the external folder. Each selection appears once on the homepage; the only additional image is the existing Devil in Me film poster.

The seven files labeled Vogue replace the provisional editorial spreads. The five labeled Chanel replace the provisional Chanel selection. These selections also populate the linked shoot galleries. The main portrait and landscape galleries retain their original selections and order. No photograph is cropped in the homepage layout.

The homepage is constrained to a 1,040px frame, with a twelve-column opening composition, smaller supporting photographs, and press excerpts integrated into the grid. Phone layouts retain paired photographs rather than full-width portrait panels. The linked Vogue and Chanel galleries use four columns on desktop and two on phones. These rules are scoped to the homepage and featured selections; the original galleries keep their existing layout.

The film poster is from the existing Vimeo film 803186311. Press excerpts come from `transmission.html`; all nine retain their attribution to reviews of Transmission. Publication figures come from `info.html`.

Run `npm run images:home` to regenerate the small WebP derivatives and `js/home-images.js`. The homepage includes static image dimensions and responsive sources, so its content works without JavaScript. The featured galleries use the shared photograph viewer. Keep gallery links in the header pointed at `portrait.html` rather than `/`.

## Gallery photographs

Edit the selections in `js/portfolio.js`, `js/landscapes.js`, or `js/extra_images.js`, keeping their intended sequence. Original photographs remain in place and are used by the image viewer.

Install the development dependencies with `npm install`, then run `npm run images` to regenerate WebP sizes, dimensions in `js/gallery-images.js`, and the shared link photograph. Commit these generated assets alongside selection changes. The converter preserves the full composition and converts gallery derivatives to sRGB.

Run `npm test` while the site is served at `http://127.0.0.1:4174`. Set `SITE_URL` for a different local URL. Install Chromium with `npx playwright install chromium` if needed; `BROWSER_PATH` can select an existing Chromium executable. The tests cover deferred loading, layout stability, keyboard focus, touch navigation, mobile menus, and sharing metadata.
