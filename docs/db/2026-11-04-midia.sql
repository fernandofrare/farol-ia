-- Migração: suporte a mídia (imagens/documentos) em conversas + catálogo em arquivo.
-- Aditiva e idempotente. Aplicar via Supabase (painel SQL ou MCP apply_migration).
-- Data: 2026-11-04.

-- 1) Mídia nas mensagens (content segue sendo texto/legenda)
alter table public.messages
  add column if not exists media_url text,       -- caminho no bucket (storage key)
  add column if not exists media_type text,      -- image | document | audio | video
  add column if not exists media_mime text,      -- ex: application/pdf, image/jpeg
  add column if not exists media_filename text;  -- nome original (para documentos)

-- 2) Catálogo em arquivo no cliente (além do catalogo texto já existente)
alter table public.clients
  add column if not exists catalogo_midia_url text,     -- caminho no bucket catalogos
  add column if not exists catalogo_midia_tipo text,    -- image | document
  add column if not exists catalogo_midia_nome text,    -- nome do arquivo
  add column if not exists catalogo_midia_mime text;    -- mime do arquivo

-- 3) Buckets privados
insert into storage.buckets (id, name, public)
  values ('catalogos', 'catalogos', false)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public)
  values ('conversas', 'conversas', false)
  on conflict (id) do nothing;

-- 4) RLS no storage: o usuário autenticado acessa só objetos cujo 1º segmento
--    do caminho é o id de um cliente DELE. O motor usa service_role (bypassa RLS).
--    Caminho padrão: "<client_id>/<...>".

drop policy if exists "catalogos_owner_all" on storage.objects;
create policy "catalogos_owner_all" on storage.objects
  for all to authenticated
  using (
    bucket_id = 'catalogos'
    and (storage.foldername(name))[1] in (
      select c.id::text from public.clients c where c.user_id = auth.uid()
    )
  )
  with check (
    bucket_id = 'catalogos'
    and (storage.foldername(name))[1] in (
      select c.id::text from public.clients c where c.user_id = auth.uid()
    )
  );

drop policy if exists "conversas_owner_all" on storage.objects;
create policy "conversas_owner_all" on storage.objects
  for all to authenticated
  using (
    bucket_id = 'conversas'
    and (storage.foldername(name))[1] in (
      select c.id::text from public.clients c where c.user_id = auth.uid()
    )
  )
  with check (
    bucket_id = 'conversas'
    and (storage.foldername(name))[1] in (
      select c.id::text from public.clients c where c.user_id = auth.uid()
    )
  );
