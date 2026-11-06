do $migration$
declare
  portal_job_id bigint;
begin
  portal_job_id := cron.schedule(
    'portal-notifications',
    '*/5 * * * *',
    $job$select net.http_post(
      url := (select decrypted_secret from vault.decrypted_secrets where name = 'portal_function_url'),
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'portal_job_secret')
      ),
      body := '{}'::jsonb,
      timeout_milliseconds := 90000
    );$job$
  );
  perform cron.alter_job(portal_job_id, active := false);
end;
$migration$;
