-- Run this once in Supabase SQL Editor for an existing Ouroville database.

alter table public.carros add column if not exists motor text;
alter table public.carros add column if not exists tracao text;

-- Public visitors must use the validated RPC below, not insert into leads directly.
drop policy if exists "qualquer um cria lead" on public.leads;

create or replace function public.submit_lead(
  _nome text,
  _telefone text,
  _mensagem text,
  _consentimento boolean
)
returns public.leads
language plpgsql
security definer
set search_path = public
as $$
declare
  novo_lead public.leads;
begin
  if not _consentimento then
    raise exception 'Consentimento é obrigatório.';
  end if;

  if char_length(trim(coalesce(_nome, ''))) < 2 or char_length(trim(coalesce(_nome, ''))) > 120 then
    raise exception 'Nome inválido.';
  end if;

  if char_length(trim(coalesce(_telefone, ''))) < 8 or char_length(trim(coalesce(_telefone, ''))) > 30 then
    raise exception 'Telefone inválido.';
  end if;

  if char_length(trim(coalesce(_mensagem, ''))) > 2000 then
    raise exception 'Mensagem muito longa.';
  end if;

  if exists (
    select 1 from public.leads
    where telefone = trim(_telefone)
      and created_at > now() - interval '5 minutes'
  ) then
    raise exception 'Aguarde alguns minutos antes de enviar outra mensagem.';
  end if;

  insert into public.leads (nome, telefone, mensagem, consentimento)
  values (trim(_nome), trim(_telefone), nullif(trim(coalesce(_mensagem, '')), ''), true)
  returning * into novo_lead;

  return novo_lead;
end;
$$;

revoke all on function public.submit_lead(text, text, text, boolean) from public;
grant execute on function public.submit_lead(text, text, text, boolean) to anon, authenticated;
