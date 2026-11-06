-- Private client records. No anonymous policies; financial writes are server-only.
create table public.portal_admins (user_id uuid primary key references auth.users(id), created_at timestamptz not null default now());
create table public.portal_clients (
 id uuid primary key default gen_random_uuid(), user_id uuid unique references auth.users(id),
 name text not null, email text not null unique, stripe_customer_id text unique, created_at timestamptz not null default now()
);
create table public.portal_projects (
 id uuid primary key default gen_random_uuid(), client_id uuid not null references public.portal_clients(id),
 title text not null, status text not null default 'proposal', created_at timestamptz not null default now()
);
create table public.portal_offers (
 id uuid primary key default gen_random_uuid(), project_id uuid not null references public.portal_projects(id),
 version integer not null, kind text not null check(kind in ('primary','additional')),
 service text not null, description text not null, deliverables text not null, production_schedule text not null default '',
 amount bigint not null check(amount > 0 and amount <= 100000000), currency text not null default 'usd' check(currency='usd'),
 billing text not null check(billing in ('one_time','monthly')), payment_terms text not null,
 term_months integer not null default 3 check(term_months between 1 and 36), notice_days integer not null default 30 check(notice_days between 0 and 365),
 effective_date date, agreement_version text not null, requires_agreement boolean not null default true,
 state text not null default 'published' check(state in ('published','accepted','superseded')),
 created_by uuid not null references auth.users(id), created_at timestamptz not null default now(),
 accepted_by uuid references auth.users(id), accepted_at timestamptz,
 unique(project_id,version), check((state='accepted')=(accepted_at is not null)),
 check(kind <> 'additional' or billing='one_time')
);
create table public.portal_agreements (
 id uuid primary key default gen_random_uuid(), offer_id uuid not null references public.portal_offers(id),
 version text not null, file_path text not null unique, file_sha256 text not null, original_name text not null,
 status text not null check(status in ('unsigned','signed')), signed_at timestamptz,
 confirmed_by uuid not null references auth.users(id), confirmation_note text not null default '',
 created_at timestamptz not null default now(), check((status='signed')=(signed_at is not null))
);
create table public.portal_checkout_attempts (
 id uuid primary key default gen_random_uuid(), offer_id uuid not null references public.portal_offers(id),
 stripe_session_id text unique, status text not null default 'creating' check(status in ('creating','open','complete','expired')),
 created_at timestamptz not null default now(), expires_at timestamptz not null default now()+interval '1 hour'
);
create unique index portal_one_open_checkout on public.portal_checkout_attempts(offer_id) where status <> 'expired';
create table public.portal_subscriptions (
 id text primary key, project_id uuid not null references public.portal_projects(id), offer_id uuid not null unique references public.portal_offers(id),
 status text not null, next_payment_at timestamptz, cancel_at timestamptz, updated_at timestamptz not null default now()
);
create unique index portal_one_active_subscription on public.portal_subscriptions(project_id) where status not in ('canceled','incomplete_expired');
create table public.portal_contract_terms (
 offer_id uuid primary key references public.portal_offers(id), subscription_id text not null references public.portal_subscriptions(id),
 effective_at timestamptz not null, initial_term_end timestamptz not null, current_term_start timestamptz not null,
 renewal_at timestamptz not null, cancellation_deadline timestamptz not null, monthly_amount bigint not null,
 agreement_version text not null, status text not null default 'active', termination_at timestamptz
);
create table public.portal_payments (
 id text primary key, offer_id uuid not null references public.portal_offers(id), amount bigint not null,
 currency text not null, status text not null, paid_at timestamptz, invoice_url text, invoice_pdf text, receipt_url text,
 refunded_amount bigint not null default 0, updated_at timestamptz not null default now()
);
create table public.portal_cancellations (
 id uuid primary key default gen_random_uuid(), offer_id uuid not null references public.portal_offers(id),
 requested_by uuid not null references auth.users(id), requested_at timestamptz not null default now(), reason text not null default '',
 requested_termination_at timestamptz, proposed_termination_at timestamptz not null,
 effective_termination_at timestamptz, status text not null default 'requested' check(status in ('requested','scheduled','completed')),
 reviewed_by uuid references auth.users(id), reviewed_at timestamptz, admin_note text not null default ''
);
create unique index portal_one_cancellation on public.portal_cancellations(offer_id) where status in ('requested','scheduled');
create table public.portal_webhook_events (id text primary key, type text not null, created bigint not null, processed_at timestamptz not null default now());
create table public.portal_locks (key text primary key, owner uuid not null, expires_at timestamptz not null);
create table public.portal_notifications (
 id uuid primary key default gen_random_uuid(), dedupe_key text not null unique, recipient text not null,
 subject text not null, message text not null, status text not null default 'queued', provider_id text,
 created_at timestamptz not null default now(), attempted_at timestamptz, sent_at timestamptz
);
create table public.portal_audit (
 id bigint generated always as identity primary key, actor_id uuid references auth.users(id), action text not null,
 record_id text, created_at timestamptz not null default now()
);

create function public.portal_is_admin() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.portal_admins where user_id=auth.uid()) and auth.jwt()->>'aal'='aal2';
$$;
create function public.portal_owns_project(pid uuid) returns boolean language sql stable security definer set search_path='' as $$
 select public.portal_is_admin() or exists(select 1 from public.portal_projects p join public.portal_clients c on c.id=p.client_id where p.id=pid and c.user_id=auth.uid());
$$;
create function public.portal_owns_offer(oid uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.portal_offers o where o.id=oid and public.portal_owns_project(o.project_id));
$$;

-- Revoke broad default permissions, including RPC access; grant only necessary reads.
do $$ declare t text; begin
 foreach t in array array['portal_admins','portal_clients','portal_projects','portal_offers','portal_agreements','portal_checkout_attempts','portal_subscriptions','portal_contract_terms','portal_payments','portal_cancellations','portal_webhook_events','portal_locks','portal_notifications','portal_audit'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('revoke all on public.%I from anon, authenticated',t);
 execute format('grant all on public.%I to service_role',t);
 end loop;
end $$;
grant usage, select on sequence public.portal_audit_id_seq to service_role;
grant select on public.portal_clients,public.portal_projects,public.portal_offers,public.portal_agreements,public.portal_subscriptions,public.portal_contract_terms,public.portal_payments,public.portal_cancellations to authenticated;
create policy client_read on public.portal_clients for select to authenticated using(user_id=auth.uid() or public.portal_is_admin());
create policy project_read on public.portal_projects for select to authenticated using(public.portal_owns_project(id));
create policy offer_read on public.portal_offers for select to authenticated using(public.portal_owns_project(project_id));
create policy agreement_read on public.portal_agreements for select to authenticated using(public.portal_owns_offer(offer_id));
create policy subscription_read on public.portal_subscriptions for select to authenticated using(public.portal_owns_offer(offer_id));
create policy term_read on public.portal_contract_terms for select to authenticated using(public.portal_owns_offer(offer_id));
create policy payment_read on public.portal_payments for select to authenticated using(public.portal_owns_offer(offer_id));
create policy cancellation_read on public.portal_cancellations for select to authenticated using(public.portal_owns_offer(offer_id));

create function public.portal_protect_offer() returns trigger language plpgsql set search_path='' as $$
 begin
 if tg_op='DELETE' then raise exception 'Proposals are retained for audit'; end if;
 if old.state='accepted' and new is distinct from old then raise exception 'Accepted proposals are immutable'; end if;
 if (to_jsonb(new)-array['state','accepted_at','accepted_by']) is distinct from (to_jsonb(old)-array['state','accepted_at','accepted_by']) then raise exception 'Create an explicit new proposal version'; end if;
 return new;
 end;
$$;
create trigger portal_offer_immutable before update or delete on public.portal_offers for each row execute function public.portal_protect_offer();
create function public.portal_protect_agreement() returns trigger language plpgsql set search_path='' as $$ begin raise exception 'Agreement records are append-only'; end $$;
create trigger portal_agreement_immutable before update or delete on public.portal_agreements for each row execute function public.portal_protect_agreement();

create function public.portal_take_lock(lock_key text, lock_owner uuid, lease_seconds integer default 120) returns boolean language plpgsql security definer set search_path='' as $$
 declare changed integer;
 begin
 insert into public.portal_locks(key,owner,expires_at) values(lock_key,lock_owner,now()+make_interval(secs=>least(lease_seconds,300)))
 on conflict(key) do update set owner=excluded.owner,expires_at=excluded.expires_at where public.portal_locks.expires_at<now();
 get diagnostics changed=row_count; return changed=1;
 end;
$$;
create function public.portal_release_lock(lock_key text, lock_owner uuid) returns void language sql security definer set search_path='' as $$ delete from public.portal_locks where key=lock_key and owner=lock_owner $$;

-- Publishing a proposal and superseding an unaccepted version are one transaction.
create function public.portal_publish_offer(project_doc jsonb, offer_doc jsonb) returns uuid language plpgsql security definer set search_path='' as $$
 declare o public.portal_offers; saved uuid;
 begin
 o=jsonb_populate_record(null::public.portal_offers,offer_doc);
 if project_doc is not null then
 insert into public.portal_projects(id,client_id,title) values((project_doc->>'id')::uuid,(project_doc->>'client_id')::uuid,project_doc->>'title');
 end if;
 perform 1 from public.portal_projects where id=o.project_id for update;
 if o.kind='primary' then
 if exists(select 1 from public.portal_offers where project_id=o.project_id and kind='primary' and state='accepted') then raise exception 'Accepted scope requires a new project or additional offer'; end if;
 update public.portal_offers set state='superseded' where project_id=o.project_id and kind='primary' and state='published';
 end if;
 insert into public.portal_offers(project_id,version,kind,service,description,deliverables,production_schedule,amount,currency,billing,payment_terms,term_months,notice_days,effective_date,agreement_version,requires_agreement,created_by)
 values(o.project_id,o.version,o.kind,o.service,o.description,o.deliverables,o.production_schedule,o.amount,o.currency,o.billing,o.payment_terms,o.term_months,o.notice_days,o.effective_date,o.agreement_version,o.requires_agreement,o.created_by) returning id into saved;
 insert into public.portal_audit(actor_id,action,record_id) values(o.created_by,'proposal.published',saved::text);
 return saved;
 end;
$$;

-- Retry a prior invitation without creating a duplicate Auth identity. Never trust browser metadata.
create function public.portal_invited_user(email_address text) returns uuid language sql stable security definer set search_path='' as $$
 select id from auth.users where lower(email)=lower(email_address) and (email_confirmed_at is not null or invited_at is not null) limit 1;
$$;

-- Acknowledging a cancellation also durably queues the client/admin receipts.
create function public.portal_create_cancellation(request_doc jsonb,notices jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
 declare saved public.portal_cancellations; item jsonb;
 begin
 insert into public.portal_cancellations(id,offer_id,requested_by,reason,requested_termination_at,proposed_termination_at)
 values((request_doc->>'id')::uuid,(request_doc->>'offer_id')::uuid,(request_doc->>'requested_by')::uuid,request_doc->>'reason',(request_doc->>'requested_termination_at')::timestamptz,(request_doc->>'proposed_termination_at')::timestamptz) returning * into saved;
 for item in select * from jsonb_array_elements(notices) loop
 insert into public.portal_notifications(dedupe_key,recipient,subject,message) values(item->>'dedupe_key',item->>'recipient',item->>'subject',item->>'message') on conflict(dedupe_key) do nothing;
 end loop;
 insert into public.portal_audit(actor_id,action,record_id) values(saved.requested_by,'cancellation.requested',saved.id::text);
 return to_jsonb(saved);
 end;
$$;

-- A transaction persists authoritative Stripe state and its deduplication marker together.
create function public.portal_apply_event(event_id text,event_type text,event_created bigint,changes jsonb,project_id uuid default null,lease_owner uuid default null) returns void language plpgsql security definer set search_path='' as $$
 declare item jsonb;
 begin
 if lease_owner is not null then
 perform 1 from public.portal_locks where key='project:'||project_id::text and owner=lease_owner and expires_at>now() for update;
 if not found then raise exception 'Webhook lease expired; retrieve current state again'; end if;
 end if;
 if exists(select 1 from public.portal_webhook_events where id=event_id) then return; end if;
 if changes ? 'subscription' then
 item=changes->'subscription';
 insert into public.portal_subscriptions select * from jsonb_populate_record(null::public.portal_subscriptions,item)
 on conflict(id) do update set status=excluded.status,next_payment_at=excluded.next_payment_at,cancel_at=excluded.cancel_at,updated_at=now();
 end if;
 if changes ? 'term' then
 item=changes->'term';
 insert into public.portal_contract_terms select * from jsonb_populate_record(null::public.portal_contract_terms,item)
 on conflict(offer_id) do update set current_term_start=excluded.current_term_start,renewal_at=excluded.renewal_at,cancellation_deadline=excluded.cancellation_deadline,status=excluded.status,termination_at=excluded.termination_at;
 if item->>'status'='terminated' then update public.portal_cancellations set status='completed',effective_termination_at=coalesce((item->>'termination_at')::timestamptz,effective_termination_at) where offer_id=(item->>'offer_id')::uuid and status in ('requested','scheduled'); end if;
 end if;
 if changes ? 'payment' then
 item=changes->'payment';
 insert into public.portal_payments select * from jsonb_populate_record(null::public.portal_payments,item)
 on conflict(id) do update set status=excluded.status,amount=excluded.amount,paid_at=excluded.paid_at,invoice_url=excluded.invoice_url,invoice_pdf=excluded.invoice_pdf,receipt_url=excluded.receipt_url,refunded_amount=excluded.refunded_amount,updated_at=now();
 end if;
 if changes ? 'checkout' then
 update public.portal_checkout_attempts set status=changes->'checkout'->>'status' where stripe_session_id=changes->'checkout'->>'id';
 end if;
 if changes ? 'project' then update public.portal_projects set status=changes->'project'->>'status' where id=(changes->'project'->>'id')::uuid; end if;
 for item in select * from jsonb_array_elements(coalesce(changes->'notifications','[]'::jsonb)) loop
 insert into public.portal_notifications(dedupe_key,recipient,subject,message) values(item->>'dedupe_key',item->>'recipient',item->>'subject',item->>'message') on conflict(dedupe_key) do nothing;
 end loop;
 insert into public.portal_webhook_events values(event_id,event_type,event_created,now());
 end;
$$;

-- Signed documents never have a public bucket or a public read policy.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 values('client-agreements','client-agreements',false,10485760,array['application/pdf']) on conflict(id) do nothing;

-- All privileged operations require the server's service-role key. Browser RPCs cannot elevate.
do $$ declare f record; begin
 for f in select p.oid::regprocedure signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname like 'portal_%' loop
 execute format('revoke all on function %s from public, anon, authenticated',f.signature);
 execute format('grant execute on function %s to service_role',f.signature);
 end loop;
end $$;
grant execute on function public.portal_is_admin(),public.portal_owns_project(uuid),public.portal_owns_offer(uuid) to authenticated;
