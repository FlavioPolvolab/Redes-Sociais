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
  MessageSquare,
} from "lucide-react";
import TopNavigation from "../dashboard/layout/TopNavigation";
import Sidebar from "../dashboard/layout/Sidebar";
import { supabase } from "../../../supabase/supabase";
import { useAuth } from "../../supabase/auth";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface DashboardStats {
  total: number;
  pendentes: number;
  aprovadas: number;
  rejeitadas: number;
  revisao: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    pendentes: 0,
    aprovadas: 0,
    rejeitadas: 0,
    revisao: 0,
  });
  const [loading, setLoading] = useState(true);
  const { usuario } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [modalRevisaoOpen, setModalRevisaoOpen] = useState(false);
  const [solicitacoesRevisao, setSolicitacoesRevisao] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
  }, [usuario]);

  const fetchStats = async () => {
    try {
      if (!usuario) return;

      // Filtros para solicitante
      const solicitanteFilter =
        usuario.perfil === "solicitante" ? { solicitante_id: usuario.id } : {};

      // Total
      const { count: total } = await supabase
        .from("solicitacoes")
        .select("*", { count: "exact", head: true })
        .match(solicitanteFilter);

      // Pendentes
      const { count: pendentes } = await supabase
        .from("solicitacoes")
        .select("*", { count: "exact", head: true })
        .match({ ...solicitanteFilter, status: "pendente" });

      // Aprovadas
      const { count: aprovadas } = await supabase
        .from("solicitacoes")
        .select("*", { count: "exact", head: true })
        .match({ ...solicitanteFilter, status: "aprovado" });

      // Rejeitadas
      const { count: rejeitadas } = await supabase
        .from("solicitacoes")
        .select("*", { count: "exact", head: true })
        .match({ ...solicitanteFilter, status: "rejeitado" });

      // Revisão
      const { count: revisao } = await supabase
        .from("solicitacoes")
        .select("*", { count: "exact", head: true })
        .match({ ...solicitanteFilter, status: "revisao_solicitada" });

      setStats({
        total: total || 0,
        pendentes: pendentes || 0,
        aprovadas: aprovadas || 0,
        rejeitadas: rejeitadas || 0,
        revisao: revisao || 0,
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

  const fetchSolicitacoesRevisao = async () => {
    try {
      // Filtrar por usuário se for solicitante
      let query = supabase
        .from("vw_solicitacoes")
        .select(
          "id, titulo, descricao, criado_em, solicitante_nome, solicitante_email",
        )
        .eq("status", "revisao_solicitada")
        .order("criado_em", { ascending: false });

      // Se for solicitante, mostrar apenas suas próprias solicitações
      if (usuario?.perfil === "solicitante") {
        query = query.eq("solicitante_id", usuario.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Erro ao buscar solicitações em revisão:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as solicitações em revisão.",
          variant: "destructive",
        });
        return;
      }

      setSolicitacoesRevisao(data || []);
    } catch (error) {
      console.error("Erro ao buscar solicitações em revisão:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as solicitações em revisão.",
        variant: "destructive",
      });
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
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                Dashboard
              </h1>
              <p className="text-gray-600">{getWelcomeMessage()}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
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
                        Em Revisão
                      </p>
                      <h3 className="text-2xl font-semibold text-blue-600 mt-1">
                        {stats.revisao}
                      </h3>
                    </div>
                    <Clock className="h-8 w-8 text-blue-400" />
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Solicitações em Revisão</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Você tem {stats.revisao} solicitaç
                    {stats.revisao === 1 ? "ão" : "ões"} aguardando revisão.
                  </p>
                  <Button
                    onClick={async () => {
                      setModalRevisaoOpen(true);
                      await fetchSolicitacoesRevisao();
                    }}
                  >
                    Ver Solicitações em Revisão
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Solicitações Pendentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Você tem {stats.pendentes} solicitaç
                    {stats.pendentes === 1 ? "ão" : "ões"} aguardando aprovação.
                  </p>
                  <Button onClick={() => navigate("/solicitacoes/aprovacao")}>
                    Ver Solicitações
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Dialog open={modalRevisaoOpen} onOpenChange={setModalRevisaoOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Solicitações em Revisão</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {solicitacoesRevisao.length === 0 && (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">
                        Nenhuma solicitação em revisão encontrada.
                      </p>
                    </div>
                  )}
                  {solicitacoesRevisao.map((s) => (
                    <div
                      key={s.id}
                      className="p-4 border border-blue-200 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                      onClick={() => {
                        setModalRevisaoOpen(false);
                        navigate(`/solicitacoes/${s.id}`);
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 mb-1">
                            {s.titulo}
                          </div>
                          <div className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {s.descricao}
                          </div>
                          {s.solicitante_nome && (
                            <div className="text-xs text-gray-500 mb-1">
                              Solicitante: {s.solicitante_nome}
                            </div>
                          )}
                          <div className="text-xs text-gray-400">
                            {new Date(s.criado_em).toLocaleString("pt-BR")}
                          </div>
                        </div>
                        <div className="ml-4">
                          <Badge className="bg-blue-100 text-blue-800">
                            Em Revisão
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </div>
  );
}
