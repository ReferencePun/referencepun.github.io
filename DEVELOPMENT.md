# Local development

The site is static HTML, CSS, and JavaScript. Serve the repository root with a local HTTP server; there is no production build step.

## Gallery photographs

Edit the selections in `js/portfolio.js`, `js/landscapes.js`, or `js/extra_images.js`, keeping their intended sequence. Original photographs remain in place and are used by the image viewer.

Install the development dependencies with `npm install`, then run `npm run images` to regenerate WebP sizes, dimensions in `js/gallery-images.js`, and the shared link photograph. Commit these generated assets alongside selection changes. The converter preserves the full composition and converts gallery derivatives to sRGB.

Run `npm test` while the site is served at `http://127.0.0.1:4174`. Set `SITE_URL` for a different local URL. Install Chromium with `npx playwright install chromium` if needed; `BROWSER_PATH` can select an existing Chromium executable. The tests cover deferred loading, layout stability, keyboard focus, touch navigation, mobile menus, and sharing metadata.
