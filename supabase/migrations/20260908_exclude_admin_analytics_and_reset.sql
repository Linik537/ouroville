-- Execute este arquivo uma única vez no SQL Editor.
-- Ele ignora eventos de administradores autenticados e apaga somente as métricas atuais.

begin;

create or replace function public.track_analytics_event(
  _event_type text,
  _car_id bigint default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and public.is_admin(auth.uid()) then
    return;
  end if;

  if _event_type not in ('site_visit', 'car_view', 'whatsapp_click') then
    raise exception 'Evento inválido.';
  end if;

  if _event_type = 'site_visit' and _car_id is not null then
    raise exception 'Evento inválido.';
  end if;

  if _event_type in ('car_view', 'whatsapp_click') and not exists (
    select 1 from public.carros where id = _car_id
  ) then
    raise exception 'Veículo inválido.';
  end if;

  insert into public.analytics_events (event_type, car_id)
  values (_event_type, _car_id);
end;
$$;

revoke all on function public.track_analytics_event(text, bigint) from public;
grant execute on function public.track_analytics_event(text, bigint) to anon, authenticated;

delete from public.analytics_events;

commit;
