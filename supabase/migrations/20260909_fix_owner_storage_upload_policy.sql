-- Execute este arquivo uma única vez no SQL Editor do Supabase,
-- depois da migration 20260909_repair_admin_write_policies.sql.
-- O fallback de e-mail é lido de um JWT assinado pelo Supabase; não vem
-- de dados enviados pelo navegador.

drop policy if exists "admin envia fotos" on storage.objects;

create policy "admin envia fotos" on storage.objects
  for all to authenticated
  using (
    bucket_id = 'carros'
    and (
      public.is_admin(auth.uid())
      or auth.jwt() ->> 'email' = 'lincolndevasconcelosrodrigues@gmail.com'
    )
  )
  with check (
    bucket_id = 'carros'
    and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp')
    and (
      public.is_admin(auth.uid())
      or auth.jwt() ->> 'email' = 'lincolndevasconcelosrodrigues@gmail.com'
    )
  );
