import test from "node:test";
import assert from "node:assert/strict";
import { createJobs } from "../../supabase/functions/_shared/jobs.mjs";
import { context, ids } from "./support.mjs";
test("notification worker is authenticated, idempotent and does not blindly retry old ambiguous sends", async () => {
  const c = context({
    env: {
      PORTAL_JOB_SECRET: "fixture_job_secret",
      RESEND_API_KEY: "fixture_key",
      NOTIFICATION_FROM: "Studio <studio@example.test>",
    },
  });
  let sent = 0;
  const job = createJobs({
    ...c,
    fetch: async (url, opts) => {
      assert.equal(url, "https://api.resend.com/emails");
      assert.ok(opts.headers["Idempotency-Key"]);
      sent++;
      return Response.json({ id: "email_fixture" });
    },
  });
  c.repo.rows.notifications.push(
    {
      id: ids.offer,
      dedupe_key: "test",
      recipient: "client@example.test",
      subject: "Test",
      message: "Synthetic test.",
      status: "queued",
    },
    {
      id: ids.other,
      status: "sending",
      attempted_at: new Date(Date.now() - 25 * 3600000).toISOString(),
    },
  );
  assert.equal(
    (await job(new Request("https://test.invalid", { method: "POST" }))).status,
    401,
  );
  const req = () =>
    new Request("https://test.invalid", {
      method: "POST",
      headers: { Authorization: "Bearer fixture_job_secret" },
    });
  assert.equal((await job(req())).status, 200);
  assert.equal(sent, 1);
  assert.equal(c.repo.rows.notifications[0].status, "sent");
  assert.equal(c.repo.rows.notifications[1].status, "needs_review");
  await job(req());
  assert.equal(sent, 1);
});
