-- Função para verificar se o usuário é admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM usuarios
    WHERE id = auth.uid()
    AND perfil = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas para a tabela usuarios
CREATE POLICY "Apenas admins podem criar usuários"
ON public.usuarios
FOR INSERT TO authenticated
WITH CHECK (is_admin());

CREATE POLICY "Apenas admins podem atualizar usuários"
ON public.usuarios
FOR UPDATE TO authenticated
USING (is_admin());

CREATE POLICY "Apenas admins podem ver todos os usuários"
ON public.usuarios
FOR SELECT TO authenticated
USING (is_admin() OR id = auth.uid());

-- Políticas para a tabela solicitacoes
CREATE POLICY "Solicitantes podem ver suas próprias solicitações"
ON public.solicitacoes
FOR SELECT TO authenticated
USING (
  solicitante_id = auth.uid() OR
  is_admin() OR
  (SELECT perfil FROM usuarios WHERE id = auth.uid()) = 'aprovador'
);

CREATE POLICY "Solicitantes podem criar solicitações"
ON public.solicitacoes
FOR INSERT TO authenticated
WITH CHECK (
  solicitante_id = auth.uid() AND
  (SELECT perfil FROM usuarios WHERE id = auth.uid()) IN ('solicitante', 'admin')
);

CREATE POLICY "Aprovadores e admins podem atualizar solicitações"
ON public.solicitacoes
FOR UPDATE TO authenticated
USING (
  is_admin() OR
  (SELECT perfil FROM usuarios WHERE id = auth.uid()) = 'aprovador'
); 