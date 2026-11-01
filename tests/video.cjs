const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const base = process.env.SITE_URL || 'http://127.0.0.1:4174';

async function run() {
    const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_PATH ? { executablePath: process.env.BROWSER_PATH } : {}) });
    try {
        const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
        await context.route(/googletagmanager|google-analytics/, route => route.abort());
        // Exercise embedding and switching without depending on Vimeo playback/network state.
        const embeds = [];
        await context.route('https://player.vimeo.com/video/**', route => {
            embeds.push(route.request().url());
            return route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Video player</title><button>Play</button>' });
        });
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.goto(`${base}/video.html`);
        assert.equal(await page.locator('.film-feature:visible').count(), 1);
        assert.equal(await page.locator('#devil-in-me').isVisible(), true);
        assert.equal(await page.locator('iframe').count(), 0, 'No third-party player before playback');
        assert.equal(embeds.length, 0);
        assert.equal(await page.locator('.film-coming-soon').count(), 2);
        assert.equal(await page.locator('.film-coming-soon a, .film-coming-soon button').count(), 0, 'Coming soon cards are inactive');

        await page.getByRole('link', { name: 'Play The Overland — Devil in Me', exact: true }).click();
        await page.waitForFunction(() => document.querySelector('iframe')?.src.includes('803186311'));
        assert.equal(await page.locator('#devil-in-me .film-play').isVisible(), false);
        await page.locator('.film-choice[href="#pool-party"]').focus();
        await page.keyboard.press('Enter');
        assert.equal(await page.locator('#pool-party').isVisible(), true);
        assert.equal(await page.locator('iframe').count(), 0, 'Switching removes the old player and stops playback');
        assert.equal(await page.locator('.film-choice[aria-current="true"]').getAttribute('href'), '#pool-party');
        assert.equal(await page.evaluate(() => document.activeElement.id), 'pool-party-title');
        const top = await page.locator('#pool-party').evaluate(el => el.getBoundingClientRect().top);
        const headerBottom = await page.locator('header').evaluate(el => el.getBoundingClientRect().bottom);
        assert.ok(top >= headerBottom, 'Selection scrolls the film clear of the sticky header');
        assert.match(await page.locator('#pool-party .film-credits').textContent(), /Huddle Formation/);
        assert.match(await page.locator('#pool-party .film-credits').textContent(), /Josh Robins/);
        await page.getByRole('link', { name: 'Play Pool Party', exact: true }).click();
        assert.match(await page.locator('iframe').getAttribute('src'), /651829056/);
        await page.goBack();
        await page.waitForFunction(() => !document.querySelector('#devil-in-me').hidden);
        assert.equal(await page.locator('iframe').count(), 0, 'Back also stops playback');
        await page.goForward();
        await page.waitForFunction(() => !document.querySelector('#pool-party').hidden);
        await page.reload();
        assert.equal(await page.locator('#pool-party').isVisible(), true, 'A film permalink survives refresh');

        for (const width of [320, 393, 600, 768, 1000, 1100, 1200, 1440, 1920]) {
            await page.setViewportSize({ width, height: 984 });
            await page.evaluate(() => document.fonts.ready);
            assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `Overflow at ${width}px`);
            assert.ok(await page.locator('.film-navigation').evaluate(el => el.getBoundingClientRect().height > 0), 'Navigation stays visible on phones');
            const ratio = await page.locator('#pool-party .film-player').evaluate(el => { const b = el.getBoundingClientRect(); return b.width / b.height; });
            assert.ok(Math.abs(ratio - 16 / 9) < .01, `Uncropped 16:9 player at ${width}px`);
        }
        await page.setViewportSize({ width: 393, height: 852 });
        await page.locator('.film-choice[href="#devil-in-me"]').click();
        assert.equal(await page.locator('#devil-in-me').isVisible(), true);
        await page.locator('#mobile-menu').click();
        assert.equal(await page.locator('header nav').evaluate(el => el.inert), false);
        await page.keyboard.press('Escape');
        assert.equal(await page.locator('header nav').evaluate(el => el.inert), true);
        assert.deepEqual(errors, []);

        const fallback = await browser.newContext({ javaScriptEnabled: false });
        const plain = await fallback.newPage();
        await plain.goto(`${base}/video.html`);
        assert.equal(await plain.locator('.film-feature:visible').count(), 2);
        assert.equal(await plain.locator('#pool-party .film-play').getAttribute('href'), 'https://vimeo.com/651829056');
        console.log('Video selection, keyboard navigation, playback cleanup, history, permalinks, nine viewport widths, mobile menu, and no-JavaScript fallback passed.');
    } finally { await browser.close(); }
}
run().catch(error => { console.error(error); process.exitCode = 1; });
