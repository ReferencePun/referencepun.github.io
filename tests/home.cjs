const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const base = process.env.SITE_URL || 'http://127.0.0.1:4174';

async function run() {
    const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_PATH ? { executablePath: process.env.BROWSER_PATH } : {}) });
    const context = await browser.newContext();
    const errors = [];
    await context.route(/googletagmanager|google-analytics/, route => route.abort());
    try {
        const page = await context.newPage();
        page.on('pageerror', error => errors.push(error.message));
        await page.goto(base, { waitUntil: 'domcontentloaded' });
        // Every homepage destination resolves, including PDF covers and film/press anchors.
        const links = await page.locator('a[href]').evaluateAll(links => [...new Set(links.map(link => link.href))]);
        for (const href of links.filter(href => href.startsWith(base))) {
            const url = new URL(href);
            const response = await context.request.get(url.href);
            assert.equal(response.status(), 200, `Broken homepage destination: ${url.pathname}`);
            if (url.hash && !url.pathname.endsWith('.pdf')) assert.ok((await response.text()).includes(`id="${url.hash.slice(1)}"`), `Missing anchor: ${url.href}`);
        }
        for (const width of [320, 390, 768, 900, 1000, 1024, 1440, 1920]) {
            await page.setViewportSize({ width, height: 1000 });
            await page.evaluate(() => document.fonts.ready);
            assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Horizontal overflow at ${width}px`);
            const nav = page.locator('header nav');
            if (width <= 1000) {
                await page.locator('#mobile-menu').click();
                assert.equal(await nav.evaluate(el => el.inert), false);
                await page.getByRole('link', { name: 'Film Photography', exact: true }).click();
                await page.waitForURL('**/photography.html');
                assert.equal(await page.locator('.portfolio-item').count(), 112);
                await page.locator('.logo a').click();
                await page.waitForURL(base + '/');
            } else {
                const boxes = await nav.locator('a').evaluateAll(links => links.map(a => { const r = a.getBoundingClientRect(); return { left: r.left, right: r.right }; }));
                assert.ok(boxes.every((box, i) => i === 0 || box.left > boxes[i - 1].right), `Navigation overlaps at ${width}px`);
                const logoRight = await page.locator('.logo').evaluate(el => el.getBoundingClientRect().right);
                const socialLeft = await page.locator('.social-icons').evaluate(el => el.getBoundingClientRect().left);
                assert.ok(boxes[0].left > logoRight && boxes.at(-1).right < socialLeft, `Header collisions at ${width}px`);
            }
        }
        // Let responsive sources settle after the viewport changes and eager-loading update.
        await page.locator('main img').evaluateAll(images => images.forEach(image => { image.loading = 'eager'; }));
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        await page.waitForFunction(() => [...document.querySelectorAll('main img')].every(image => image.complete && image.naturalWidth));
        await page.locator('main img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
        assert.ok(await page.locator('main img').evaluateAll(images => images.every(image => image.naturalWidth && image.width && image.height)));
        for (const [route, count] of [['vogue.html', 4], ['vogue-accessories.html', 3], ['chanel.html', 5]]) {
            await page.setViewportSize({ width: 390, height: 844 });
            await page.goto(`${base}/${route}`, { waitUntil: 'domcontentloaded' });
            assert.equal(await page.locator('.portfolio-item').count(), count);
            const tile = page.locator('.portfolio-item').first();
            await tile.focus();
            await page.keyboard.press('Enter');
            await page.locator('#lightbox-img').evaluate(image => image.decode());
            assert.equal(await page.locator('.close-lightbox').evaluate(el => el === document.activeElement), true);
            await page.keyboard.press('ArrowRight');
            assert.ok((await page.locator('#lightbox-caption').textContent()).length > 0);
            await page.keyboard.press('Escape');
            assert.equal(await tile.evaluate(el => el === document.activeElement), true);
            await page.getByRole('link', { name: 'Back to home' }).click();
            await page.waitForURL(base + '/');
        }
        assert.deepEqual(errors, []);
        console.log('Homepage links, PDFs, anchors, image loading, eight viewport widths, portrait navigation, and featured gallery keyboard controls passed.');
    } finally { await browser.close(); }
}
run().catch(error => { console.error(error); process.exitCode = 1; });
