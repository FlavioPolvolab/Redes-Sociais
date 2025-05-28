import React, { useState } from "react";
import { useAuth } from "../../../supabase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { User, Mail, Shield, Camera } from "lucide-react";
import TopNavigation from "../dashboard/layout/TopNavigation";
import Sidebar from "../dashboard/layout/Sidebar";

export default function Profile() {
  const { user, usuario } = useAuth();
  const [fullName, setFullName] = useState(usuario?.nome_completo || "");
  const [email, setEmail] = useState(user?.email || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      // Aqui seria implementada a lógica de atualização do perfil no Supabase

      toast({
        title: "Perfil atualizado com sucesso!",
        description: "Suas informações foram salvas.",
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar perfil",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getPerfilBadge = (perfil: string) => {
    const perfilConfig = {
      admin: { label: "Administrador", variant: "default" as const },
      aprovador: { label: "Aprovador", variant: "secondary" as const },
      solicitante: { label: "Solicitante", variant: "outline" as const },
    };

    const config = perfilConfig[perfil as keyof typeof perfilConfig];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <TopNavigation />
      <div className="flex h-[calc(100vh-64px)] mt-16">
        <Sidebar activeItem="Perfil" />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                Meu Perfil
              </h1>
              <p className="text-gray-600">
                Gerencie suas informações pessoais e configurações de conta
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Informações do Perfil */}
              <div className="lg:col-span-2">
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle className="text-xl font-medium text-gray-900">
                      Informações Pessoais
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                      <div className="space-y-2">
                        <Label
                          htmlFor="fullName"
                          className="text-sm font-medium text-gray-700"
                        >
                          Nome Completo
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                          <Input
                            id="fullName"
                            placeholder="Seu nome completo"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="pl-9 h-12 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="email"
                          className="text-sm font-medium text-gray-700"
                        >
                          Email
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-9 h-12 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                            disabled
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          O email não pode ser alterado. Entre em contato com o
                          suporte se necessário.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Tipo de Perfil
                        </Label>
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <Shield className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-700 flex-1">
                            Seu perfil de usuário
                          </span>
                          {usuario && getPerfilBadge(usuario.perfil)}
                        </div>
                        <p className="text-xs text-gray-500">
                          O tipo de perfil determina suas permissões no sistema.
                        </p>
                      </div>

                      <div className="flex justify-end space-x-4 pt-6">
                        <Button
                          type="button"
                          variant="outline"
                          className="px-6"
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="submit"
                          disabled={isUpdating}
                          className="px-6 bg-blue-500 hover:bg-blue-600"
                        >
                          {isUpdating ? "Salvando..." : "Salvar Alterações"}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Card do Avatar */}
              <div>
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle className="text-xl font-medium text-gray-900">
                      Foto do Perfil
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="relative inline-block mb-4">
                      <Avatar className="h-24 w-24 mx-auto">
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
                          alt={usuario?.nome_completo || ""}
                        />
                        <AvatarFallback className="text-xl">
                          {usuario?.nome_completo?.[0] ||
                            user?.email?.[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        size="sm"
                        className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 bg-blue-500 hover:bg-blue-600"
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">
                      {usuario?.nome_completo || "Usuário"}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">{user?.email}</p>
                    <Button variant="outline" size="sm" className="w-full">
                      Alterar Foto
                    </Button>
                  </CardContent>
                </Card>

                {/* Estatísticas */}
                <Card className="bg-white mt-6">
                  <CardHeader>
                    <CardTitle className="text-xl font-medium text-gray-900">
                      Estatísticas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Submissões Enviadas
                        </span>
                        <span className="font-medium text-gray-900">12</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Aprovações Recebidas
                        </span>
                        <span className="font-medium text-green-600">8</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Pendentes</span>
                        <span className="font-medium text-yellow-600">3</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Taxa de Aprovação
                        </span>
                        <span className="font-medium text-blue-600">75%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
