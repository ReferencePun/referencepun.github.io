const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs/promises');
const { chromium } = require('playwright');
const base = process.env.SITE_URL || 'http://127.0.0.1:4174';

async function run() {
    const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_PATH ? { executablePath: process.env.BROWSER_PATH } : {}) });
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    await context.route(/googletagmanager|google-analytics/, route => route.abort());
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    try {
        const originals = {};
        for (const [collection, route] of [['portraits', 'portrait.html'], ['landscapes', 'landscapes.html']]) {
            await page.goto(`${base}/${route}`);
            originals[collection] = await page.evaluate(key => window.photographyCollections[key], collection);
        }
        await page.goto(`${base}/photography.html`);
        const portraits = page.getByRole('button', { name: 'Portraits', exact: true });
        const landscapes = page.getByRole('button', { name: 'Landscapes', exact: true });
        async function checkSelection(name) {
            const selector = name === 'portraits' ? portraits : landscapes;
            assert.equal(await selector.getAttribute('aria-pressed'), 'true');
            assert.match(await selector.evaluate(el => getComputedStyle(el).boxShadow), /inset/);
            assert.equal(await page.locator('.collection-panel[aria-pressed="true"]').count(), 1);
            assert.equal(await page.locator('#photography-gallery').getAttribute('aria-labelledby'), `${name}-selector`);
            const actual = await page.locator('.portfolio-item').evaluateAll(items => items.map(item => ({
                index: Number(item.dataset.index), alt: item.querySelector('img').alt
            })));
            assert.deepEqual(actual, originals[name].map((image, index) => ({ index, alt: image.alt })));
            assert.equal(page.url(), `${base}/photography.html`, 'Switching stays on the same page');
            assert.equal(await page.locator('#lightbox [aria-live]').count(), 1, 'Switching keeps one viewer');
        }
        assert.equal(originals.portraits.length, 112);
        assert.equal(originals.landscapes.length, 130);
        await checkSelection('portraits');
        await landscapes.click();
        await checkSelection('landscapes');

        for (let i = 0; i < 3; i++) {
            await portraits.click();
            await landscapes.click();
        }
        await page.locator('.portfolio-item').first().click();
        assert.equal(await page.locator('#lightbox-img').getAttribute('src'), originals.landscapes[0].src);
        await page.getByRole('button', { name: 'Next photograph' }).click();
        assert.equal(await page.locator('#lightbox-img').getAttribute('src'), originals.landscapes[1].src, 'Repeated switching does not duplicate listeners');
        await page.keyboard.press('Escape');
        assert.equal(await page.locator('.portfolio-item').first().evaluate(el => el === document.activeElement), true);
        await landscapes.focus();
        await page.keyboard.press('ArrowLeft');
        await checkSelection('portraits');
        await page.keyboard.press('End');
        await checkSelection('landscapes');
        await portraits.focus();
        await page.keyboard.press('Space');
        await checkSelection('portraits');
        await page.locator('.portfolio-item').first().click();
        assert.equal(await page.locator('#lightbox-img').getAttribute('src'), originals.portraits[0].src);
        await page.keyboard.press('ArrowLeft');
        assert.equal(await page.locator('#lightbox-img').getAttribute('src'), originals.portraits.at(-1).src);
        await page.keyboard.press('Escape');

        for (const width of [320, 390, 768, 1280, 1920]) {
            await page.setViewportSize({ width, height: 900 });
            const boxes = await page.locator('.collection-panel').evaluateAll(items => items.map(el => {
                const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, right: r.right, height: r.height };
            }));
            assert.ok(Math.abs(boxes[0].y - boxes[1].y) < 1 && boxes[0].right < boxes[1].x, `Side-by-side selectors at ${width}px`);
            assert.ok(boxes.every(box => box.height >= 44));
            assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Overflow at ${width}px`);
        }
        await page.setViewportSize({ width: 1280, height: 900 });
        await landscapes.click();
        await page.getByRole('navigation').getByRole('link', { name: 'Film Photography', exact: true }).click();
        await checkSelection('portraits');
        await page.evaluate(() => document.fonts.ready);
        await page.locator('.portfolio-item img').first().evaluate(image => image.decode());
        await fs.mkdir(path.resolve(__dirname, '../.qa'), { recursive: true });
        await page.screenshot({ path: path.resolve(__dirname, '../.qa/film-photography-desktop.png') });
        await landscapes.click();
        await page.locator('.portfolio-item img').first().evaluate(image => image.decode());
        await page.screenshot({ path: path.resolve(__dirname, '../.qa/film-photography-landscapes.png') });
        await page.setViewportSize({ width: 390, height: 844 });
        await portraits.click();
        await page.screenshot({ path: path.resolve(__dirname, '../.qa/film-photography-mobile.png') });

        await page.goto(base);
        assert.deepEqual(await page.locator('.home-projects > section').evaluateAll(items => items.map(el => el.className)), ['vogue-feature', 'chanel-feature']);
        assert.equal(await page.locator('.film-edit').count(), 0);
        assert.equal(await page.getByRole('navigation').getByRole('link', { name: 'Portrait', exact: true }).count(), 0);
        assert.equal(await page.getByRole('navigation').getByRole('link', { name: 'Landscape', exact: true }).count(), 0);
        assert.deepEqual(errors, []);
        console.log('Film Photography: default selection, collection order, pressed state, repeated switching, viewer controls, keyboard, responsive layout, navigation reset, and homepage changes passed.');
    } finally {
        await browser.close();
    }
}
run().catch(error => { console.error(error); process.exitCode = 1; });
