-- Execute somente este arquivo no SQL Editor para corrigir a leitura das métricas.

create or replace function public.get_analytics_summary()
returns table (event_type text, car_id bigint, total bigint)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'Acesso negado.';
  end if;

  return query
    select analytics_events.event_type, analytics_events.car_id, count(*)::bigint
    from public.analytics_events
    group by analytics_events.event_type, analytics_events.car_id;
end;
$$;

revoke all on function public.get_analytics_summary() from public;
grant execute on function public.get_analytics_summary() to authenticated;
