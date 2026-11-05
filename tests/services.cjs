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
    await context.addInitScript(() => {
        window.testMailtoLinks = [];
        document.addEventListener('click', event => {
            const link = event.target.closest('a[href^="mailto:"]');
            if (link) { event.preventDefault(); window.testMailtoLinks.push(link.href); }
        }, true);
    });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    fs.mkdirSync('.qa', { recursive: true });
    const openForm = async () => { assert.equal(await page.locator('#inquiry-form').isVisible(), true); };
    const fill = async () => {
        await page.locator('#inquiry-name').fill('Test Client & Co');
        await page.locator('#inquiry-email').fill('client@example.com');
        await page.locator('#inquiry-description').fill('A portrait series & a short film.\nTiming: spring.');
        await page.locator('#inquiry-service').selectOption('Photography');
    };
    try {
        // Delivery remains disabled until a verified public endpoint is configured.
        const html = await (await context.request.get(`${base}/services.html`)).text();
        const unconfiguredHTML = html.replace(/data-form-endpoint="[^"]*"/, 'data-form-endpoint=""');
        await context.route(`${base}/services.html`, route => route.fulfill({ contentType: 'text/html', body: unconfiguredHTML }));
        await page.goto(`${base}/services.html`);
        assert.equal(await page.locator('#inquiry-submit').isDisabled(), true);
        await page.locator('#inquiry-form').evaluate(el => el.requestSubmit());
        assert.match(await page.locator('#inquiry-status').textContent(), /unavailable/);
        assert.equal(await page.evaluate(() => window.testMailtoLinks.length), 0);
        await context.unroute(`${base}/services.html`);
        const configuredHTML = html.replace(/data-form-endpoint="[^"]*"/, 'data-form-endpoint="https://formspree.io/f/testendpoint"');
        await context.route(`${base}/services.html`, route => route.fulfill({ contentType: 'text/html', body: configuredHTML }));
        let posted;
        let rejected = false;
        let submissionCount = 0;
        await context.route('https://formspree.io/f/testendpoint', route => {
            assert.equal(route.request().method(), 'POST');
            submissionCount++;
            posted = new URLSearchParams(route.request().postData());
            return route.fulfill({ status: rejected ? 429 : 200, contentType: 'text/html', body: rejected ? '<!doctype html><h1>Mock delivery rejected</h1>' : '<!doctype html><h1>Mock provider receipt</h1>' });
        });
        await page.goto(`${base}/services.html`);
        assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'), 'noindex, nofollow');
        assert.equal(await page.locator('.service-offering').count(), 5);
        assert.equal(await page.locator('main details').count(), 8);
        assert.equal(await page.locator('.administrative-details details').count(), 4);
        assert.equal(await page.locator('#campaigns').isVisible(), true);
        assert.equal(await page.locator('#campaigns').evaluate(el => el.tagName), 'DETAILS');
        assert.equal(await page.locator('.creative-services li').count(), 7);
        assert.equal(await page.locator('#inquiry-form').isVisible(), true);
        assert.equal(await page.locator('#inquiry-details, #inquiry-draft, #inquiry-communication').count(), 0);
        assert.equal(await page.locator('#inquiry-submit').textContent(), 'Submit Inquiry');
        assert.equal(await page.getByRole('form', { name: 'Have a project in mind?' }).count(), 1);
        assert.equal(await page.getByRole('combobox', { name: 'Service of Interest *', exact: true }).getAttribute('required'), '');
        assert.equal(await page.locator('.inquiry-fields input, .inquiry-fields select, .inquiry-fields textarea').count(), 7);
        assert.doesNotMatch(await page.locator('main').textContent(), /The process is designed to require minimal involvement/);
        for (const id of ['photography', 'video', 'websites', 'campaigns', 'content-delivery', 'scope', 'additional', 'partnerships']) {
            const row = page.locator(`#${id} summary`);
            assert.equal(await row.locator('.when-closed').isVisible(), true);
            await row.focus(); await page.keyboard.press('Enter');
            assert.equal(await row.locator('.when-open').isVisible(), true);
            assert.equal(await row.locator('.when-closed').isVisible(), false);
            await page.keyboard.press('Space');
            assert.equal(await row.locator('.when-closed').isVisible(), true);
        }

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
                if ([393, 1440].includes(width)) { await page.evaluate(() => document.activeElement?.blur()); await page.mouse.move(0, 0); await page.screenshot({ path: `.qa/services-inquiries-${process.env.BROWSER_ENGINE || 'chromium'}-${width}-${open ? 'open' : 'closed'}.png`, fullPage: true }); }
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
        await page.locator('#mobile-menu').click();
        await page.locator('[data-inquiry-link]').click();
        assert.equal(await page.locator('#mobile-menu').getAttribute('aria-expanded'), 'false');
        assert.equal(await page.locator('#inquiry-form').isVisible(), true);
        await page.waitForFunction(() => document.activeElement.id === 'inquiry-name');
        const navLanding = await page.locator('#inquiry-name').boundingBox();
        const headerBottom = await page.locator('header').evaluate(el => el.getBoundingClientRect().bottom);
        assert.ok(navLanding.y >= headerBottom && navLanding.y < 852, 'Inquire lands on the form clear of the sticky header');
        assert.equal(await page.locator('[data-inquiry-link]').getAttribute('aria-current'), null);
        assert.equal(await page.locator('input[name=communication]').inputValue(), 'Email');
        await page.locator('#inquiry-submit').click();
        assert.equal(await page.locator('#inquiry-name').getAttribute('aria-invalid'), 'true');
        assert.equal(await page.locator('#inquiry-name').evaluate(el => document.activeElement === el), true);
        assert.match(await page.locator('#inquiry-status').textContent(), /has not been sent/);
        await fill();
        await page.locator('#inquiry-email').fill('not-an-email');
        await page.locator('#inquiry-submit').click();
        assert.equal(await page.locator('#inquiry-email').getAttribute('aria-invalid'), 'true');
        await page.locator('#inquiry-email').fill('client@example.com');
        await page.locator('#inquiry-service').selectOption('');
        await page.locator('#inquiry-submit').click();
        assert.equal(await page.locator('#inquiry-service').getAttribute('aria-invalid'), 'true');
        assert.equal(await page.locator('#inquiry-service-error').isVisible(), true);
        assert.equal(await page.evaluate(() => window.testMailtoLinks.length), 0);
        await page.locator('#inquiry-service').selectOption('Photography');
        assert.equal(await page.locator('#inquiry-phone').getAttribute('required'), null);
        assert.equal(await page.getByRole('textbox', { name: 'Phone (optional)' }).getAttribute('autocomplete'), 'tel');
        await page.locator('#inquiry-submit').click();
        await page.waitForURL('https://formspree.io/f/testendpoint');
        assert.equal(submissionCount, 1);
        assert.equal(posted.get('subject'), 'New Project Inquiry — Photography — Test Client & Co');
        assert.equal(posted.get('email'), 'client@example.com');
        assert.equal(posted.get('phone'), '');
        assert.match(posted.get('message'), /Phone: Not provided/);
        assert.match(posted.get('message'), /A portrait series & a short film\.\r?\nTiming: spring\./);
        assert.equal(posted.get('_gotcha'), '');

        await page.goBack(); await openForm(); await fill();
        assert.equal(await page.locator('#inquiry-submit').isEnabled(), true);
        await page.locator('#inquiry-phone').fill('+44 (0)20 7946 0958');
        await page.locator('#inquiry-business').fill('Test & Co');
        await page.locator('#inquiry-timeline').fill('Spring / flexible');
        const longDescription = 'Long project description with & details. '.repeat(100);
        await page.locator('#inquiry-description').fill(longDescription);
        await page.locator('#inquiry-submit').click();
        await page.waitForURL('https://formspree.io/f/testendpoint');
        assert.equal(submissionCount, 2);
        assert.equal(posted.get('phone'), '+44 (0)20 7946 0958');
        assert.match(posted.get('message'), /Phone: \+44 \(0\)20 7946 0958/);
        assert.match(posted.get('message'), /Business \/ Organization: Test & Co/);
        assert.match(posted.get('message'), /Preferred Timeline: Spring \/ flexible/);
        assert.ok(posted.get('message').endsWith(longDescription.trim()), 'Full inquiry is sent without mailto length limits');
        assert.equal(posted.get('project'), longDescription);

        // Provider failures are never presented as successful delivery on the site.
        await page.goBack(); await openForm(); await fill();
        rejected = true;
        await page.locator('#inquiry-submit').click();
        await page.waitForURL('https://formspree.io/f/testendpoint');
        assert.match(await page.locator('h1').textContent(), /rejected/);
        await page.goBack(); await openForm();
        assert.equal(await page.locator('#inquiry-submit').isEnabled(), true);
        assert.equal(await page.locator('#inquiry-form').getAttribute('aria-busy'), null);
        assert.doesNotMatch(await page.locator('#inquiry-status').textContent(), /success|received|sent successfully/i);
        assert.equal(await page.evaluate(() => window.testMailtoLinks.length), 0, 'Submitting never opens an email app');
        assert.equal(await page.evaluate(() => localStorage.length + sessionStorage.length), 0);
        const previousCount = submissionCount;
        await fill();
        await page.locator('#inquiry-website').evaluate(el => el.value = 'spam');
        await page.locator('#inquiry-submit').click();
        assert.match(await page.locator('#inquiry-status').textContent(), /Unable to submit/);
        assert.equal(submissionCount, previousCount);
        assert.deepEqual(errors, []);
        const noJS = await browser.newContext({ javaScriptEnabled: false });
        const plain = await noJS.newPage(); await plain.goto(`${base}/services.html`);
        assert.equal(await plain.locator('noscript a').isVisible(), true);
        assert.equal(await plain.locator('#inquiry-submit').isDisabled(), true);
        await noJS.close();
        console.log('Services: prices, responsive layouts, accordion keyboard controls, reduced motion, inquiry validation, required service selection, visible form, optional phone, full direct POST, spam check, mocked delivery/rejection and no-JS fallback passed.');
    } finally { await browser.close(); }
}
run().catch(error => { console.error(error); process.exitCode = 1; });
