import { contractWindow } from "./domain.mjs";
export function createJobs({ repo, env, fetch: send = fetch }) {
  return async (req) => {
    if (
      req.method !== "POST" ||
      !env.PORTAL_JOB_SECRET ||
      req.headers.get("authorization") !== "Bearer " + env.PORTAL_JOB_SECRET
    )
      return new Response("Unauthorized", { status: 401 });
    try {
      return await repo.lock("jobs:notifications", async () => {
        let reminders = 0,
          sent = 0;
        const days = Number(env.RENEWAL_REMINDER_DAYS || 45);
        if (env.RENEWAL_REMINDERS_ENABLED === "true") {
          for (const term of await repo.all("contract_terms")) {
            if (term.status !== "active") continue;
            const { offer, project, client } = await repo.owner(
              term.offer_id,
              "",
              true,
            );
            const current = contractWindow(
              term.effective_at,
              offer.term_months,
              offer.notice_days,
            );
            await repo.update(
              "contract_terms",
              { offer_id: offer.id },
              current,
            );
            const remaining =
              (new Date(current.renewal_at) - new Date()) / 86400000;
            if (remaining <= days && remaining > 0) {
              for (const recipient of new Set(
                [client.email, env.ADMIN_NOTIFICATION_EMAIL].filter(Boolean),
              ))
                await repo.notify({
                  dedupe_key: `renewal:${offer.id}:${current.renewal_at}:${recipient}`,
                  recipient,
                  subject: "Upcoming agreement renewal",
                  message: `${project.title} renews on ${current.renewal_at.slice(0, 10)} at the agreed monthly amount. Notice deadline: ${current.cancellation_deadline.slice(0, 10)}. Review the agreement or request nonrenewal at ${env.PORTAL_ORIGIN}/client/.`,
                });
              reminders++;
            }
          }
        }
        if (env.RESEND_API_KEY && env.NOTIFICATION_FROM) {
          const queued = await repo.queuedNotifications();
          const started = Date.now();
          for (const n of queued) {
            if (Date.now() - started > 60000) break;
            // Resend deduplicates for 24 hours. Ambiguous old deliveries need review, not blind resends.
            if (
              n.attempted_at &&
              Date.now() - new Date(n.attempted_at) > 23 * 3600000
            ) {
              await repo.update(
                "notifications",
                { id: n.id },
                { status: "needs_review" },
              );
              continue;
            }
            await repo.update(
              "notifications",
              { id: n.id },
              {
                status: "sending",
                attempted_at: n.attempted_at || new Date().toISOString(),
              },
            );
            const response = await send("https://api.resend.com/emails", {
              method: "POST",
              signal: AbortSignal.timeout(10000),
              headers: {
                Authorization: "Bearer " + env.RESEND_API_KEY,
                "Content-Type": "application/json",
                "Idempotency-Key": "portal:" + n.id,
              },
              body: JSON.stringify({
                from: env.NOTIFICATION_FROM,
                to: [n.recipient],
                subject: n.subject,
                text: n.message,
              }),
            });
            if (!response.ok) continue;
            const result = await response.json();
            await repo.update(
              "notifications",
              { id: n.id },
              {
                status: "sent",
                provider_id: result.id,
                sent_at: new Date().toISOString(),
              },
            );
            sent++;
          }
        }
        return Response.json({
          reminders,
          sent,
          emailConfigured: !!env.RESEND_API_KEY,
        });
      });
    } catch {
      return new Response("Job incomplete; retry later", { status: 503 });
    }
  };
}
