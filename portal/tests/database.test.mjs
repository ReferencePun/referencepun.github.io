import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { ids, baseOffer } from "./support.mjs";
test("PostgreSQL migration, RLS, admin MFA, immutability and atomic event persistence", async () => {
  const db = new PGlite();
  try {
    await db.exec(
      `create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,invited_at timestamptz);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;create function auth.jwt() returns jsonb language sql stable as $$select jsonb_build_object('aal',current_setting('request.jwt.claim.aal',true))$$;grant usage on schema auth to anon,authenticated,service_role;grant execute on all functions in schema auth to authenticated;create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);`,
    );
    await db.exec(
      await readFile(
        new URL(
          "../../supabase/migrations/20261106132140_client_portal.sql",
          import.meta.url,
        ),
        "utf8",
      ),
    );
    await db.exec(
      `insert into auth.users(id) values('${ids.user}'),('${ids.other}'),('${ids.admin}');insert into portal_admins(user_id) values('${ids.admin}');insert into portal_clients(id,user_id,name,email) values('${ids.client}','${ids.user}','Client A','a@test.invalid'),('${ids.other}','${ids.other}','Client B','b@test.invalid');insert into portal_projects(id,client_id,title) values('${ids.project}','${ids.client}','Project A');insert into portal_offers(id,project_id,version,kind,service,description,deliverables,amount,billing,payment_terms,agreement_version,created_by) values('${ids.offer}','${ids.project}',1,'primary','Video','Private','Film',200000,'monthly','Advance','v1','${ids.admin}');`,
    );
    const as = async (user, aal = "aal1") =>
      db.exec(
        `reset role;set request.jwt.claim.sub='${user}';set request.jwt.claim.aal='${aal}';set role authenticated;`,
      );
    await as(ids.user);
    assert.equal(
      (await db.query("select * from portal_clients")).rows.length,
      1,
    );
    assert.equal(
      (await db.query("select * from portal_offers")).rows.length,
      1,
    );
    await assert.rejects(
      () => db.exec("update portal_offers set amount=1"),
      /permission denied/,
    );
    await assert.rejects(
      () => db.exec(`insert into portal_admins(user_id) values('${ids.user}')`),
      /permission denied/,
    );
    await assert.rejects(
      () => db.query(`select portal_apply_event('evil','invoice.paid',1,'{}')`),
      /permission denied/,
    );
    await as(ids.other);
    assert.equal(
      (await db.query("select * from portal_projects")).rows.length,
      0,
    );
    assert.equal(
      (await db.query("select * from portal_offers")).rows.length,
      0,
    );
    await as(ids.admin);
    assert.equal(
      (await db.query("select * from portal_clients")).rows.length,
      0,
    );
    await as(ids.admin, "aal2");
    assert.equal(
      (await db.query("select * from portal_clients")).rows.length,
      2,
    );
    await db.exec("reset role;set role anon;");
    await assert.rejects(
      () => db.query("select * from portal_clients"),
      /permission denied/,
    );
    await db.exec(
      `reset role;update portal_offers set state='accepted',accepted_by='${ids.user}',accepted_at=now() where id='${ids.offer}';`,
    );
    await assert.rejects(
      () => db.exec(`update portal_offers set amount=1`),
      /immutable/,
    );
    await assert.rejects(
      () => db.exec("delete from portal_offers"),
      /retained/,
    );
    assert.equal(
      (
        await db.query(
          `select public from storage.buckets where id='client-agreements'`,
        )
      ).rows[0].public,
      false,
    );
    await assert.rejects(() =>
      db.query(`select portal_apply_event('evt_bad','invoice.paid',1,$1)`, [
        JSON.stringify({
          payment: {
            id: "bad",
            offer_id: ids.other,
            amount: 1,
            currency: "usd",
            status: "paid",
            refunded_amount: 0,
            updated_at: new Date().toISOString(),
          },
        }),
      ]),
    );
    assert.equal(
      (await db.query(`select * from portal_webhook_events where id='evt_bad'`))
        .rows.length,
      0,
    );
    await db.query(
      `select portal_apply_event('evt_good','invoice.paid',1,'{}')`,
    );
    await db.query(
      `select portal_apply_event('evt_good','invoice.paid',1,'{}')`,
    );
    assert.equal(
      (await db.query("select * from portal_webhook_events")).rows.length,
      1,
    );
    await assert.rejects(
      () =>
        db.query(
          "select portal_apply_event('evt_lost_lock','invoice.paid',1,'{}',$1,$2)",
          [ids.project, ids.user],
        ),
      /lease expired/,
    );
    const offer = {
      ...baseOffer,
      project_id: ids.other,
      version: 1,
      state: "published",
    };
    delete offer.id;
    delete offer.accepted_at;
    delete offer.accepted_by;
    const project = {
      id: ids.other,
      client_id: ids.client,
      title: "Atomic proposal",
    };
    await assert.rejects(() =>
      db.query("select portal_publish_offer($1,$2)", [
        JSON.stringify(project),
        JSON.stringify({ ...offer, amount: 0 }),
      ]),
    );
    assert.equal(
      (await db.query("select * from portal_projects where id=$1", [ids.other]))
        .rows.length,
      0,
    );
    await db.query("select portal_publish_offer($1,$2)", [
      JSON.stringify(project),
      JSON.stringify(offer),
    ]);
    await assert.rejects(() =>
      db.query("select portal_publish_offer(null,$1)", [
        JSON.stringify({ ...offer, version: 2, amount: 0 }),
      ]),
    );
    assert.equal(
      (
        await db.query("select state from portal_offers where project_id=$1", [
          ids.other,
        ])
      ).rows[0].state,
      "published",
    );
    await db.query("select portal_publish_offer(null,$1)", [
      JSON.stringify({ ...offer, version: 2, amount: 300000 }),
    ]);
    assert.deepEqual(
      (
        await db.query(
          "select state from portal_offers where project_id=$1 order by version",
          [ids.other],
        )
      ).rows.map((o) => o.state),
      ["superseded", "published"],
    );
    const cancellation = {
      id: ids.client,
      offer_id: ids.offer,
      requested_by: ids.user,
      reason: "Please end my agreement",
      requested_termination_at: null,
      proposed_termination_at: "2027-02-05T00:00:00Z",
    };
    const notices = [
      {
        dedupe_key: "cancellation-test",
        recipient: "studio@example.test",
        subject: "Cancellation request received",
        message: "Synthetic test.",
      },
    ];
    await assert.rejects(() =>
      db.query("select portal_create_cancellation($1,$2)", [
        JSON.stringify(cancellation),
        JSON.stringify([{ ...notices[0], recipient: null }]),
      ]),
    );
    assert.equal(
      (await db.query("select * from portal_cancellations")).rows.length,
      0,
    );
    await db.query("select portal_create_cancellation($1,$2)", [
      JSON.stringify(cancellation),
      JSON.stringify(notices),
    ]);
    assert.equal(
      (await db.query("select * from portal_cancellations")).rows.length,
      1,
    );
    assert.equal(
      (
        await db.query(
          "select * from portal_notifications where dedupe_key='cancellation-test'",
        )
      ).rows.length,
      1,
    );
    await as(ids.user);
    await assert.rejects(
      () =>
        db.query("select portal_publish_offer(null,$1)", [
          JSON.stringify(offer),
        ]),
      /permission denied/,
    );
    await assert.rejects(
      () => db.query("select portal_invited_user('a@test.invalid')"),
      /permission denied/,
    );
  } finally {
    await db.close();
  }
});
