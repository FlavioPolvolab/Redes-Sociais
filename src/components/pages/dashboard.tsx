import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import TopNavigation from "../dashboard/layout/TopNavigation";
import Sidebar from "../dashboard/layout/Sidebar";
import { supabase } from "../../../supabase/supabase";
import { useAuth } from "../../../supabase/auth";
import { useNavigate } from "react-router-dom";

interface DashboardStats {
  total: number;
  pendentes: number;
  aprovadas: number;
  rejeitadas: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    pendentes: 0,
    aprovadas: 0,
    rejeitadas: 0
  });
  const [loading, setLoading] = useState(true);
  const { usuario } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, [usuario]);

  const fetchStats = async () => {
    try {
      if (!usuario) return;

      let baseQuery = supabase.from("solicitacoes");
      let filter = baseQuery;
      if (usuario.perfil === "solicitante") {
        filter = filter.select("*", { count: "exact" }).eq("solicitante_id", usuario.id);
      } else {
        filter = filter.select("*", { count: "exact" });
      }

      // Buscar total
      const { count: total } = await filter;

      // Buscar pendentes
      const { count: pendentes } = await baseQuery.select("*", { count: "exact" })
        .eq("status", "pendente")
        .eq(usuario.perfil === "solicitante" ? "solicitante_id" : undefined, usuario.perfil === "solicitante" ? usuario.id : undefined);

      // Buscar aprovadas
      const { count: aprovadas } = await baseQuery.select("*", { count: "exact" })
        .eq("status", "aprovado")
        .eq(usuario.perfil === "solicitante" ? "solicitante_id" : undefined, usuario.perfil === "solicitante" ? usuario.id : undefined);

      // Buscar rejeitadas
      const { count: rejeitadas } = await baseQuery.select("*", { count: "exact" })
        .eq("status", "rejeitado")
        .eq(usuario.perfil === "solicitante" ? "solicitante_id" : undefined, usuario.perfil === "solicitante" ? usuario.id : undefined);

      setStats({
        total: total || 0,
        pendentes: pendentes || 0,
        aprovadas: aprovadas || 0,
        rejeitadas: rejeitadas || 0
      });
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as estatísticas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getWelcomeMessage = () => {
    switch (usuario?.perfil) {
      case "solicitante":
        return "Acompanhe suas solicitações";
      case "aprovador":
        return "Gerencie as solicitações pendentes";
      case "admin":
        return "Visão geral do sistema";
      default:
        return "Bem-vindo ao sistema";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <TopNavigation />
      <div className="flex h-[calc(100vh-64px)] mt-16">
        <Sidebar />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                Dashboard
              </h1>
              <p className="text-gray-600">{getWelcomeMessage()}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Total de Solicitações
                      </p>
                      <h3 className="text-2xl font-semibold text-gray-900 mt-1">
                        {stats.total}
                      </h3>
                    </div>
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Pendentes
                      </p>
                      <h3 className="text-2xl font-semibold text-yellow-600 mt-1">
                        {stats.pendentes}
                      </h3>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-400" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Aprovadas
                      </p>
                      <h3 className="text-2xl font-semibold text-green-600 mt-1">
                        {stats.aprovadas}
                      </h3>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Rejeitadas
                      </p>
                      <h3 className="text-2xl font-semibold text-red-600 mt-1">
                        {stats.rejeitadas}
                      </h3>
                    </div>
                    <XCircle className="h-8 w-8 text-red-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {usuario?.perfil === "solicitante" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Criar Nova Solicitação</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-gray-600 mb-4">
                      Clique no botão abaixo para criar uma nova solicitação de conteúdo.
                    </p>
                    <Button onClick={() => navigate("/solicitacoes/nova")}>
                      Nova Solicitação
                    </Button>
                  </CardContent>
                </Card>
              )}

              {(usuario?.perfil === "aprovador" || usuario?.perfil === "admin") && (
                <Card>
                  <CardHeader>
                    <CardTitle>Solicitações Pendentes</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-gray-600 mb-4">
                      Você tem {stats.pendentes} solicitações aguardando aprovação.
                    </p>
                    <Button onClick={() => navigate("/solicitacoes/aprovacao")}>
                      Ver Solicitações
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
