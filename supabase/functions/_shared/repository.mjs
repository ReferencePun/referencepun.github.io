import { fail } from "./domain.mjs";
export function repository(db) {
  const result = async (q) => {
    const { data, error } = await q;
    if (error) throw new Error("Database operation failed: " + error.code);
    return data;
  };
  const table = (t) => db.from("portal_" + t);
  return {
    queuedNotifications: () =>
      result(
        table("notifications")
          .select("*")
          .in("status", ["queued", "sending"])
          .order("created_at", { ascending: true })
          .limit(30),
      ),
    recentNotifications: () =>
      result(
        table("notifications")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100),
      ),
    all: (t, filters = {}) => {
      let q = table(t).select("*");
      for (const [k, v] of Object.entries(filters)) q = q.eq(k, v);
      return result(q);
    },
    one: async (t, filters) => {
      let q = table(t).select("*");
      for (const [k, v] of Object.entries(filters)) q = q.eq(k, v);
      return result(q.maybeSingle());
    },
    insert: (t, value) => result(table(t).insert(value).select().single()),
    update: (t, filters, value) => {
      let q = table(t).update(value);
      for (const [k, v] of Object.entries(filters)) q = q.eq(k, v);
      return result(q.select());
    },
    remove: (t, filters) => {
      let q = table(t).delete();
      for (const [k, v] of Object.entries(filters)) q = q.eq(k, v);
      return result(q);
    },
    rpc: (name, params) => result(db.rpc("portal_" + name, params)),
    audit: (actor, action, id) =>
      result(table("audit").insert({ actor_id: actor, action, record_id: id })),
    notify: (n) =>
      result(
        table("notifications").upsert(n, {
          onConflict: "dedupe_key",
          ignoreDuplicates: true,
        }),
      ),
    async lock(key, fn) {
      const owner = crypto.randomUUID();
      if (
        !(await this.rpc("take_lock", {
          lock_key: key,
          lock_owner: owner,
          lease_seconds: 180,
        }))
      )
        fail(409, "Another update is in progress. Please try again shortly.");
      try {
        return await fn(owner);
      } finally {
        await this.rpc("release_lock", { lock_key: key, lock_owner: owner });
      }
    },
    async owner(offerId, user, isAdmin = false) {
      const offer = await this.one("offers", { id: offerId });
      if (!offer) fail(404, "Project not found.");
      const project = await this.one("projects", { id: offer.project_id });
      const client = await this.one("clients", { id: project.client_id });
      if (!isAdmin && client.user_id !== user) fail(404, "Project not found.");
      return { offer, project, client };
    },
  };
}
