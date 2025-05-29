-- Remover bucket existente se houver
DROP POLICY IF EXISTS "Permitir upload de arquivos para usuários autenticados" ON storage.objects;
DROP POLICY IF EXISTS "Permitir visualização de arquivos para usuários autenticados" ON storage.objects;
DROP POLICY IF EXISTS "Permitir exclusão de arquivos próprios" ON storage.objects;
DROP POLICY IF EXISTS "Permitir atualização de arquivos próprios" ON storage.objects;

-- Recriar bucket com configurações corretas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'solicitacoes',
  'solicitacoes',
  false,
  10485760, -- 10MB em bytes
  ARRAY['image/png', 'image/jpeg', 'application/pdf']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'application/pdf']::text[];

-- Recriar políticas
CREATE POLICY "Permitir upload de arquivos para usuários autenticados"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'solicitacoes'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Permitir visualização de arquivos para usuários autenticados"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'solicitacoes');

CREATE POLICY "Permitir exclusão de arquivos próprios"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'solicitacoes'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Permitir atualização de arquivos próprios"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'solicitacoes'
  AND (storage.foldername(name))[1] = auth.uid()::text
); 