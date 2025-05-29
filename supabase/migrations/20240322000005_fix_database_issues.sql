-- Fix database structure issues

-- Add missing columns to historico_versoes table
ALTER TABLE historico_versoes ADD COLUMN IF NOT EXISTS comentario TEXT;

-- Add missing columns to usuarios table
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS cargo TEXT;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS departamento TEXT;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS telefone TEXT;

-- Create configuracoes_usuario table if it doesn't exist
CREATE TABLE IF NOT EXISTS configuracoes_usuario (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    notificacoes_email BOOLEAN DEFAULT true,
    notificacoes_push BOOLEAN DEFAULT true,
    notificacoes_sistema BOOLEAN DEFAULT true,
    privacidade_perfil_publico BOOLEAN DEFAULT false,
    privacidade_mostrar_email BOOLEAN DEFAULT false,
    privacidade_mostrar_telefone BOOLEAN DEFAULT false,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(usuario_id)
);

-- Create trigger to automatically create user settings
CREATE OR REPLACE FUNCTION criar_configuracoes_usuario()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO configuracoes_usuario (usuario_id)
    VALUES (NEW.id)
    ON CONFLICT (usuario_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_criar_configuracoes_usuario ON usuarios;
CREATE TRIGGER trigger_criar_configuracoes_usuario
    AFTER INSERT ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION criar_configuracoes_usuario();

-- Update the view to include comentario field
DROP VIEW IF EXISTS vw_historico_solicitacoes;
CREATE VIEW vw_historico_solicitacoes AS
SELECT 
    hv.id,
    hv.solicitacao_id,
    hv.usuario_id,
    hv.acao,
    CASE 
        WHEN hv.acao = 'criado' THEN 'Solicitação criada'
        WHEN hv.acao = 'aprovado' THEN 'Solicitação aprovada'
        WHEN hv.acao = 'rejeitado' THEN 'Solicitação rejeitada'
        WHEN hv.acao = 'revisao_solicitada' THEN 'Revisão solicitada'
        WHEN hv.acao = 'comentario_adicionado' THEN 'Comentário adicionado'
        WHEN hv.acao = 'reenviado_aprovacao' THEN 'Reenviado para aprovação'
        ELSE hv.acao
    END as acao_descricao,
    hv.comentario,
    hv.detalhes,
    hv.criado_em,
    u.nome_completo as usuario_nome,
    u.email as usuario_email,
    u.avatar_url as usuario_avatar,
    u.perfil as usuario_perfil,
    s.titulo as solicitacao_titulo,
    s.status as solicitacao_status
FROM historico_versoes hv
JOIN usuarios u ON hv.usuario_id = u.id
JOIN solicitacoes s ON hv.solicitacao_id = s.id;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_historico_versoes_solicitacao_id ON historico_versoes(solicitacao_id);
CREATE INDEX IF NOT EXISTS idx_historico_versoes_usuario_id ON historico_versoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_configuracoes_usuario_usuario_id ON configuracoes_usuario(usuario_id);

-- Insert default configurations for existing users
INSERT INTO configuracoes_usuario (usuario_id)
SELECT id FROM usuarios
WHERE id NOT IN (SELECT usuario_id FROM configuracoes_usuario);

-- Enable realtime for new table
ALTER PUBLICATION supabase_realtime ADD TABLE configuracoes_usuario;
