const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium, webkit } = require('playwright');
const base = process.env.SITE_URL || 'http://127.0.0.1:4174';

async function run() {
    const engine = process.env.BROWSER_ENGINE === 'webkit' ? webkit : chromium;
    const browser = await engine.launch({ headless: true, ...(process.env.BROWSER_PATH ? { executablePath: process.env.BROWSER_PATH } : {}) });
    const context = await browser.newContext();
    await context.route(/googletagmanager|google-analytics/, route => route.abort());
    const errors = [];
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    fs.mkdirSync('.qa', { recursive: true });
    const openForm = async () => { await page.locator('#inquiry-details').evaluate(el => el.open = true); };
    const fill = async () => {
        await page.locator('#inquiry-name').fill('Test Client & Co');
        await page.locator('#inquiry-email').fill('client@example.com');
        await page.locator('#inquiry-description').fill('A portrait series & a short film.\nTiming: spring.');
        await page.locator('#inquiry-service').selectOption('Photography');
    };
    try {
        await page.goto(`${base}/services.html`);
        assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'), 'noindex, nofollow');
        assert.equal(await page.locator('.service-offering').count(), 4);
        assert.equal(await page.locator('.service-price dt').allTextContents().then(t => t.filter(x => x === 'Founding Rate').length), 3);
        assert.deepEqual((await page.locator('.service-price dd').allTextContents()).map(s => s.trim()), ['$2,000/mo', '$2,400', '$2,000/mo', '$2,400', '$2,000', '$2,400', '$500/mo', '$600']);
        assert.match(await page.locator('#photography table').textContent(), /\$2,500\/mo.*\$3,000/);
        assert.match(await page.locator('#websites table').textContent(), /\$3,000.*\$3,600/);
        assert.deepEqual(await page.locator('#video tbody tr').allTextContents(), ['Short-formUp to 30 seconds1', 'Medium-formUp to 2 minutes2', 'Long-formUp to 4 minutes4']);
        const summary = page.locator('.service-row').first();
        await summary.focus(); await page.keyboard.press('Enter');
        assert.equal(await page.locator('#photography').getAttribute('open'), '');
        await page.keyboard.press('Space');
        assert.equal(await page.locator('#photography').getAttribute('open'), null);
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await summary.click();
        assert.equal(await page.locator('#photography > .service-details').evaluate(el => getComputedStyle(el).animationName), 'none');

        for (const width of [320, 393, 600, 768, 1000, 1024, 1280, 1440, 1710]) {
            await page.setViewportSize({ width, height: 980 });
            await page.evaluate(() => document.fonts.ready);
            for (const open of [false, true]) {
                await page.locator('main details').evaluateAll((items, value) => items.forEach(el => el.open = value), open);
                const overflow = await page.evaluate(() => [...document.querySelectorAll('main table, .service-prices, .inquiry-fields')].filter(el => el.getClientRects().length && el.getBoundingClientRect().right > innerWidth + 1).length);
                assert.equal(overflow, 0, `Content overflow at ${width}, open=${open}`);
                assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Page overflow at ${width}`);
                if ([393, 1440].includes(width)) { await page.evaluate(() => document.activeElement?.blur()); await page.screenshot({ path: `.qa/services-inquiries-${process.env.BROWSER_ENGINE || 'chromium'}-${width}-${open ? 'open' : 'closed'}.png`, fullPage: true }); }
            }
            if (width > 1000) {
                const header = await page.evaluate(() => {
                    const links = [...document.querySelectorAll('header nav a')].map(el => el.getBoundingClientRect());
                    return links.every((r, i) => i === 0 ? r.left > document.querySelector('.logo').getBoundingClientRect().right : r.left > links[i - 1].right)
                        && links.at(-1).right < document.querySelector('.social-icons').getBoundingClientRect().left;
                });
                assert.equal(header, true, `Header collision at ${width}`);
            }
        }
        await page.setViewportSize({ width: 393, height: 852 });
        await page.locator('#inquiry-details').evaluate(el => el.open = false);
        await page.locator('#mobile-menu').click();
        await page.locator('[data-inquiry-link]').click();
        assert.equal(await page.locator('#mobile-menu').getAttribute('aria-expanded'), 'false');
        assert.equal(await page.locator('#inquiry-details').getAttribute('open'), '');
        assert.equal(await page.locator('[data-inquiry-link]').getAttribute('aria-current'), null);
        assert.equal(await page.locator('#inquiry-communication').inputValue(), 'Email');
        assert.equal(await page.locator('#inquiry-phone').isVisible(), false);
        await page.locator('#inquiry-submit').click();
        assert.equal(await page.locator('#inquiry-name').getAttribute('aria-invalid'), 'true');
        assert.equal(await page.locator('#inquiry-name').evaluate(el => document.activeElement === el), true);
        assert.match(await page.locator('#inquiry-status').textContent(), /has not been sent/);
        await fill();
        await page.locator('#inquiry-email').fill('not-an-email');
        await page.locator('#inquiry-submit').click();
        assert.equal(await page.locator('#inquiry-email').getAttribute('aria-invalid'), 'true');
        await page.locator('#inquiry-email').fill('client@example.com');
        await page.locator('#inquiry-submit').click();
        const href = await page.locator('#inquiry-open-draft').getAttribute('href');
        const draft = new URL(href);
        assert.equal(draft.protocol, 'mailto:');
        assert.equal(draft.pathname, 'Dylan.Forsberg@gmail.com');
        assert.equal(draft.searchParams.get('subject'), 'New Project Inquiry — Photography — Test Client & Co');
        assert.match(draft.searchParams.get('body'), /A portrait series & a short film\.\nTiming: spring\./);
        assert.doesNotMatch(draft.searchParams.get('body'), /Phone Number:/);
        assert.match(await page.locator('#inquiry-status').textContent(), /has not been sent/);
        // Inspect the real mailto link without launching an OS email client during tests.
        await page.locator('#inquiry-open-draft').evaluate(el => el.addEventListener('click', event => event.preventDefault()));
        await page.locator('#inquiry-open-draft').click();
        await page.locator('#inquiry-communication').selectOption('Phone call');
        assert.equal(await page.locator('#inquiry-phone').isVisible(), true);
        assert.equal(await page.locator('#inquiry-phone').getAttribute('required'), null);
        await page.locator('#inquiry-phone').fill('555-0100');
        await page.locator('#inquiry-call-times').fill('Weekdays after 2 PM ET');
        await page.locator('#inquiry-submit').click();
        assert.match(await page.locator('#inquiry-draft-text').inputValue(), /555-0100[\s\S]*Weekdays after 2 PM ET/);
        await page.locator('#inquiry-communication').selectOption('Email');
        await page.locator('#inquiry-description').fill('Long project description. '.repeat(150));
        await page.locator('#inquiry-submit').click();
        assert.match(await page.locator('#inquiry-draft-help').textContent(), /long inquiry/);
        assert.ok((await page.locator('#inquiry-draft-text').inputValue()).includes('Long project description. '.repeat(150).trim()));
        assert.doesNotMatch(await page.locator('#inquiry-draft-text').inputValue(), /555-0100/);
        await page.locator('#inquiry-copy').click();
        await page.waitForFunction(() => /Draft copied|Select and copy/.test(document.getElementById('inquiry-status').textContent));
        assert.match(await page.locator('#inquiry-status').textContent(), /Draft copied|Select and copy/);
        assert.equal(await page.evaluate(() => localStorage.length + sessionStorage.length), 0);
        await page.locator('#inquiry-website').evaluate(el => el.value = 'spam');
        await page.locator('#inquiry-submit').click();
        assert.match(await page.locator('#inquiry-status').textContent(), /Unable to prepare/);

        // Exercise native HTTPS submission without sending real client data or requiring an account.
        const html = await (await context.request.get(`${base}/services.html`)).text();
        await context.route(`${base}/services.html`, route => route.fulfill({ contentType: 'text/html', body: html.replace('data-form-endpoint=""', 'data-form-endpoint="https://formspree.io/f/testendpoint"') }));
        let posted;
        await context.route('https://formspree.io/f/testendpoint', route => {
            assert.equal(route.request().method(), 'POST');
            posted = new URLSearchParams(route.request().postData());
            return route.fulfill({ contentType: 'text/html', body: '<!doctype html><h1>Mock provider receipt</h1>' });
        });
        await page.goto(`${base}/services.html`);
        await openForm(); await fill();
        assert.equal(await page.locator('#inquiry-submit').textContent(), 'Send Inquiry');
        assert.equal(await page.locator('#inquiry-fallback').isVisible(), true);
        await page.locator('#inquiry-submit').click();
        await page.waitForURL('https://formspree.io/f/testendpoint');
        assert.equal(posted.get('subject'), 'New Project Inquiry — Photography — Test Client & Co');
        assert.equal(posted.get('email'), 'client@example.com');
        assert.match(posted.get('message'), /Preferred Communication: Email/);
        assert.equal(posted.has('phone'), false);
        assert.equal(posted.get('_gotcha'), '');
        // A provider rejection never becomes a local success. Returning leaves a usable draft fallback.
        await context.unroute('https://formspree.io/f/testendpoint');
        await context.route('https://formspree.io/f/testendpoint', route => route.fulfill({ status: 429, contentType: 'text/html', body: '<!doctype html><h1>Mock delivery rejected</h1>' }));
        await page.goto(`${base}/services.html`); await openForm(); await fill();
        await page.locator('#inquiry-submit').click();
        await page.waitForURL('https://formspree.io/f/testendpoint');
        assert.match(await page.locator('h1').textContent(), /rejected/);
        await page.goBack(); await openForm(); await fill();
        await page.locator('#inquiry-fallback').click();
        assert.match(await page.locator('#inquiry-status').textContent(), /has not been sent/);
        assert.equal(await page.locator('#inquiry-submit').isEnabled(), true);
        assert.deepEqual(errors, []);
        const noJS = await browser.newContext({ javaScriptEnabled: false });
        const plain = await noJS.newPage(); await plain.goto(`${base}/services.html`);
        await plain.locator('#inquiry-details summary').click();
        assert.equal(await plain.locator('noscript a').isVisible(), true);
        await noJS.close();
        console.log('Services: prices, responsive layouts, accordion keyboard controls, reduced motion, inquiry validation, optional calls, encoded drafts, spam check, mocked delivery/rejection and no-JS fallback passed.');
    } finally { await browser.close(); }
}
run().catch(error => { console.error(error); process.exitCode = 1; });
