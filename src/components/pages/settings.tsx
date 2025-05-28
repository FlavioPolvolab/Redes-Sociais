import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Bell, Mail, Shield, Palette, Globe } from "lucide-react";
import TopNavigation from "../dashboard/layout/TopNavigation";
import Sidebar from "../dashboard/layout/Sidebar";

export default function Settings() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("pt-BR");
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleSaveSettings = async () => {
    setIsUpdating(true);

    try {
      // Aqui seria implementada a lógica de salvamento das configurações

      toast({
        title: "Configurações salvas!",
        description: "Suas preferências foram atualizadas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar configurações",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <TopNavigation />
      <div className="flex h-[calc(100vh-64px)] mt-16">
        <Sidebar activeItem="Configurações" />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                Configurações
              </h1>
              <p className="text-gray-600">
                Personalize sua experiência no sistema
              </p>
            </div>

            <div className="space-y-6">
              {/* Notificações */}
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="h-5 w-5" />
                    <span>Notificações</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base font-medium">
                        Notificações por Email
                      </Label>
                      <p className="text-sm text-gray-500">
                        Receba emails quando houver atualizações em suas
                        submissões
                      </p>
                    </div>
                    <Switch
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base font-medium">
                        Notificações Push
                      </Label>
                      <p className="text-sm text-gray-500">
                        Receba notificações instantâneas no navegador
                      </p>
                    </div>
                    <Switch
                      checked={pushNotifications}
                      onCheckedChange={setPushNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base font-medium">
                        Resumo Semanal
                      </Label>
                      <p className="text-sm text-gray-500">
                        Receba um resumo semanal de suas atividades
                      </p>
                    </div>
                    <Switch
                      checked={weeklyDigest}
                      onCheckedChange={setWeeklyDigest}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Aparência */}
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Palette className="h-5 w-5" />
                    <span>Aparência</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base font-medium">
                        Modo Escuro
                      </Label>
                      <p className="text-sm text-gray-500">
                        Ative o tema escuro para reduzir o cansaço visual
                      </p>
                    </div>
                    <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                  </div>
                </CardContent>
              </Card>

              {/* Idioma */}
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Globe className="h-5 w-5" />
                    <span>Idioma e Região</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-base font-medium">
                      Idioma da Interface
                    </Label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="pt-BR">Português (Brasil)</option>
                      <option value="en-US">English (United States)</option>
                      <option value="es-ES">Español (España)</option>
                    </select>
                    <p className="text-sm text-gray-500">
                      Escolha o idioma para a interface do sistema
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Segurança */}
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Segurança</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Button variant="outline" className="w-full justify-start">
                      Alterar Senha
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Configurar Autenticação de Dois Fatores
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Ver Sessões Ativas
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Privacidade */}
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Mail className="h-5 w-5" />
                    <span>Privacidade</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Button variant="outline" className="w-full justify-start">
                      Baixar Meus Dados
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Política de Privacidade
                    </Button>
                    <Button
                      variant="destructive"
                      className="w-full justify-start"
                    >
                      Excluir Conta
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Botão de Salvar */}
              <div className="flex justify-end space-x-4">
                <Button variant="outline">Cancelar</Button>
                <Button
                  onClick={handleSaveSettings}
                  disabled={isUpdating}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  {isUpdating ? "Salvando..." : "Salvar Configurações"}
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
