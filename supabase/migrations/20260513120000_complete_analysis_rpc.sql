-- Transação atómica: insert report + débito de crédito (plano agency não debita).

create or replace function public.complete_analysis(
  p_user_id uuid,
  p_url text,
  p_sector text,
  p_score integer,
  p_report_json jsonb,
  p_scraping_ok boolean,
  p_latency_ms integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_plan text;
  v_credits integer;
  v_report_id uuid;
  v_after integer;
begin
  select u.plan, u.credits_remaining
  into v_plan, v_credits
  from public.users u
  where u.id = p_user_id
  for update;

  if not found then
    raise exception 'user_not_found' using errcode = 'P0002';
  end if;

  if v_plan is distinct from 'agency' and v_credits < 1 then
    raise exception 'no_credits' using errcode = 'P0001';
  end if;

  insert into public.reports (
    user_id, url, sector, score, report_json, scraping_ok, latency_ms
  )
  values (
    p_user_id, p_url, p_sector, p_score, p_report_json, p_scraping_ok, p_latency_ms
  )
  returning id into v_report_id;

  if v_plan is distinct from 'agency' then
    update public.users
    set credits_remaining = credits_remaining - 1
    where id = p_user_id
    returning credits_remaining into v_after;
  else
    v_after := v_credits;
  end if;

  return jsonb_build_object(
    'report_id', v_report_id,
    'credits_after', v_after
  );
end;
$$;

revoke all on function public.complete_analysis(
  uuid, text, text, integer, jsonb, boolean, integer
) from public;

grant execute on function public.complete_analysis(
  uuid, text, text, integer, jsonb, boolean, integer
) to service_role;
