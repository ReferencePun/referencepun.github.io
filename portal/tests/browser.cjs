// Browser checks use a synthetic client and intercepted provider responses; no live requests or charges.
const assert = require("node:assert/strict");
const { chromium, webkit } = require("playwright");
const fs = require("node:fs");
const base = process.env.SITE_URL || "http://127.0.0.1:4174";
(async () => {
  const { memoryRepo, ids, baseOffer } = await import("./support.mjs");
  const { references } =
    await import("../../supabase/functions/_shared/domain.mjs");
  const rows = memoryRepo().rows;
  const data = {
    role: "client",
    mode: "test",
    clients: rows.clients,
    projects: rows.projects,
    offers: [{ ...baseOffer, state: "published" }],
    agreements: [],
    payments: [],
    subscriptions: [],
    terms: [],
    cancellations: [],
  };
  const browser = await (
    process.env.BROWSER_ENGINE === "webkit" ? webkit : chromium
  ).launch({
    headless: true,
    ...(process.env.BROWSER_PATH
      ? { executablePath: process.env.BROWSER_PATH }
      : {}),
  });
  fs.mkdirSync(".qa/portal", { recursive: true });
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    let publicConfig = { supabaseUrl: "", supabasePublishableKey: "" };
    await context.route("**/client/config.json", (r) =>
      r.fulfill({ json: publicConfig }),
    );
    await page.goto(base + "/client/");
    await page
      .getByText("Client access is being prepared.", { exact: false })
      .waitFor();
    assert.equal(await page.locator("#login-form").count(), 0);
    publicConfig = {
      supabaseUrl: "https://portal-test.supabase.co",
      supabasePublishableKey: "sb_publishable_placeholder",
    };
    await context.route("https://portal-test.supabase.co/**", (r) => {
      const url = new URL(r.request().url());
      const action = url.pathname.split("/").at(-1);
      const b = r.request().postDataJSON() || {};
      if (action === "state") return r.fulfill({ json: data });
      if (action === "otp") return r.fulfill({ json: {} });
      if (action === "accept") {
        assert.deepEqual(Object.keys(b), ["offer_id"]);
        data.offers[0].state = "accepted";
        return r.fulfill({ json: { accepted: true } });
      }
      if (action === "cancel") {
        assert.equal(b.offer_id, ids.offer);
        return r.fulfill({
          json: {
            status: "requested",
            requested_at: new Date().toISOString(),
            proposed_termination_at: "2027-02-05T00:00:00Z",
          },
        });
      }
      if (action === "checkout") {
        assert.deepEqual(b, { offer_id: ids.offer });
        return r.fulfill({
          json: {
            publishableKey: "pk_test_placeholder",
            clientSecret: "fixture_secret",
          },
        });
      }
      if (action === "factors")
        return r.fulfill({
          json: { totp: [{ id: ids.offer, status: "verified" }], all: [] },
        });
      return r.fulfill({
        json: {
          user: { id: ids.user, email: "client@example.test" },
          factors: [],
        },
      });
    });
    await page.reload();
    await page.locator("#login-form").waitFor();
    await page.locator("input[type=email]").fill("client@example.test");
    await page
      .getByRole("button", { name: "Send secure sign-in link" })
      .click();
    await page
      .getByText("If this email has a client invitation", { exact: false })
      .waitFor();
    await page.screenshot({
      path: ".qa/portal/login-desktop.png",
      fullPage: true,
    });
    await context.addInitScript(
      ({ user }) => {
        const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" })),
          payload = btoa(
            JSON.stringify({
              sub: user,
              exp: Math.floor(Date.now() / 1000) + 3600,
              aal: "aal1",
              role: "authenticated",
            }),
          );
        sessionStorage.setItem(
          "sb-portal-test-auth-token",
          JSON.stringify({
            access_token: header + "." + payload + ".fixture",
            refresh_token: "fixture_refresh",
            expires_at: Math.floor(Date.now() / 1000) + 3600,
            expires_in: 3600,
            token_type: "bearer",
            user: {
              id: user,
              email: "client@example.test",
              app_metadata: {},
              user_metadata: {},
            },
          }),
        );
      },
      { user: ids.user },
    );
    await page.reload();
    await page
      .getByRole("heading", { name: "Test Client", exact: true })
      .waitFor();
    await page.getByRole("link", { name: "Projects", exact: true }).click();
    await page.locator(".project summary").click();
    page.on("dialog", (d) => d.accept());
    await page.getByRole("button", { name: "Accept this proposal" }).click();
    await page
      .getByText(
        "Proposal accepted. Your agreement status is shown separately.",
      )
      .waitFor();
    await page.locator(".project summary").click();
    assert.equal(await page.locator("[data-pay]").count(), 0);
    await page.getByText("Payment will open", { exact: false }).waitFor();
    data.agreements = rows.agreements;
    data.terms = [
      {
        offer_id: ids.offer,
        effective_at: "2026-11-05",
        initial_term_end: "2027-02-05",
        current_term_start: "2026-11-05",
        renewal_at: "2027-02-05",
        cancellation_deadline: "2027-01-06",
        monthly_amount: 200000,
        status: "active",
      },
    ];
    data.offers[0].billing = "monthly";
    await page.reload();
    await page.locator(".project summary").click();
    await page.screenshot({
      path: ".qa/portal/projects-desktop.png",
      fullPage: true,
    });
    await context.addInitScript(() => {
      window.Stripe = () => ({
        createEmbeddedCheckoutPage: async ({ fetchClientSecret }) => {
          await fetchClientSecret();
          return {
            mount: (s) => {
              const el = document.querySelector(s);
              el.innerHTML = "<p>Mock Stripe checkout — layout test only</p>";
              el.style.minHeight = "400px";
            },
            destroy: () => {},
          };
        },
      });
    });
    await page.reload();
    await page.locator(".project summary").click();
    await page.getByRole("button", { name: "Start monthly billing" }).click();
    await page.getByText("Mock Stripe checkout — layout test only").waitFor();
    await page.getByRole("link", { name: "Back to projects" }).click();
    await page.locator(".project").waitFor();
    for (const viewport of [
      { width: 1440, height: 1000 },
      { width: 390, height: 844 },
      { width: 320, height: 700 },
      { width: 844, height: 390 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto(base + "/client/#projects");
      await page.locator(".project summary").waitFor();
      await page.locator(".project summary").click();
      assert.ok(
        await page.locator(".portal-nav").evaluate((nav) => {
          const rect = nav.getBoundingClientRect();
          return [...nav.querySelectorAll("a")].every((a) => {
            const box = a.getBoundingClientRect();
            return box.top >= rect.top && box.bottom <= rect.bottom;
          });
        }),
        "Navigation links must be fully inside the visible menu",
      );
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        "No horizontal overflow at " + viewport.width,
      );
      await page.getByRole("link", { name: "Billing", exact: true }).click();
      await page
        .getByRole("button", { name: "Request cancellation or nonrenewal" })
        .click();
      await page.getByRole("link", { name: "Back to billing" }).click();
      await page
        .getByRole("heading", { name: "Billing", exact: true })
        .waitFor();
      await page.screenshot({
        path: ".qa/portal/billing-" + viewport.width + ".png",
        fullPage: true,
      });
    }
    data.role = "admin";
    data.references = references;
    data.notifications = [];
    await page.goto(base + "/client/#administration");
    await page.reload();
    await page
      .getByRole("heading", { name: "Studio administration", exact: true })
      .first()
      .waitFor();
    await page
      .locator(".admin-panel summary")
      .filter({ hasText: "New project or approved charge" })
      .click();
    await page.setViewportSize({ width: 390, height: 844 });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    await page.screenshot({
      path: ".qa/portal/admin-mobile.png",
      fullPage: true,
    });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.screenshot({
      path: ".qa/portal/admin-desktop.png",
      fullPage: true,
    });
    data.needsMfa = true;
    await page.reload();
    await page
      .getByRole("heading", { name: "Secure studio access." })
      .waitFor();
    assert.equal(await page.locator("#offer-create").count(), 0);
    assert.deepEqual(errors, []);
    console.log(
      "Portal browser checks passed: login, private proposals, agreement gate, checkout lifecycle, cancellation navigation, admin MFA, desktop/mobile. Providers mocked.",
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
