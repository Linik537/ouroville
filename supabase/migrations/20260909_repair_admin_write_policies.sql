-- Execute este arquivo uma única vez no SQL Editor do Supabase.
-- Repara as permissões de escrita do painel administrativo sem abrir
-- acesso de escrita para visitantes.

alter table public.carros enable row level security;
alter table public.carros no force row level security;

drop policy if exists "admin gerencia carros" on public.carros;
create policy "admin gerencia carros" on public.carros
  for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create or replace function public.admin_update_car(_car_id bigint, _payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  _updated public.carros;
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'Acesso negado.';
  end if;

  update public.carros
  set
    marca = btrim(_payload->>'marca'),
    modelo = btrim(_payload->>'modelo'),
    versao = nullif(btrim(_payload->>'versao'), ''),
    ano = (_payload->>'ano')::int,
    ano_modelo = (_payload->>'ano_modelo')::int,
    preco = (_payload->>'preco')::numeric,
    quilometragem = (_payload->>'quilometragem')::int,
    combustivel = nullif(btrim(_payload->>'combustivel'), ''),
    cambio = nullif(btrim(_payload->>'cambio'), ''),
    cor = nullif(btrim(_payload->>'cor'), ''),
    motor = nullif(btrim(_payload->>'motor'), ''),
    tracao = nullif(btrim(_payload->>'tracao'), ''),
    descricao = nullif(btrim(_payload->>'descricao'), ''),
    destaque = nullif(btrim(_payload->>'destaque'), ''),
    fotos = case
      when jsonb_typeof(_payload->'fotos') = 'array'
        then array(select jsonb_array_elements_text(_payload->'fotos'))
      else fotos
    end
  where id = _car_id
  returning * into _updated;

  if _updated.id is null then
    raise exception 'Veículo não encontrado.';
  end if;

  return to_jsonb(_updated);
end;
$$;

revoke all on function public.admin_update_car(bigint, jsonb) from public;
grant execute on function public.admin_update_car(bigint, jsonb) to authenticated;

drop policy if exists "admin envia fotos" on storage.objects;
create policy "admin envia fotos" on storage.objects
  for all to authenticated
  using (bucket_id = 'carros' and public.is_admin(auth.uid()))
  with check (bucket_id = 'carros' and public.is_admin(auth.uid()));
