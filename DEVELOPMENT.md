# Local development

The site is static HTML, CSS, and JavaScript. Serve the repository root with a local HTTP server; there is no production build step.

## Homepage preview

The `website-homepage` branch is a local draft. It has not been pushed or published. `index.html` is the overview; the original portrait gallery is at `portrait.html`, with its photograph sequence unchanged. Vogue China fashion, Vogue China accessories, and Chanel are presented directly on the homepage, without links to separate story pages. The existing local selections at `vogue.html`, `vogue-accessories.html`, and `chanel.html` are retained but no longer linked from the homepage. Homepage styles live in `css/home.css`. Its features are portraits, Vogue, Chanel, the Devil in Me film, and Transmission; writing and landscape sections are omitted from the homepage. All nine press excerpts are placed alongside related visual material.

The homepage uses 12 of the 29 files originally selected by the owner in `/Users/dylanforsberg/Desktop/homepage` on October 30, 2026. `content/home-selection.json` records the supplied filenames, original source paths, groups, and SHA-256 matches. Every supplied file matches an existing optimized gallery image byte for byte, so the site reuses those assets and does not depend on the external folder. The `homepage` flag records the current curated selection. The four explicit removals (Va Bien Lingerie, Lindsey Wixson, Carmella Rose, and the second Ali Michael portrait) remain excluded. Other images were omitted from the homepage to reduce clutter; all full project selections remain in their galleries. Each retained selection appears once. Additional images are the existing Devil in Me film poster, the Transparency and Transform covers. The original image assets and portrait sequence are preserved. The brighter `26A_0295l1.jpg` supplied on October 30 replaces the shoe photograph in the homepage, portrait gallery, and retained Vogue accessories selection. Its original JPEG and regenerated WebP sizes are stored in the repository; the original selection record retains a `replacement` entry for provenance.

The homepage uses two photographs for each featured project: Vogue China fashion, Vogue China accessories, and Chanel. Their separate galleries retain four, three, and five photographs respectively. Chanel selections come only from the files explicitly named Chanel in the supplied folder. The three selected additional portraits sit in a clearly labeled Portraits section. The main portrait and landscape galleries retain their original selections and order. No photograph is cropped in the homepage layout.

The homepage fills the browser width with fluid outer gutters shared by the header. One two-column structure runs through the page: project titles and short press excerpts on the left, photograph groups on the right. Vogue fashion and accessories remain grouped with separate labels, and Chanel remains its own feature. The two opening photographs share a common height; subsequent photo groups align along a common baseline. Longer press excerpts sit below their associated image groups in smaller type. All nine excerpts remain visible and attributed to Transmission. On phones, headings and images stack in a consistent sequence while photographs remain paired or grouped. The retained Vogue and Chanel galleries keep four columns on desktop and two below 640px. These styles are scoped to the homepage and retained featured selections; the original galleries keep their existing layout.

The film poster is from the existing Vimeo film 803186311. Press excerpts come from `transmission.html`; all nine retain their attribution to reviews of Transmission. Publication figures come from `info.html`.

Run `npm run images:home` to regenerate the small WebP derivatives and `js/home-images.js`. The homepage includes static image dimensions and responsive sources, so its content works without JavaScript. The featured galleries use the shared photograph viewer. Keep gallery links in the header pointed at `portrait.html` rather than `/`.

## Gallery photographs

Edit the selections in `js/portfolio.js`, `js/landscapes.js`, or `js/extra_images.js`, keeping their intended sequence. Original photographs remain in place and are used by the image viewer.

Install the development dependencies with `npm install`, then run `npm run images` to regenerate WebP sizes, dimensions in `js/gallery-images.js`, and the shared link photograph. Commit these generated assets alongside selection changes. The converter preserves the full composition and converts gallery derivatives to sRGB.

Run `npm test` while the site is served at `http://127.0.0.1:4174`. Set `SITE_URL` for a different local URL. Install Chromium with `npx playwright install chromium` if needed; `BROWSER_PATH` can select an existing Chromium executable. The tests cover deferred loading, layout stability, keyboard focus, touch navigation, mobile menus, and sharing metadata.
