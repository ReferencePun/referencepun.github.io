const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium, webkit } = require('playwright');
const base = process.env.SITE_URL || 'http://127.0.0.1:4174';

async function run() {
    const { createHash } = require('node:crypto');
    const archive = JSON.parse(fs.readFileSync('docs/services-v1-manifest.json', 'utf8'));
    for (const [asset, expected] of Object.entries(archive.sha256)) {
        const file = asset === 'services-v1.html' ? asset : `archive/services-v1/${asset}`;
        assert.equal(createHash('sha256').update(fs.readFileSync(file)).digest('hex'), expected, `Frozen V1 changed: ${file}`);
    }
    const v1 = fs.readFileSync('services-v1.html', 'utf8');
    const v2 = fs.readFileSync('services.html', 'utf8');
    const formSection = html => html.slice(html.indexOf('<section class="services-inquiries'), html.indexOf('</main>')).trim();
    assert.equal(formSection(v2), formSection(v1), 'Preserve the inquiry form and endpoint exactly');
    assert.equal(v2.includes('href="services-v1.html"'), false, 'Archive stays unlinked');
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
        await page.goto(`${base}/services-v1.html`);
        await page.locator('#video summary').click();
        assert.equal(await page.locator('#video').getAttribute('open'), '');
        assert.match(await page.locator('#video table').textContent(), /Up to 4 minutes/);
        assert.deepEqual(await page.locator('.service-price dd').allTextContents(), ['$2,000/mo', '$2,400', '$2,000/mo', '$2,400', '$2,000', '$2,400', '$500/mo', '$600']);
        await page.locator('#video [data-inquiry-service]').click();
        assert.equal(await page.locator('#inquiry-service').inputValue(), 'Video Production');
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
        assert.equal(await page.locator('main details').count(), 5);
        assert.equal(await page.locator('.administrative-details, .services-information, section.services-creative').count(), 0);
        assert.equal(await page.locator('#campaigns').isVisible(), true);
        assert.equal(await page.locator('#campaigns').evaluate(el => el.tagName), 'DETAILS');
        assert.equal(await page.locator('#campaigns li').count(), 7);
        assert.equal(await page.locator('#inquiry-form').isVisible(), true);
        assert.equal(await page.locator('#inquiry-details, #inquiry-draft, #inquiry-communication').count(), 0);
        assert.equal(await page.locator('#inquiry-submit').textContent(), 'Send Inquiry');
        assert.equal(await page.getByRole('form', { name: 'Have a project in mind?' }).count(), 1);
        assert.equal(await page.getByRole('combobox', { name: 'Service of Interest *', exact: true }).getAttribute('required'), '');
        assert.equal(await page.locator('.inquiry-fields input, .inquiry-fields select, .inquiry-fields textarea').count(), 7);
        assert.doesNotMatch(await page.locator('main').textContent(), /The process is designed to require minimal involvement/);
        for (const id of ['photography', 'video', 'websites', 'social', 'campaigns']) {
            const row = page.locator(`#${id} summary`);
            assert.equal(await row.locator('.when-closed').isVisible(), true);
            await row.focus(); await page.keyboard.press('Enter');
            assert.equal(await row.locator('.when-open').isVisible(), true);
            assert.equal(await row.locator('.when-closed').isVisible(), false);
            await page.keyboard.press('Space');
            assert.equal(await row.locator('.when-closed').isVisible(), true);
        }

        assert.match(await page.locator('.services-pricing-notes').textContent(), /automatically renew every three months\. Cancel at least 30 days before renewal/);
        assert.match(await page.locator('.services-pricing-notes').textContent(), /quoted and approved in advance/);
        assert.match(await page.locator('.services-pricing-notes').textContent(), /Rates assume you provide creative direction/);
        assert.equal(await page.locator('.service-custom-price').textContent(), 'Custom Quote');
        assert.match(await page.locator('#photography').textContent(), /Retouching, hair, makeup, styling/);
        assert.match(await page.locator('#video').textContent(), /usable footage/);
        assert.match(await page.locator('#websites').textContent(), /Hosting, domains, subscriptions, and third-party services/);
        assert.match(await page.locator('.services-commitment').textContent(), /three-month commitment/);
        assert.match(await page.locator('#video').textContent(), /Editing revisions aren’t included/);
        assert.match(await page.locator('#video').textContent(), /correct production errors that fail the agreed brief/);
        assert.match(await page.locator('.services-pricing-notes').textContent(), /Founding rates are fixed for the first term; changes are shared before renewal/);
        assert.doesNotMatch(await page.locator('main').textContent(), /20%|eight minutes of finished content/);

        await page.locator('#video summary').click();
        await page.waitForFunction(() => getComputedStyle(document.querySelector('#video summary'), '::before').backgroundColor !== 'rgba(0, 0, 0, 0)');
        assert.equal(await page.locator('#video').evaluate(el => getComputedStyle(el).backgroundColor), 'rgba(0, 0, 0, 0)');
        await page.locator('#video .service-details p').first().click();
        assert.equal(await page.locator('#video').getAttribute('open'), null);
        assert.equal(await page.locator('#video summary').evaluate(el => el === document.activeElement), true);
        await page.locator('#video summary').click();
        await page.keyboard.press('Escape');
        assert.equal(await page.locator('#video').getAttribute('open'), null);

        assert.equal(await page.locator('.service-price dt').allTextContents().then(t => t.filter(x => x === 'Founding Rate').length), 3);
        assert.deepEqual((await page.locator('.service-price dd').allTextContents()).map(s => s.trim()), ['From $1,500', 'From $1,800', 'From $1,500/mo', 'From $1,800', 'From $1,000', 'From $1,200', 'From $200/mo', 'From $240']);
        const tableRows = selector => page.locator(selector + ' tbody tr').evaluateAll(rows => rows.map(row => [...row.cells].map(cell => cell.textContent.trim())));
        assert.deepEqual(await tableRows('#photography table'), [
            ['Digital — Half Day', '$1,500', '$1,800'], ['Digital — Full Day', '$2,000', '$2,400'], ['Film — Full Day', '$2,500', '$3,000']
        ]);
        assert.deepEqual(await tableRows('#websites table'), [
            ['Landing Page', '$1,000', '$1,200'], ['Squarespace Website', '$1,500', '$1,800'],
            ['Custom Starter Website', '$2,000', '$2,400'], ['Advanced Custom Website', '$3,000+', 'Custom Quote']
        ]);
        assert.deepEqual(await tableRows('#cinematic-production table'), [
            ['Short-form', 'Up to 30 seconds', '1'], ['Medium-form', 'Up to 1 minute', '2'], ['Long-form', 'Up to 2 minutes', '4']
        ]);
        for (const [id, heading, prices] of [
            ['content-essentials', 'Content Essentials', ['$1,500/mo', '$1,800']],
            ['cinematic-production', 'Cinematic Production', ['$2,500/mo', '$3,000']],
            ['standard-visuals', 'Standard Visuals', ['$200/mo', '$240']],
            ['custom-visuals', 'Custom Visuals', ['$500/mo', '$600']]
        ]) {
            assert.equal(await page.locator(`#${id} h4`).textContent(), heading);
            assert.deepEqual(await page.locator(`#${id} dd`).allTextContents(), prices);
        }
        assert.match(await page.locator('#photography').textContent(), /including standard processing and scanning/);
        assert.equal(await page.locator('#content-essentials table').count(), 0, 'Cinematic credits must not apply to Essentials');
        assert.match(await page.locator('#content-essentials').textContent(), /Up to 12 short-form videos per month, each up to 30 seconds/);
        assert.match(await page.locator('#content-essentials').textContent(), /preparation, filming conditions, and usable footage/);
        assert.match(await page.locator('#content-essentials').textContent(), /up to 4 hours/);
        assert.match(await page.locator('#cinematic-production').textContent(), /up to 8 hours/);
        assert.match(await page.locator('#cinematic-production').textContent(), /1 long \+ 1 medium \+ 2 short/);
        assert.match(await page.locator('#standard-visuals').textContent(), /20 simple visuals/);
        assert.match(await page.locator('#custom-visuals').textContent(), /20 custom visuals/);
        assert.match(await page.locator('#websites').textContent(), /One-time fees/);
        assert.match(await page.locator('.services-process').textContent(), /For photography and video projects/);
        assert.match(await page.locator('.services-process').textContent(), /up to 4 or 8 hours, depending on your package/);
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
                const overflow = await page.evaluate(() => [...document.querySelectorAll('main table, .service-prices, .package-prices, .inquiry-fields')].filter(el => el.getClientRects().length && el.getBoundingClientRect().right > innerWidth + 1).length);
                assert.equal(overflow, 0, `Content overflow at ${width}, open=${open}`);
                assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Page overflow at ${width}`);
                if (open) {
                    for (const id of ['video', 'social']) {
                        const packages = await page.locator(`#${id} .service-package`).evaluateAll(els => els.map(el => { const r = el.getBoundingClientRect(); return { top: r.top, bottom: r.bottom, left: r.left, right: r.right }; }));
                        if (width <= 760) assert.ok(packages[1].top >= packages[0].bottom, `Packages stack on mobile: ${id}`);
                        else assert.ok(Math.abs(packages[0].top - packages[1].top) < 1 && packages[1].left >= packages[0].right, `Packages compare side by side: ${id}`);
                    }
                    const cellsFit = await page.locator('main td, .package-prices dd').evaluateAll(els => els.every(el => el.scrollWidth <= el.clientWidth + 1));
                    assert.ok(cellsFit, `Readable package prices at ${width}`);
                }
                if ([393, 1440].includes(width)) { await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo(0, 0); }); await page.mouse.move(0, 0); await page.screenshot({ path: `.qa/services-inquiries-${process.env.BROWSER_ENGINE || 'chromium'}-${width}-${open ? 'open' : 'closed'}.png`, fullPage: true, animations: 'disabled' }); }
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
        for (const width of [1280, 1440, 1710]) {
            await page.setViewportSize({ width, height: 980 });
            await page.locator('main details').evaluateAll(items => items.forEach(el => { el.open = false; }));
            await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
            const heights = await page.locator('.service-row').evaluateAll(rows => rows.map(row => row.getBoundingClientRect().height));
            for (const id of ['photography', 'video', 'websites', 'social', 'campaigns']) {
                await page.locator(`#${id} summary`).click();
                const expanded = await page.locator('.service-row').evaluateAll(rows => rows.map(row => row.getBoundingClientRect().height));
                assert.ok(expanded.every((height, i) => Math.abs(height - heights[i]) < 1), `Service heading changed height at ${width} after opening ${id}`);
                await page.locator(`#${id} summary`).click();
            }
        }
        for (const [width, height] of [[1100, 740], [1280, 650], [1280, 720], [1366, 768], [1440, 780], [1440, 900], [1536, 864], [1710, 984], [1920, 1080]]) {
            await page.setViewportSize({ width, height });
            await page.locator('main details').evaluateAll(items => items.forEach(el => { el.open = false; }));
            await page.evaluate(async () => { await document.fonts.ready; window.scrollTo(0, 0); await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); });
            const lastRow = await page.locator('#campaigns summary').boundingBox();
            assert.ok(lastRow.y + lastRow.height <= height - 16, `Creative Direction is cut off at ${width} × ${height}`);
            if (width === 1710 || (width === 1440 && height === 780)) await page.screenshot({ path: `.qa/services-first-screen-${process.env.BROWSER_ENGINE || 'chromium'}-${width}-${height}.png`, animations: 'disabled' });
        }
        for (const [width, reduced] of [[1440, 'no-preference'], [393, 'reduce']]) {
            await page.setViewportSize({ width, height: 900 });
            await page.emulateMedia({ reducedMotion: reduced });
            await page.locator('#inquiry-name').fill('Keep this name');
            for (const [id, service] of Object.entries({ photography: 'Photography', video: 'Video Production', websites: 'Website Design & Development', social: 'Social Media Content', campaigns: 'Creative Direction & Custom Productions' })) {
                await page.locator(`#${id}`).evaluate(el => { el.open = true; });
                await page.locator(`#${id} [data-inquiry-service]`).click();
                assert.equal(await page.locator('#inquiry-service').inputValue(), service);
                assert.equal(await page.locator('#inquiry-name').inputValue(), 'Keep this name');
                assert.equal(await page.locator(`#${id}`).getAttribute('open'), '', 'Inquiry link must not collapse its section');
                await page.waitForFunction(() => {
                    const r = document.querySelector('#inquiry-name').getBoundingClientRect();
                    return document.activeElement.id === 'inquiry-name' && r.top >= document.querySelector('header').getBoundingClientRect().bottom && r.bottom < innerHeight;
                });
                if (width === 1440) {
                    await page.waitForFunction(() => Math.abs(document.documentElement.scrollHeight - scrollY - innerHeight) < 2);
                    assert.ok(await page.locator('#inquiry-form').evaluate(el => el.getBoundingClientRect().bottom <= innerHeight), 'Full inquiry form fits at the page bottom');
                }
            }
            await page.locator('#inquiry-name').fill('');
        }
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.setViewportSize({ width: 393, height: 852 });
        await page.locator('#mobile-menu').click();
        await page.locator('header [data-inquiry-link]').click();
        assert.equal(await page.locator('#mobile-menu').getAttribute('aria-expanded'), 'false');
        assert.equal(await page.locator('#inquiry-form').isVisible(), true);
        await page.waitForFunction(() => document.activeElement.id === 'inquiry-name');
        const navLanding = await page.locator('#inquiry-name').boundingBox();
        const headerBottom = await page.locator('header').evaluate(el => el.getBoundingClientRect().bottom);
        assert.ok(navLanding.y >= headerBottom && navLanding.y < 852, 'Inquire lands on the form clear of the sticky header');
        assert.equal(await page.locator('header [data-inquiry-link]').getAttribute('aria-current'), null);
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
