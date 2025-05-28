-- Criação do sistema de aprovação de conteúdo

-- Enum para perfis de usuário
CREATE TYPE perfil_usuario AS ENUM ('admin', 'aprovador', 'solicitante');

-- Enum para status de solicitação
CREATE TYPE status_solicitacao AS ENUM ('pendente', 'aprovado', 'rejeitado', 'revisao_solicitada');

-- Enum para tipo de conteúdo
CREATE TYPE tipo_conteudo AS ENUM ('imagem', 'video', 'pdf', 'texto');

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    nome_completo TEXT NOT NULL,
    perfil perfil_usuario NOT NULL DEFAULT 'solicitante',
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de solicitações
CREATE TABLE IF NOT EXISTS solicitacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    descricao TEXT,
    solicitante_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    aprovador_id UUID REFERENCES usuarios(id),
    status status_solicitacao DEFAULT 'pendente',
    data_limite DATE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    aprovado_em TIMESTAMP WITH TIME ZONE,
    rejeitado_em TIMESTAMP WITH TIME ZONE
);

-- Tabela de arquivos
CREATE TABLE IF NOT EXISTS arquivos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    solicitacao_id UUID NOT NULL REFERENCES solicitacoes(id) ON DELETE CASCADE,
    nome_arquivo TEXT NOT NULL,
    caminho_storage TEXT NOT NULL,
    tipo_conteudo tipo_conteudo NOT NULL,
    tamanho_bytes BIGINT,
    url_publica TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de comentários
CREATE TABLE IF NOT EXISTS comentarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    solicitacao_id UUID NOT NULL REFERENCES solicitacoes(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    conteudo TEXT NOT NULL,
    tipo TEXT DEFAULT 'comentario', -- 'comentario', 'aprovacao', 'rejeicao', 'revisao'
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de histórico de versões
CREATE TABLE IF NOT EXISTS historico_versoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    solicitacao_id UUID NOT NULL REFERENCES solicitacoes(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    acao TEXT NOT NULL, -- 'criado', 'atualizado', 'aprovado', 'rejeitado', 'comentario_adicionado'
    detalhes JSONB,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_solicitacoes_solicitante ON solicitacoes(solicitante_id);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_aprovador ON solicitacoes(aprovador_id);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_status ON solicitacoes(status);
CREATE INDEX IF NOT EXISTS idx_arquivos_solicitacao ON arquivos(solicitacao_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_solicitacao ON comentarios(solicitacao_id);
CREATE INDEX IF NOT EXISTS idx_historico_solicitacao ON historico_versoes(solicitacao_id);

-- Triggers para atualizar timestamp
CREATE OR REPLACE FUNCTION atualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_usuarios_atualizado
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trigger_solicitacoes_atualizado
    BEFORE UPDATE ON solicitacoes
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_timestamp();

-- Trigger para criar entrada de histórico
CREATE OR REPLACE FUNCTION criar_historico()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO historico_versoes (solicitacao_id, usuario_id, acao, detalhes)
        VALUES (NEW.id, NEW.solicitante_id, 'criado', row_to_json(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Registrar mudanças específicas
        IF OLD.status != NEW.status THEN
            INSERT INTO historico_versoes (solicitacao_id, usuario_id, acao, detalhes)
            VALUES (NEW.id, COALESCE(NEW.aprovador_id, NEW.solicitante_id), 
                   CASE 
                       WHEN NEW.status = 'aprovado' THEN 'aprovado'
                       WHEN NEW.status = 'rejeitado' THEN 'rejeitado'
                       WHEN NEW.status = 'revisao_solicitada' THEN 'revisao_solicitada'
                       ELSE 'atualizado'
                   END,
                   json_build_object('status_anterior', OLD.status, 'status_novo', NEW.status));
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_solicitacoes_historico
    AFTER INSERT OR UPDATE ON solicitacoes
    FOR EACH ROW
    EXECUTE FUNCTION criar_historico();

-- Trigger para histórico de comentários
CREATE OR REPLACE FUNCTION criar_historico_comentario()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO historico_versoes (solicitacao_id, usuario_id, acao, detalhes)
    VALUES (NEW.solicitacao_id, NEW.usuario_id, 'comentario_adicionado', 
           json_build_object('comentario_id', NEW.id, 'tipo', NEW.tipo));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_comentarios_historico
    AFTER INSERT ON comentarios
    FOR EACH ROW
    EXECUTE FUNCTION criar_historico_comentario();

-- Políticas RLS (Row Level Security)
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE arquivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE comentarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_versoes ENABLE ROW LEVEL SECURITY;

-- Políticas para usuários
DROP POLICY IF EXISTS "Usuários podem ver próprio perfil" ON usuarios;
CREATE POLICY "Usuários podem ver próprio perfil"
    ON usuarios FOR SELECT
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Usuários podem atualizar próprio perfil" ON usuarios;
CREATE POLICY "Usuários podem atualizar próprio perfil"
    ON usuarios FOR UPDATE
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins podem ver todos usuários" ON usuarios;
CREATE POLICY "Admins podem ver todos usuários"
    ON usuarios FOR ALL
    USING (EXISTS (
        SELECT 1 FROM usuarios 
        WHERE id = auth.uid() AND perfil = 'admin'
    ));

-- Políticas para solicitações
DROP POLICY IF EXISTS "Solicitantes podem ver próprias solicitações" ON solicitacoes;
CREATE POLICY "Solicitantes podem ver próprias solicitações"
    ON solicitacoes FOR SELECT
    USING (solicitante_id = auth.uid());

DROP POLICY IF EXISTS "Aprovadores podem ver solicitações atribuídas" ON solicitacoes;
CREATE POLICY "Aprovadores podem ver solicitações atribuídas"
    ON solicitacoes FOR SELECT
    USING (aprovador_id = auth.uid() OR EXISTS (
        SELECT 1 FROM usuarios 
        WHERE id = auth.uid() AND perfil IN ('aprovador', 'admin')
    ));

DROP POLICY IF EXISTS "Solicitantes podem criar solicitações" ON solicitacoes;
CREATE POLICY "Solicitantes podem criar solicitações"
    ON solicitacoes FOR INSERT
    WITH CHECK (solicitante_id = auth.uid());

DROP POLICY IF EXISTS "Solicitantes podem atualizar próprias solicitações" ON solicitacoes;
CREATE POLICY "Solicitantes podem atualizar próprias solicitações"
    ON solicitacoes FOR UPDATE
    USING (solicitante_id = auth.uid() AND status = 'pendente');

DROP POLICY IF EXISTS "Aprovadores podem atualizar solicitações" ON solicitacoes;
CREATE POLICY "Aprovadores podem atualizar solicitações"
    ON solicitacoes FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM usuarios 
        WHERE id = auth.uid() AND perfil IN ('aprovador', 'admin')
    ));

-- Políticas para arquivos
DROP POLICY IF EXISTS "Usuários podem ver arquivos de solicitações acessíveis" ON arquivos;
CREATE POLICY "Usuários podem ver arquivos de solicitações acessíveis"
    ON arquivos FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM solicitacoes s
        WHERE s.id = solicitacao_id
        AND (s.solicitante_id = auth.uid() 
             OR s.aprovador_id = auth.uid()
             OR EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND perfil = 'admin'))
    ));

DROP POLICY IF EXISTS "Solicitantes podem inserir arquivos" ON arquivos;
CREATE POLICY "Solicitantes podem inserir arquivos"
    ON arquivos FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM solicitacoes s
        WHERE s.id = solicitacao_id AND s.solicitante_id = auth.uid()
    ));

-- Políticas para comentários
DROP POLICY IF EXISTS "Usuários podem ver comentários de solicitações acessíveis" ON comentarios;
CREATE POLICY "Usuários podem ver comentários de solicitações acessíveis"
    ON comentarios FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM solicitacoes s
        WHERE s.id = solicitacao_id
        AND (s.solicitante_id = auth.uid() 
             OR s.aprovador_id = auth.uid()
             OR EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND perfil = 'admin'))
    ));

DROP POLICY IF EXISTS "Usuários podem criar comentários" ON comentarios;
CREATE POLICY "Usuários podem criar comentários"
    ON comentarios FOR INSERT
    WITH CHECK (usuario_id = auth.uid() AND EXISTS (
        SELECT 1 FROM solicitacoes s
        WHERE s.id = solicitacao_id
        AND (s.solicitante_id = auth.uid() 
             OR s.aprovador_id = auth.uid()
             OR EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND perfil = 'admin'))
    ));

-- Políticas para histórico
DROP POLICY IF EXISTS "Usuários podem ver histórico de solicitações acessíveis" ON historico_versoes;
CREATE POLICY "Usuários podem ver histórico de solicitações acessíveis"
    ON historico_versoes FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM solicitacoes s
        WHERE s.id = solicitacao_id
        AND (s.solicitante_id = auth.uid() 
             OR s.aprovador_id = auth.uid()
             OR EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND perfil = 'admin'))
    ));

-- Criar buckets no Supabase Storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('solicitacoes', 'solicitacoes', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas para storage
DROP POLICY IF EXISTS "Usuários podem fazer upload de arquivos" ON storage.objects;
CREATE POLICY "Usuários podem fazer upload de arquivos"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'solicitacoes' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Usuários podem ver próprios arquivos" ON storage.objects;
CREATE POLICY "Usuários podem ver próprios arquivos"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'solicitacoes' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Usuários podem atualizar próprios arquivos" ON storage.objects;
CREATE POLICY "Usuários podem atualizar próprios arquivos"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'solicitacoes' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Usuários podem deletar próprios arquivos" ON storage.objects;
CREATE POLICY "Usuários podem deletar próprios arquivos"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'solicitacoes' AND auth.role() = 'authenticated');

-- Políticas para avatars (público)
DROP POLICY IF EXISTS "Avatars são públicos" ON storage.objects;
CREATE POLICY "Avatars são públicos"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Usuários podem fazer upload de avatars" ON storage.objects;
CREATE POLICY "Usuários podem fazer upload de avatars"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Habilitar realtime
ALTER PUBLICATION supabase_realtime ADD TABLE usuarios;
ALTER PUBLICATION supabase_realtime ADD TABLE solicitacoes;
ALTER PUBLICATION supabase_realtime ADD TABLE arquivos;
ALTER PUBLICATION supabase_realtime ADD TABLE comentarios;
ALTER PUBLICATION supabase_realtime ADD TABLE historico_versoes;

-- Função para criar usuário administrador
CREATE OR REPLACE FUNCTION criar_usuario_admin(email_admin TEXT, senha_admin TEXT)
RETURNS UUID AS $$
DECLARE
    user_id UUID;
    existing_user_id UUID;
BEGIN
    -- Verificar se o usuário já existe
    SELECT id INTO existing_user_id
    FROM auth.users
    WHERE email = email_admin;
    
    -- Se o usuário já existe, retornar o ID existente
    IF existing_user_id IS NOT NULL THEN
        -- Verificar se já existe na tabela usuarios
        IF NOT EXISTS (SELECT 1 FROM public.usuarios WHERE id = existing_user_id) THEN
            -- Criar entrada na tabela usuarios se não existir
            INSERT INTO public.usuarios (id, email, nome_completo, perfil)
            VALUES (existing_user_id, email_admin, 'Administrador', 'admin');
        END IF;
        RETURN existing_user_id;
    END IF;
    
    -- Criar usuário na tabela auth.users
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
        raw_app_meta_data,
        raw_user_meta_data,
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
        '{"provider": "email", "providers": ["email"]}',
        '{"perfil": "admin", "full_name": "Administrador"}',
        '',
        '',
        '',
        ''
    ) RETURNING id INTO user_id;
    
    -- Criar entrada na tabela usuarios
    INSERT INTO public.usuarios (id, email, nome_completo, perfil)
    VALUES (user_id, email_admin, 'Administrador', 'admin');
    
    RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar usuário administrador
SELECT criar_usuario_admin('flavio@polvolab.co', '17Is@pan');

-- Função para criar perfis de usuário
CREATE OR REPLACE FUNCTION criar_perfil_usuario()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.usuarios (id, email, nome_completo, perfil)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'perfil', 'solicitante')::perfil_usuario
    );
    RETURN NEW;
EXCEPTION
    WHEN unique_violation THEN
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS trigger_criar_perfil_usuario ON auth.users;
CREATE TRIGGER trigger_criar_perfil_usuario
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION criar_perfil_usuario();

-- Dados de exemplo serão criados através da aplicação
-- Os usuários devem ser criados primeiro no auth.users antes de serem inseridos na tabela usuarios