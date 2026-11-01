const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium, webkit } = require('playwright');
const base = process.env.SITE_URL || 'http://127.0.0.1:4174';
const root = path.resolve(__dirname, '..');

async function run() {
    const browserType = process.env.BROWSER_ENGINE === 'webkit' ? webkit : chromium;
    const browser = await browserType.launch({ headless: true, ...(process.env.BROWSER_PATH ? { executablePath: process.env.BROWSER_PATH } : {}) });
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await context.route(/googletagmanager|google-analytics/, route => route.abort());
    const page = await context.newPage();
    const errors = [];
    const requests = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => requests.push(request.url()));
    const dialog = page.locator('#magazine-reader');
    async function ready(numbers) {
        await page.waitForFunction(expected => {
            const stage = document.querySelector('.reader-stage');
            const sheets = [...document.querySelectorAll('button.reader-sheet')];
            return stage.getAttribute('aria-busy') === 'false' && sheets.map(s => +s.dataset.page).join(',') === expected.join(',') && sheets.every(s => s.querySelector('img').complete);
        }, numbers);
    }
    async function jump(number, expected) {
        await page.locator('#reader-page').fill(String(number));
        await page.locator('#reader-page').press('Enter');
        await ready(expected);
    }
    async function close() {
        await page.getByRole('button', { name: 'Close magazine', exact: true }).click();
        assert.equal(await dialog.isVisible(), false);
        await page.waitForFunction(() => document.body.style.overflow !== 'hidden');
    }
    try {
        await page.goto(`${base}/transmission.html`);
        await page.evaluate(() => document.fonts.ready);
        const cards = page.locator('.transmission-card');
        assert.equal(await cards.count(), 9);
        assert.equal(requests.some(url => /pdf\.js|\.pdf(?:\?|$)|\/images\/magazines\/.+\.webp/.test(url)), false, 'Archive does not fetch readers, PDFs, or page images before opening');
        await page.locator('[data-magazine="transition"]').click();
        await ready([1]);
        assert.equal(await dialog.getAttribute('open'), '');
        assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden');
        assert.equal(await page.getByRole('button', { name: 'Previous page', exact: true }).isDisabled(), true);
        assert.ok(requests.filter(url => /\/transition\/page-.*-960\.webp/.test(url)).length <= 5, 'Opening only fetches a small page neighborhood');
        assert.equal(requests.some(url => /-240\.webp/.test(url)), false, 'No overview images until requested');
        assert.equal(await page.locator('a[href*=".pdf"], .reader-pdf').count(), 0, 'The archive and reader have no PDF controls or links');
        await page.getByRole('button', { name: 'Next page', exact: true }).click();
        await ready([2, 3]);
        assert.equal(await page.locator('.reader-range').textContent(), '–3');
        const fittedHeight = await page.locator('.reader-sheet').first().evaluate(el => el.getBoundingClientRect().height);
        await page.getByRole('button', { name: 'Enter fullscreen' }).click();
        await page.waitForFunction(() => document.fullscreenElement === document.querySelector('.reader-shell'));
        await page.waitForFunction(() => document.querySelector('.reader-shell').classList.contains('is-fullscreen'));
        assert.ok(await page.locator('.reader-sheet').first().evaluate(el => el.getBoundingClientRect().height) > fittedHeight, 'Fullscreen gives the magazine more reading space');
        assert.equal(await page.locator('.reader-shell').evaluate(el => { const r = el.getBoundingClientRect(); return r.width === innerWidth && r.height === innerHeight; }), true, 'The reader itself fills the fullscreen viewport');
        await page.getByRole('button', { name: 'Exit fullscreen' }).click();
        await page.waitForFunction(() => !document.fullscreenElement);

        // Clicks in either half of a spread should enlarge that exact location,
        // including after the high-resolution image finishes decoding.
        for (const [number, x, y] of [[2, .65, .4], [3, .35, .6]]) {
            const sheet = page.locator(`.reader-sheet[data-page="${number}"]`);
            const before = await sheet.boundingBox();
            await sheet.click({ position: { x: before.width * x, y: before.height * y } });
            await ready([2, 3]);
            const after = await sheet.boundingBox();
            assert.ok(Math.abs(after.x + after.width * x - (before.x + before.width * x)) < 3, 'Zoom keeps the clicked horizontal point in place');
            assert.ok(Math.abs(after.y + after.height * y - (before.y + before.height * y)) < 3, 'Zoom keeps the clicked vertical point in place');
            await page.getByRole('button', { name: 'Zoom out', exact: true }).first().click();
            await ready([2, 3]);
        }
        await page.keyboard.press('ArrowLeft');
        await ready([1]);
        await jump(10, [10, 11]);
        await page.getByRole('button', { name: 'Next page', exact: true }).focus();
        await page.keyboard.press('End');
        await ready([64]);
        assert.equal(await page.getByRole('button', { name: 'Next page', exact: true }).isDisabled(), true);
        await page.keyboard.press('ArrowLeft');
        await ready([62, 63]);
        await page.getByRole('button', { name: 'Switch to single pages' }).click();
        await ready([62]);
        await page.keyboard.press('ArrowRight');
        await ready([63]);
        await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
        await ready([63]);
        assert.match(await page.locator('.reader-sheet img').getAttribute('src'), /-1920\.webp/);
        assert.ok(await page.locator('.reader-stage').evaluate(el => el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth), 'Zoom exposes scrollable high-resolution pages');
        await page.locator('[data-reader="zoom"]').click();
        await ready([63]);
        await page.getByRole('button', { name: 'Page overview', exact: true }).click();
        assert.equal(await page.locator('.reader-thumbnail').count(), 64);
        await page.getByRole('button', { name: 'Go to page 20', exact: true }).click();
        await ready([20]);
        assert.equal(await page.locator('.reader-overview').isVisible(), false);
        // A failed page leaves the previous spread visible and provides a working retry.
        await page.route('**/transition/page-040-960.webp*', route => route.abort());
        await page.locator('#reader-page').fill('40');
        await page.locator('#reader-page').press('Enter');
        await page.locator('.reader-error').waitFor({ state: 'visible' });
        assert.equal(await page.locator('.reader-sheet').getAttribute('data-page'), '20');
        await page.unroute('**/transition/page-040-960.webp*');
        await page.getByRole('button', { name: 'Try again' }).click();
        await ready([40]);
        await page.keyboard.press('Escape');
        assert.equal(await dialog.isVisible(), false);
        await page.waitForFunction(() => document.body.style.overflow !== 'hidden');
        assert.equal(await page.evaluate(() => document.activeElement.dataset.magazine), 'transition');
        assert.notEqual(await page.evaluate(() => document.body.style.overflow), 'hidden');
        await page.locator('[data-magazine="transition"]').click();
        await ready([40, 41]);
        // Rapid requests must finish on the latest page, without stale page paints.
        await page.evaluate(() => {
            const input = document.getElementById('reader-page');
            for (const n of [8, 12, 16]) { input.value = n; input.dispatchEvent(new Event('change', { bubbles: true })); }
        });
        await ready([16, 17]);
        await close();
        for (const width of [320, 393, 768, 1024, 1710]) {
            await page.setViewportSize({ width, height: 852 });
            await page.locator('[data-magazine="transition"]').click();
            await ready(width < 900 ? [16] : [16, 17]);
            const layout = await page.evaluate(() => {
                const d = document.querySelector('.reader').getBoundingClientRect();
                const s = document.querySelector('.reader-stage').getBoundingClientRect();
                return { width: d.width, height: d.height, overflow: document.querySelector('.reader').scrollWidth > innerWidth,
                    fits: [...document.querySelectorAll('.reader-sheet')].every(el => { const r = el.getBoundingClientRect(); return r.top >= s.top && r.bottom <= s.bottom + 1 && r.left >= s.left && r.right <= s.right + 1; }) };
            });
            assert.equal(layout.overflow, false, `No reader overflow at ${width}`);
            assert.equal(layout.width, width);
            assert.equal(layout.height, 852);
            assert.equal(layout.fits, true, `Complete pages fit at ${width}`);
            await page.getByRole('button', { name: 'Page overview', exact: true }).click();
            await page.locator('.reader-thumbnail').first().scrollIntoViewIfNeeded();
            assert.ok(await page.locator('.reader-thumbnail img').first().evaluate(el => el.getBoundingClientRect().width > 60), 'Thumbnails reserve readable width before loading');
            await page.getByRole('button', { name: 'Page overview', exact: true }).click();
            await close();
        }
        // Single-page phone swipe, vertical gestures do not turn pages.
        await page.setViewportSize({ width: 393, height: 852 });
        await page.locator('[data-magazine="transition"]').click();
        await ready([16]);
        await page.locator('.reader-stage').evaluate(el => {
            el.dispatchEvent(Object.assign(new Event('touchstart'), { touches: [{ clientX: 200, clientY: 200 }] }));
            el.dispatchEvent(Object.assign(new Event('touchend'), { touches: [], changedTouches: [{ clientX: 190, clientY: 400 }] }));
        });
        await ready([16]);
        await page.locator('.reader-stage').evaluate(el => {
            el.dispatchEvent(Object.assign(new Event('touchstart'), { touches: [{ clientX: 300, clientY: 400 }] }));
            el.dispatchEvent(Object.assign(new Event('touchend'), { touches: [], changedTouches: [{ clientX: 100, clientY: 410 }] }));
        });
        await ready([17]);
        const phoneSheet = page.locator('button.reader-sheet');
        const phoneBefore = await phoneSheet.boundingBox();
        await phoneSheet.click({ position: { x: phoneBefore.width * .45, y: phoneBefore.height * .55 } });
        await ready([17]);
        const phoneAfter = await phoneSheet.boundingBox();
        assert.ok(Math.abs(phoneAfter.x + phoneAfter.width * .45 - (phoneBefore.x + phoneBefore.width * .45)) < 3, 'Phone zoom keeps the tapped horizontal point in place');
        assert.ok(Math.abs(phoneAfter.y + phoneAfter.height * .55 - (phoneBefore.y + phoneBefore.height * .55)) < 3, 'Phone zoom keeps the tapped vertical point in place');
        await close();
        // Opening another issue before an earlier request completes cannot overwrite it.
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.route('**/transition/page-050-960.webp*', async route => { await new Promise(resolve => setTimeout(resolve, 400)); await route.continue().catch(() => {}); });
        await page.locator('[data-magazine="transition"]').click();
        await ready([16, 17]);
        await page.locator('#reader-page').fill('50');
        await page.locator('#reader-page').press('Enter');
        await close();
        await page.locator('[data-magazine="transparency"]').click();
        await ready([1]);
        await page.waitForTimeout(500);
        assert.equal(await page.locator('.reader-title').textContent(), 'Transparency');
        assert.ok(await page.locator('.reader-sheet img').evaluateAll(a => a.every(i => i.src.includes('/transparency/'))));
        await close();
        assert.equal(requests.some(url => /pdf\.js|\.pdf(?:\?|$)/.test(url)), false, 'Reading never downloads or renders the source PDF');
        if (!process.env.READER_PARTIAL) {
            await page.route('**/new-faces/manifest.json*', route => route.abort());
            await page.locator('[data-magazine="new-faces"]').click();
            await page.locator('.reader-error').waitFor({ state: 'visible' });
            assert.equal(await page.locator('#reader-page').isDisabled(), true);
            await page.unroute('**/new-faces/manifest.json*');
            await page.getByRole('button', { name: 'Try again' }).click();
            await ready([1]);
            await close();
            const catalog = JSON.parse(await fs.readFile(path.join(root, 'content/magazines.json'), 'utf8'));
            for (const book of catalog) {
                const manifest = JSON.parse(await fs.readFile(path.join(root, `images/magazines/${book.id}/manifest.json`), 'utf8'));
                for (let n = 1; n <= manifest.pages.length; n++) for (const size of [240, 960, 1920]) {
                    await fs.access(path.join(root, `images/magazines/${book.id}/page-${String(n).padStart(3, '0')}-${size}.webp`));
                }
                await page.locator(`[data-magazine="${book.id}"]`).click();
                await page.waitForFunction(() => document.querySelector('.reader-stage').getAttribute('aria-busy') === 'false');
                await jump(1, [1]);
                await jump(manifest.pages.length, manifest.pages.length % 2 ? [manifest.pages.length - 1, manifest.pages.length] : [manifest.pages.length]);
                await close();
            }
        }
        assert.deepEqual(errors, []);
        const fallback = await browser.newContext({ javaScriptEnabled: false });
        const plain = await fallback.newPage();
        await plain.goto(`${base}/transmission.html`);
        assert.equal(await plain.locator('a[href*=".pdf"]').count(), 0, 'PDF links also stay unavailable without JavaScript');
        assert.equal(await plain.locator('noscript p').isVisible(), true);
        assert.equal(await plain.locator('#magazine-reader').isVisible(), false);
        console.log('Magazine reader: lazy page requests, spreads and covers, reader fullscreen, click-anchored zoom, jump/overview, retries, races, keyboard/focus, swipe, responsive fit, all publication assets, and disabled PDF links passed.');
    } finally { await browser.close(); }
}
run().catch(error => { console.error(error); process.exitCode = 1; });
