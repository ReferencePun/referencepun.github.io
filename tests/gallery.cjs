const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs/promises');
const { chromium } = require('playwright');
const base = process.env.SITE_URL || 'http://127.0.0.1:4174';
const output = path.resolve(__dirname, '../.qa');

async function run() {
    await fs.mkdir(output, { recursive: true });
    const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_PATH ? { executablePath: process.env.BROWSER_PATH } : {}) });
    const errors = [], missing = [];
    async function context(options = {}) {
        const value = await browser.newContext({ viewport: { width: 1440, height: 1050 }, ...options });
        await value.route(/googletagmanager|google-analytics/, route => route.abort());
        value.on('page', page => {
            page.on('pageerror', error => errors.push(error.message));
            page.on('response', response => {
                if (response.url().startsWith(base) && response.status() >= 400) missing.push(response.url());
            });
        });
        return value;
    }
    try {
        const desktop = await context();
        for (const [route, count] of [['/portrait.html', 112], ['/landscapes.html', 130], ['/portfolio_test.html', 49]]) {
            const page = await desktop.newPage();
            let release;
            const gate = new Promise(resolve => { release = resolve; });
            const requests = [];
            page.on('request', request => { if (request.resourceType() === 'image') requests.push(request.url()); });
            await page.route('**/images/gallery/**', async request => { await gate; await request.continue(); });
            await page.goto(base + route, { waitUntil: 'domcontentloaded' });
            await page.evaluate(() => document.fonts.ready);
            assert.equal(await page.locator('button.portfolio-item').count(), count);
            assert.equal(await page.locator('.portfolio-item .caption').count(), 0);
            const positions = () => page.locator('.portfolio-item').evaluateAll(items => items.map(item => {
                const { x, y, width, height } = item.getBoundingClientRect();
                return [x, y, width, height];
            }));
            const before = await positions();
            assert.ok(before.every(box => box[2] > 0 && box[3] > 0), 'Space is reserved before any gallery image loads');
            release();
            await page.waitForFunction(() => [...document.querySelectorAll('.portfolio-item img')].slice(0, 6).every(img => img.complete && img.naturalWidth));
            await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
            const after = await positions();
            assert.ok(before.every((box, i) => box.every((value, j) => Math.abs(value - after[i][j]) < 1)), `Loading moves the ${route} grid`);
            assert.ok(requests.length < count / 2, 'Offscreen photographs should not all load on entry');
            assert.ok(requests.every(url => !url.includes('/images/') || url.includes('/images/gallery/')), 'Grid uses derivatives, not originals');
            const images = await page.evaluate(() => portfolioImages.map(image => image.src));
            const first = page.locator('.portfolio-item').first();
            await first.focus();
            await page.keyboard.press('Enter');
            assert.equal(await page.locator('.close-lightbox').evaluate(el => el === document.activeElement), true);
            assert.equal(await page.locator('header').evaluate(el => el.inert), true);
            await page.keyboard.press('Shift+Tab');
            assert.equal(await page.locator('.lightbox-next').evaluate(el => el === document.activeElement), true);
            await page.keyboard.press('Tab');
            assert.equal(await page.locator('.close-lightbox').evaluate(el => el === document.activeElement), true);
            await page.keyboard.press('ArrowRight');
            assert.equal(await page.locator('#lightbox-img').getAttribute('src'), images[1]);
            await page.keyboard.press('ArrowLeft');
            await page.keyboard.press('ArrowLeft');
            assert.equal(await page.locator('#lightbox-img').getAttribute('src'), images.at(-1));
            await page.keyboard.press('Escape');
            assert.equal(await first.evaluate(el => el === document.activeElement), true);
            assert.equal(await page.locator('header').evaluate(el => el.inert), false);
            await page.keyboard.press('Space');
            assert.equal(await page.locator('#lightbox').evaluate(el => el.classList.contains('active')), true);
            await page.locator('.close-lightbox').click();
            const last = page.locator('.portfolio-item').last();
            await last.scrollIntoViewIfNeeded();
            await last.locator('img').evaluate(img => img.decode());
            assert.ok(await last.locator('img').evaluate(img => img.naturalWidth > 0));
            await page.evaluate(() => scrollTo(0, 0));
            if (route !== '/portfolio_test.html') await page.screenshot({ path: path.join(output, route === '/portrait.html' ? 'portraits-desktop.png' : 'landscapes-desktop.png') });
            console.log(`${route}: stable layout, ${requests.length} image requests after scroll/viewer, deferred loading and keyboard focus passed`);
            await page.close();
        }
        await desktop.close();

        const mobile = await context({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
        const page = await mobile.newPage();
        await page.goto(base + '/portrait.html', { waitUntil: 'domcontentloaded' });
        await page.waitForFunction(() => document.querySelector('.portfolio-item img')?.naturalWidth > 0);
        await page.evaluate(() => document.fonts.ready);
        const first = page.locator('.portfolio-item').first();
        await page.screenshot({ path: path.join(output, 'portraits-mobile.png') });
        await first.tap();
        const source = () => page.locator('#lightbox-img').getAttribute('src');
        const images = await page.evaluate(() => portfolioImages.map(image => image.src));
        const client = await mobile.newCDPSession(page);
        async function swipe(from, to, secondFinger = false) {
            const points = (x, y) => [{ x, y, id: 0 }, ...(secondFinger ? [{ x: x + 30, y: y + 30, id: 1 }] : [])];
            await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: points(...from) });
            for (let step = 1; step <= 5; step++) {
                await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: points(from[0] + (to[0] - from[0]) * step / 5, from[1] + (to[1] - from[1]) * step / 5) });
            }
            await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        }
        await swipe([290, 390], [90, 395]);
        assert.equal(await source(), images[1], 'Swipe left advances');
        await swipe([90, 390], [290, 395]);
        assert.equal(await source(), images[0], 'Swipe right goes back');
        await swipe([200, 480], [195, 280]);
        assert.equal(await source(), images[0], 'Vertical gesture does not navigate');
        await swipe([270, 350], [90, 350], true);
        assert.equal(await source(), images[0], 'Multi-touch does not navigate');
        for (const selector of ['.close-lightbox', '.lightbox-prev', '.lightbox-next']) {
            const box = await page.locator(selector).boundingBox();
            assert.ok(box.width >= 44 && box.height >= 44 && box.y >= 0 && box.y + box.height <= 844, 'Touch targets fit the viewport');
        }
        await page.screenshot({ path: path.join(output, 'viewer-mobile.png') });
        await page.locator('.close-lightbox').tap();
        assert.equal(await first.evaluate(el => el === document.activeElement), true);
        console.log('Mobile swipe, multi-touch, close controls and focus restoration passed');
        await mobile.close();

        const pages = ['/', '/portrait.html', '/vogue.html', '/chanel.html', '/landscapes.html', '/info.html', '/video.html', '/transmission.html', '/writing.html', '/articles/hitchhiking-part-1.html', '/articles/love-and-loss.html', '/portfolio_test.html'];
        const menus = await context({ viewport: { width: 390, height: 844 } });
        for (const route of pages) {
            const page = await menus.newPage();
            await page.goto(base + route, { waitUntil: 'domcontentloaded' });
            const button = page.locator('#mobile-menu');
            assert.equal(await button.evaluate(el => el.tagName), 'BUTTON');
            assert.equal(await page.locator('header nav').evaluate(el => el.inert), true);
            await button.focus();
            await page.keyboard.press('Enter');
            assert.equal(await button.getAttribute('aria-expanded'), 'true');
            await page.keyboard.press('Tab');
            assert.equal(await page.evaluate(() => document.activeElement.tagName), 'A');
            await page.keyboard.press('Escape');
            assert.equal(await button.getAttribute('aria-expanded'), 'false');
            assert.equal(await button.evaluate(el => el === document.activeElement), true);
            assert.ok(await page.locator('meta[name="description"]').getAttribute('content'));
            assert.equal(await page.locator('meta[property="og:image"]').getAttribute('content'), 'https://dylanforsberg.com/images/share.jpg');
            assert.equal(await page.locator('link[rel="icon"]').getAttribute('href'), '/favicon.ico');
            assert.equal(await page.locator('link[rel="canonical"]').count(), 1);
            await page.setViewportSize({ width: 1440, height: 1050 });
            await page.waitForFunction(() => !document.querySelector('header nav').inert);
            assert.equal(await page.locator('header nav').evaluate(el => el.inert), false);
            await page.close();
        }
        const response = await menus.request.get(base + '/images/share.jpg');
        assert.equal(response.status(), 200);
        console.log('Menu keyboard behavior, desktop resize and metadata passed on all pages');
        await menus.close();
        assert.deepEqual(errors, []);
        assert.deepEqual(missing, []);
        console.log('All gallery checks passed.');
    } finally {
        await browser.close();
    }
}
run().catch(error => { console.error(error); process.exitCode = 1; });
