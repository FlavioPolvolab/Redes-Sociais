-- Correções para o fluxo de revisão

-- Atualizar a view de histórico para incluir ação de reenvio
DROP VIEW IF EXISTS vw_historico_solicitacoes;
CREATE VIEW vw_historico_solicitacoes AS
SELECT 
    h.*,
    s.titulo as solicitacao_titulo,
    s.status as solicitacao_status,
    u.nome_completo as usuario_nome,
    u.email as usuario_email,
    COALESCE(u.avatar_url, '') as usuario_avatar,
    u.perfil as usuario_perfil,
    CASE 
        WHEN h.acao = 'comentario_adicionado' THEN 
            COALESCE((h.detalhes->>'comentario')::text, '')
        WHEN h.acao IN ('rejeitado', 'revisao_solicitada') THEN 
            COALESCE((h.detalhes->>'motivo')::text, '')
        ELSE NULL
    END as comentario,
    CASE
        WHEN h.acao = 'criado' THEN 'Solicitação criada'
        WHEN h.acao = 'aprovado' THEN 'Solicitação aprovada'
        WHEN h.acao = 'rejeitado' THEN 'Solicitação rejeitada'
        WHEN h.acao = 'revisao_solicitada' THEN 'Revisão solicitada'
        WHEN h.acao = 'comentario_adicionado' THEN 'Comentário adicionado'
        WHEN h.acao = 'reenviado_aprovacao' THEN 'Reenviado para aprovação'
        ELSE h.acao
    END as acao_descricao
FROM historico_versoes h
JOIN solicitacoes s ON h.solicitacao_id = s.id
JOIN usuarios u ON h.usuario_id = u.id;

-- Criar índice para melhorar performance das consultas de revisão
CREATE INDEX IF NOT EXISTS idx_solicitacoes_status_revisao ON solicitacoes(status) WHERE status = 'revisao_solicitada';

-- Atualizar as políticas para garantir que solicitantes possam atualizar solicitações em revisão
DROP POLICY IF EXISTS "Solicitantes podem atualizar próprias solicitações pendentes" ON solicitacoes;
CREATE POLICY "Solicitantes podem atualizar próprias solicitações pendentes ou em revisão"
    ON solicitacoes FOR UPDATE
    USING (solicitante_id = auth.uid() AND status IN ('pendente', 'revisao_solicitada'));

-- Garantir que a view de solicitações inclua informações do solicitante para filtros
DROP VIEW IF EXISTS vw_solicitacoes;
CREATE VIEW vw_solicitacoes AS
SELECT 
    s.*,
    sol.nome_completo as solicitante_nome,
    sol.email as solicitante_email,
    COALESCE(sol.avatar_url, '') as solicitante_avatar,
    apr.nome_completo as aprovador_nome,
    apr.email as aprovador_email,
    COALESCE(apr.avatar_url, '') as aprovador_avatar,
    COALESCE(
        (SELECT json_agg(
            json_build_object(
                'id', a.id,
                'nome', a.nome_arquivo,
                'tipo', a.tipo_conteudo,
                'tamanho', a.tamanho_bytes,
                'url', a.url_publica
            )
        )
        FROM arquivos a
        WHERE a.solicitacao_id = s.id),
        '[]'::json
    ) as arquivos
FROM solicitacoes s
LEFT JOIN usuarios sol ON s.solicitante_id = sol.id
LEFT JOIN usuarios apr ON s.aprovador_id = apr.id;
