-- Corrigir estrutura do banco de dados para melhor alinhamento com os fluxos

-- Atualizar view de histórico para incluir mais informações
DROP VIEW IF EXISTS vw_historico_solicitacoes;
CREATE VIEW vw_historico_solicitacoes AS
SELECT 
    hv.id,
    hv.solicitacao_id,
    hv.usuario_id,
    hv.acao,
    hv.criado_em,
    hv.detalhes,
    -- Informações do usuário
    u.nome_completo as usuario_nome,
    u.email as usuario_email,
    u.avatar_url as usuario_avatar,
    u.perfil as usuario_perfil,
    -- Informações da solicitação
    s.titulo as solicitacao_titulo,
    s.status as solicitacao_status,
    -- Comentário (extraído dos detalhes ou de comentários relacionados)
    COALESCE(
        (hv.detalhes->>'comentario')::text,
        (hv.detalhes->>'motivo')::text,
        c.conteudo
    ) as comentario,
    -- Descrição da ação
    CASE 
        WHEN hv.acao = 'criado' THEN 'Solicitação criada'
        WHEN hv.acao = 'aprovado' THEN 'Solicitação aprovada'
        WHEN hv.acao = 'rejeitado' THEN 'Solicitação rejeitada'
        WHEN hv.acao = 'revisao_solicitada' THEN 'Revisão solicitada'
        WHEN hv.acao = 'comentario_adicionado' THEN 'Comentário adicionado'
        WHEN hv.acao = 'reenviado_aprovacao' THEN 'Reenviado para aprovação'
        ELSE hv.acao
    END as acao_descricao
FROM historico_versoes hv
JOIN usuarios u ON hv.usuario_id = u.id
JOIN solicitacoes s ON hv.solicitacao_id = s.id
LEFT JOIN comentarios c ON c.solicitacao_id = hv.solicitacao_id 
    AND c.usuario_id = hv.usuario_id 
    AND c.criado_em = hv.criado_em;

-- Atualizar view de solicitações para incluir arquivos corretamente
DROP VIEW IF EXISTS vw_solicitacoes;
CREATE VIEW vw_solicitacoes AS
SELECT 
    s.*,
    -- Informações do solicitante
    us.nome_completo as solicitante_nome,
    us.email as solicitante_email,
    us.avatar_url as solicitante_avatar,
    -- Informações do aprovador
    ua.nome_completo as aprovador_nome,
    ua.email as aprovador_email,
    ua.avatar_url as aprovador_avatar,
    -- Arquivos como JSON array
    COALESCE(
        json_agg(
            json_build_object(
                'id', a.id,
                'nome', a.nome_arquivo,
                'tipo', a.tipo_conteudo,
                'tamanho', a.tamanho_bytes,
                'url', a.url_publica
            )
        ) FILTER (WHERE a.id IS NOT NULL),
        '[]'::json
    ) as arquivos
FROM solicitacoes s
JOIN usuarios us ON s.solicitante_id = us.id
LEFT JOIN usuarios ua ON s.aprovador_id = ua.id
LEFT JOIN arquivos a ON s.id = a.solicitacao_id
GROUP BY 
    s.id, s.titulo, s.descricao, s.status, s.criado_em, s.atualizado_em,
    s.solicitante_id, s.aprovador_id, s.aprovado_em, s.rejeitado_em, s.data_limite,
    us.nome_completo, us.email, us.avatar_url,
    ua.nome_completo, ua.email, ua.avatar_url;

-- Adicionar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_historico_versoes_solicitacao_id ON historico_versoes(solicitacao_id);
CREATE INDEX IF NOT EXISTS idx_historico_versoes_usuario_id ON historico_versoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_historico_versoes_criado_em ON historico_versoes(criado_em);
CREATE INDEX IF NOT EXISTS idx_comentarios_solicitacao_id ON comentarios(solicitacao_id);
CREATE INDEX IF NOT EXISTS idx_arquivos_solicitacao_id ON arquivos(solicitacao_id);

-- Atualizar função para criar usuário admin se necessário
CREATE OR REPLACE FUNCTION criar_usuario_admin(email_admin text, senha_admin text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_user_id uuid;
BEGIN
    -- Inserir usuário no auth.users
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        email_admin,
        crypt(senha_admin, gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '',
        '',
        '',
        ''
    )
    RETURNING id INTO new_user_id;
    
    RETURN new_user_id;
END;
$$;

-- Habilitar realtime para as tabelas necessárias
-- Usar bloco PL/pgSQL para adicionar tabelas à publicação de forma segura
DO $
BEGIN
    -- Adicionar historico_versoes
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE historico_versoes;
    EXCEPTION
        WHEN duplicate_object THEN
            -- Tabela já está na publicação, ignorar
            NULL;
    END;
    
    -- Adicionar comentarios
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE comentarios;
    EXCEPTION
        WHEN duplicate_object THEN
            -- Tabela já está na publicação, ignorar
            NULL;
    END;
    
    -- Adicionar arquivos
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE arquivos;
    EXCEPTION
        WHEN duplicate_object THEN
            -- Tabela já está na publicação, ignorar
            NULL;
    END;
END $;
