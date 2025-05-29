-- Ensure we have at least one admin user for testing
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  aud,
  role
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'admin@test.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  now(),
  now(),
  'authenticated',
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- Ensure corresponding user record exists
INSERT INTO usuarios (
  id,
  email,
  nome_completo,
  perfil,
  ativo
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@test.com',
  'Administrador do Sistema',
  'admin',
  true
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  nome_completo = EXCLUDED.nome_completo,
  perfil = EXCLUDED.perfil,
  ativo = EXCLUDED.ativo;

-- Create some sample data for testing
INSERT INTO solicitacoes (
  id,
  titulo,
  descricao,
  status,
  solicitante_id
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Solicitação de Teste',
  'Esta é uma solicitação de teste para verificar o funcionamento do sistema.',
  'pendente',
  '00000000-0000-0000-0000-000000000001'
) ON CONFLICT (id) DO NOTHING;

-- Add to historico_versoes
INSERT INTO historico_versoes (
  id,
  solicitacao_id,
  usuario_id,
  acao,
  detalhes
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000001',
  'criado',
  '{"titulo": "Solicitação de Teste", "descricao": "Esta é uma solicitação de teste para verificar o funcionamento do sistema.", "status": "pendente"}'
) ON CONFLICT (id) DO NOTHING;
