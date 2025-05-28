import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CheckCircle,
  XCircle,
  MessageSquare,
  Clock,
  Search,
  Filter,
} from "lucide-react";
import TopNavigation from "../dashboard/layout/TopNavigation";
import Sidebar from "../dashboard/layout/Sidebar";

interface HistoryEntry {
  id: string;
  action:
    | "criado"
    | "aprovado"
    | "rejeitado"
    | "revisao_solicitada"
    | "comentario";
  submissionTitle: string;
  user: {
    name: string;
    email: string;
    avatar: string;
    role: "solicitante" | "aprovador";
  };
  timestamp: string;
  comment?: string;
  details?: string;
}

const mockHistory: HistoryEntry[] = [
  {
    id: "1",
    action: "aprovado",
    submissionTitle: "Campanha de Marketing Q1",
    user: {
      name: "Ana Costa",
      email: "ana@empresa.com",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana",
      role: "aprovador",
    },
    timestamp: "2024-01-15T16:30:00Z",
    comment:
      "Excelente trabalho! O material está alinhado com nossa estratégia de marca.",
  },
  {
    id: "2",
    action: "revisao_solicitada",
    submissionTitle: "Conteúdo Blog Corporativo",
    user: {
      name: "Carlos Silva",
      email: "carlos@empresa.com",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos",
      role: "aprovador",
    },
    timestamp: "2024-01-15T14:15:00Z",
    comment:
      "Por favor, ajuste o tom do artigo para ser mais formal e adicione mais dados estatísticos.",
  },
  {
    id: "3",
    action: "criado",
    submissionTitle: "Conteúdo Blog Corporativo",
    user: {
      name: "João Santos",
      email: "joao@empresa.com",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Joao",
      role: "solicitante",
    },
    timestamp: "2024-01-14T14:20:00Z",
    details: "Submissão criada com 2 arquivos anexados",
  },
  {
    id: "4",
    action: "criado",
    submissionTitle: "Campanha de Marketing Q1",
    user: {
      name: "Maria Silva",
      email: "maria@empresa.com",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
      role: "solicitante",
    },
    timestamp: "2024-01-15T10:30:00Z",
    details: "Submissão criada com 2 arquivos anexados",
  },
  {
    id: "5",
    action: "rejeitado",
    submissionTitle: "Banner Promocional",
    user: {
      name: "Ana Costa",
      email: "ana@empresa.com",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana",
      role: "aprovador",
    },
    timestamp: "2024-01-13T11:45:00Z",
    comment:
      "O design não está alinhado com as diretrizes da marca. Por favor, revise as cores e tipografia.",
  },
];

export default function VersionHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState<string>("all");

  const filteredHistory = mockHistory.filter((entry) => {
    const matchesSearch =
      entry.submissionTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.user.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterAction === "all" || entry.action === filterAction;
    return matchesSearch && matchesFilter;
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case "aprovado":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "rejeitado":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "revisao_solicitada":
        return <MessageSquare className="h-5 w-5 text-yellow-500" />;
      case "comentario":
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getActionBadge = (action: string) => {
    const actionConfig = {
      criado: { label: "Criado", variant: "secondary" as const },
      aprovado: { label: "Aprovado", variant: "default" as const },
      rejeitado: { label: "Rejeitado", variant: "destructive" as const },
      revisao_solicitada: {
        label: "Revisão Solicitada",
        variant: "outline" as const,
      },
      comentario: { label: "Comentário", variant: "secondary" as const },
    };

    const config = actionConfig[action as keyof typeof actionConfig];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getRoleBadge = (role: string) => {
    return (
      <Badge variant={role === "aprovador" ? "default" : "secondary"}>
        {role === "aprovador" ? "Aprovador" : "Solicitante"}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <TopNavigation />
      <div className="flex h-[calc(100vh-64px)] mt-16">
        <Sidebar activeItem="Histórico" />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                Histórico de Versões
              </h1>
              <p className="text-gray-600">
                Acompanhe todas as interações e mudanças nas submissões
              </p>
            </div>

            {/* Filtros */}
            <Card className="bg-white mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por título ou usuário..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-gray-400" />
                    <select
                      value={filterAction}
                      onChange={(e) => setFilterAction(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">Todas as ações</option>
                      <option value="criado">Criado</option>
                      <option value="aprovado">Aprovado</option>
                      <option value="rejeitado">Rejeitado</option>
                      <option value="revisao_solicitada">
                        Revisão Solicitada
                      </option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <div className="space-y-4">
              {filteredHistory.map((entry, index) => (
                <Card key={entry.id} className="bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        {getActionIcon(entry.action)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-lg font-medium text-gray-900">
                              {entry.submissionTitle}
                            </h3>
                            {getActionBadge(entry.action)}
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(entry.timestamp).toLocaleString("pt-BR")}
                          </span>
                        </div>

                        <div className="flex items-center space-x-4 mb-3">
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={entry.user.avatar} />
                              <AvatarFallback>
                                {entry.user.name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {entry.user.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {entry.user.email}
                              </p>
                            </div>
                          </div>
                          {getRoleBadge(entry.user.role)}
                        </div>

                        {entry.comment && (
                          <div className="bg-gray-50 rounded-lg p-4 mt-3">
                            <p className="text-sm text-gray-700">
                              {entry.comment}
                            </p>
                          </div>
                        )}

                        {entry.details && (
                          <p className="text-sm text-gray-600 mt-2">
                            {entry.details}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredHistory.length === 0 && (
              <Card className="bg-white">
                <CardContent className="p-12 text-center">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum histórico encontrado
                  </h3>
                  <p className="text-gray-600">
                    Não há registros que correspondam aos filtros aplicados.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
