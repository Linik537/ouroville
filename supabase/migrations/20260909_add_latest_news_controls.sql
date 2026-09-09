-- Execute este arquivo uma única vez no SQL Editor do Supabase.
-- Adiciona seleção e ordenação administrativa para "Últimas Novidades".

do $$
declare
  _configuracao_ja_existia boolean;
begin
  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'carros'
      and column_name = 'mostrar_novidades'
  ) into _configuracao_ja_existia;

  alter table public.carros
    add column if not exists mostrar_novidades boolean not null default false;
  alter table public.carros
    add column if not exists ordem_novidades integer;

  -- Somente na instalação inicial, preserva o comportamento atual usando os
  -- seis carros disponíveis mais recentes. Reexecutar o arquivo nunca desfaz
  -- uma seleção vazia feita intencionalmente no painel.
  if not _configuracao_ja_existia then
    with iniciais as (
      select id, row_number() over (order by created_at desc, id desc)::integer as posicao
      from public.carros
      where status = 'disponivel'
      order by created_at desc, id desc
      limit 6
    )
    update public.carros as carro
    set mostrar_novidades = true,
        ordem_novidades = iniciais.posicao
    from iniciais
    where carro.id = iniciais.id;
  end if;
end;
$$;

create or replace function public.admin_set_latest_cars(_car_ids bigint[])
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  _result jsonb;
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'Acesso negado.';
  end if;

  if coalesce(array_length(_car_ids, 1), 0) > 6 then
    raise exception 'Selecione no máximo seis veículos.';
  end if;

  if (select count(*) from unnest(coalesce(_car_ids, array[]::bigint[])))
     <> (select count(distinct id) from unnest(coalesce(_car_ids, array[]::bigint[])) as ids(id)) then
    raise exception 'A lista contém veículos repetidos.';
  end if;

  if exists (
    select 1
    from unnest(coalesce(_car_ids, array[]::bigint[])) as selecionado(id)
    left join public.carros as carro on carro.id = selecionado.id
    where carro.id is null or carro.status <> 'disponivel'
  ) then
    raise exception 'A lista contém um veículo inexistente ou indisponível.';
  end if;

  update public.carros
  set mostrar_novidades = false,
      ordem_novidades = null
  where mostrar_novidades or ordem_novidades is not null;

  update public.carros as carro
  set mostrar_novidades = true,
      ordem_novidades = selecionado.posicao::integer
  from unnest(coalesce(_car_ids, array[]::bigint[])) with ordinality as selecionado(id, posicao)
  where carro.id = selecionado.id;

  select coalesce(jsonb_agg(to_jsonb(carro) order by carro.ordem_novidades), '[]'::jsonb)
  into _result
  from public.carros as carro
  where carro.mostrar_novidades;

  return _result;
end;
$$;

revoke all on function public.admin_set_latest_cars(bigint[]) from public;
grant execute on function public.admin_set_latest_cars(bigint[]) to authenticated;
