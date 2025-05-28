import React, { useState } from "react";
import { useAuth } from "../../../supabase/auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import {
  CheckCircle,
  XCircle,
  MessageSquare,
  Clock,
  FileText,
  Image,
  Video,
} from "lucide-react";
import TopNavigation from "../dashboard/layout/TopNavigation";
import Sidebar from "../dashboard/layout/Sidebar";
import { useNavigate } from "react-router-dom";

interface Submission {
  id: string;
  title: string;
  description: string;
  status: "pendente" | "aprovado" | "rejeitado" | "revisao_solicitada";
  submittedBy: {
    name: string;
    email: string;
    avatar: string;
  };
  submittedAt: string;
  files: Array<{
    name: string;
    type: string;
    url: string;
  }>;
}

const mockSubmissions: Submission[] = [
  {
    id: "1",
    title: "Campanha de Marketing Q1",
    description:
      "Material promocional para o primeiro trimestre incluindo banners e vídeos para redes sociais.",
    status: "pendente",
    submittedBy: {
      name: "Maria Silva",
      email: "maria@empresa.com",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
    },
    submittedAt: "2024-01-15T10:30:00Z",
    files: [
      { name: "banner-principal.jpg", type: "image/jpeg", url: "#" },
      { name: "video-promocional.mp4", type: "video/mp4", url: "#" },
    ],
  },
  {
    id: "2",
    title: "Conteúdo Blog Corporativo",
    description:
      "Artigos e imagens para o blog da empresa sobre tendências do mercado.",
    status: "pendente",
    submittedBy: {
      name: "João Santos",
      email: "joao@empresa.com",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Joao",
    },
    submittedAt: "2024-01-14T14:20:00Z",
    files: [
      { name: "artigo-tendencias.pdf", type: "application/pdf", url: "#" },
      { name: "infografico.png", type: "image/png", url: "#" },
    ],
  },
];

export default function ContentApproval() {
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);
  const [comment, setComment] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleApproval = async (
    submissionId: string,
    action: "approve" | "reject" | "request_changes",
  ) => {
    if (!comment.trim()) {
      toast({
        title: "Comentário obrigatório",
        description: "Por favor, adicione um comentário antes de prosseguir.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Aqui seria implementada a lógica de aprovação/rejeição no Supabase

      const actionText = {
        approve: "aprovada",
        reject: "rejeitada",
        request_changes: "enviada para revisão",
      }[action];

      toast({
        title: "Ação realizada com sucesso!",
        description: `A submissão foi ${actionText}.`,
      });

      setComment("");
      setSelectedSubmission(null);
    } catch (error) {
      toast({
        title: "Erro ao processar ação",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <Image className="h-4 w-4" />;
    if (type.startsWith("video/")) return <Video className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pendente: { label: "Pendente", variant: "secondary" as const },
      aprovado: { label: "Aprovado", variant: "default" as const },
      rejeitado: { label: "Rejeitado", variant: "destructive" as const },
      revisao_solicitada: {
        label: "Revisão Solicitada",
        variant: "outline" as const,
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <TopNavigation />
      <div className="flex h-[calc(100vh-64px)] mt-16">
        <Sidebar activeItem="Aprovação" />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                Aprovação de Conteúdo
              </h1>
              <p className="text-gray-600">
                Revise e aprove submissões de conteúdo
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Lista de Submissões */}
              <div className="space-y-4">
                <h2 className="text-xl font-medium text-gray-900 mb-4">
                  Submissões Pendentes
                </h2>
                {mockSubmissions.map((submission) => (
                  <Card
                    key={submission.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedSubmission?.id === submission.id
                        ? "ring-2 ring-blue-500 bg-blue-50"
                        : "bg-white"
                    }`}
                    onClick={() => setSelectedSubmission(submission)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-medium text-gray-900">
                          {submission.title}
                        </h3>
                        {getStatusBadge(submission.status)}
                      </div>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {submission.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={submission.submittedBy.avatar} />
                            <AvatarFallback>
                              {submission.submittedBy.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {submission.submittedBy.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(
                                submission.submittedAt,
                              ).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {submission.files.length} arquivo(s)
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Detalhes da Submissão */}
              <div className="lg:sticky lg:top-6">
                {selectedSubmission ? (
                  <Card className="bg-white">
                    <CardHeader>
                      <CardTitle className="text-xl font-medium text-gray-900">
                        {selectedSubmission.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          Descrição
                        </h4>
                        <p className="text-gray-600">
                          {selectedSubmission.description}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">
                          Arquivos
                        </h4>
                        <div className="space-y-2">
                          {selectedSubmission.files.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                            >
                              {getFileIcon(file.type)}
                              <span className="text-sm text-gray-700 flex-1">
                                {file.name}
                              </span>
                              <Button size="sm" variant="outline">
                                Visualizar
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          Comentário
                        </h4>
                        <Textarea
                          placeholder="Adicione seus comentários sobre esta submissão..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          rows={4}
                          className="rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div className="flex space-x-3">
                        <Button
                          onClick={() =>
                            handleApproval(selectedSubmission.id, "approve")
                          }
                          disabled={isProcessing}
                          className="flex-1 bg-green-500 hover:bg-green-600"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Aprovar
                        </Button>
                        <Button
                          onClick={() =>
                            handleApproval(
                              selectedSubmission.id,
                              "request_changes",
                            )
                          }
                          disabled={isProcessing}
                          variant="outline"
                          className="flex-1"
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Solicitar Revisão
                        </Button>
                        <Button
                          onClick={() =>
                            handleApproval(selectedSubmission.id, "reject")
                          }
                          disabled={isProcessing}
                          variant="destructive"
                          className="flex-1"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Rejeitar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="bg-white">
                    <CardContent className="p-12 text-center">
                      <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Selecione uma submissão
                      </h3>
                      <p className="text-gray-600">
                        Escolha uma submissão da lista para revisar e aprovar
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
