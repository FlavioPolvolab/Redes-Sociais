import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Bell, Shield, Loader2 } from "lucide-react";
import TopNavigation from "../dashboard/layout/TopNavigation";
import Sidebar from "../dashboard/layout/Sidebar";
import { supabase } from "../../../supabase/supabase";

interface UserSettings {
  id: string;
  notificacoes_email: boolean;
  notificacoes_push: boolean;
  notificacoes_sistema: boolean;
  privacidade_perfil_publico: boolean;
  privacidade_mostrar_email: boolean;
  privacidade_mostrar_telefone: boolean;
}

export default function Settings() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("configuracoes_usuario")
        .select("*")
        .eq("usuario_id", user.id)
        .single();

      if (error) throw error;

      setSettings(data);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (key: keyof UserSettings) => {
    if (!settings) return;

    setIsSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const newValue = !settings[key];
      const { error } = await supabase
        .from("configuracoes_usuario")
        .update({ [key]: newValue })
        .eq("usuario_id", user.id);

      if (error) throw error;

      setSettings((prev) => (prev ? { ...prev, [key]: newValue } : null));

      toast({
        title: "Sucesso!",
        description: "Configuração atualizada com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a configuração.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <TopNavigation />
      <div className="flex h-[calc(100vh-64px)] mt-16">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                Configurações
              </h1>
              <p className="text-gray-600">
                Gerencie suas preferências e configurações de privacidade
              </p>
            </div>

            <div className="space-y-6">
              {/* Notificações */}
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="text-xl font-medium text-gray-900 flex items-center">
                    <Bell className="h-5 w-5 mr-2" />
                    Notificações
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Notificações por E-mail</Label>
                      <p className="text-sm text-gray-500">
                        Receba atualizações por e-mail sobre suas solicitações
                      </p>
                    </div>
                    <Switch
                      checked={settings?.notificacoes_email}
                      onCheckedChange={() => handleToggle("notificacoes_email")}
                      disabled={isSaving}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Notificações Push</Label>
                      <p className="text-sm text-gray-500">
                        Receba notificações em tempo real no navegador
                      </p>
                    </div>
                    <Switch
                      checked={settings?.notificacoes_push}
                      onCheckedChange={() => handleToggle("notificacoes_push")}
                      disabled={isSaving}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Notificações do Sistema</Label>
                      <p className="text-sm text-gray-500">
                        Receba notificações sobre atualizações do sistema
                      </p>
                    </div>
                    <Switch
                      checked={settings?.notificacoes_sistema}
                      onCheckedChange={() =>
                        handleToggle("notificacoes_sistema")
                      }
                      disabled={isSaving}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Privacidade */}
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="text-xl font-medium text-gray-900 flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Privacidade
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Perfil Público</Label>
                      <p className="text-sm text-gray-500">
                        Permite que outros usuários vejam seu perfil
                      </p>
                    </div>
                    <Switch
                      checked={settings?.privacidade_perfil_publico}
                      onCheckedChange={() =>
                        handleToggle("privacidade_perfil_publico")
                      }
                      disabled={isSaving}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Mostrar E-mail</Label>
                      <p className="text-sm text-gray-500">
                        Exibe seu e-mail para outros usuários
                      </p>
                    </div>
                    <Switch
                      checked={settings?.privacidade_mostrar_email}
                      onCheckedChange={() =>
                        handleToggle("privacidade_mostrar_email")
                      }
                      disabled={isSaving}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Mostrar Telefone</Label>
                      <p className="text-sm text-gray-500">
                        Exibe seu telefone para outros usuários
                      </p>
                    </div>
                    <Switch
                      checked={settings?.privacidade_mostrar_telefone}
                      onCheckedChange={() =>
                        handleToggle("privacidade_mostrar_telefone")
                      }
                      disabled={isSaving}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
