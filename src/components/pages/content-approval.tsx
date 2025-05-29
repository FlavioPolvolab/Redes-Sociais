import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import {
  CheckCircle,
  XCircle,
  MessageSquare,
  File,
  Image,
  Video,
  Loader2,
} from "lucide-react";
import TopNavigation from "../dashboard/layout/TopNavigation";
import Sidebar from "../dashboard/layout/Sidebar";
import { supabase } from "../../../supabase/supabase";

interface Submission {
  id: string;
  titulo: string;
  descricao: string;
  status: "pendente" | "aprovado" | "rejeitado" | "revisao_solicitada";
  criado_em: string;
  arquivos: {
    nome: string;
    tipo: string;
    tamanho: number;
    url: string;
  }[];
  solicitante_id: string;
  solicitante_nome: string;
  solicitante_email: string;
  solicitante_avatar: string;
  aprovador_id: string | null;
  aprovador_nome: string | null;
  aprovador_email: string | null;
  aprovador_avatar: string | null;
}

export default function ContentApproval() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(
    null
  );
  const [comment, setComment] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from("vw_solicitacoes")
        .select("*")
        .eq("status", "pendente")
        .order("criado_em", { ascending: false });

      if (error) throw error;

      setSubmissions(data || []);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar as solicitações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: "aprovado" | "rejeitado" | "revisao_solicitada") => {
    if (!selectedSubmission) return;

    setIsProcessing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // 1. Atualizar status da solicitação
      const updateData: any = { 
        status: action,
        aprovador_id: user.id
      };

      if (action === "aprovado") {
        updateData.aprovado_em = new Date().toISOString();
      } else if (action === "rejeitado") {
        updateData.rejeitado_em = new Date().toISOString();
      }

      const { error: updateError } = await supabase
        .from("solicitacoes")
        .update(updateData)
        .eq("id", selectedSubmission.id);

      if (updateError) throw updateError;

      // 2. Registrar no histórico
      const { error: historicoError } = await supabase
        .from("historico_versoes")
        .insert([
          {
            solicitacao_id: selectedSubmission.id,
            usuario_id: user.id,
            acao: action,
            detalhes: {
              status_anterior: selectedSubmission.status,
              status_novo: action,
              motivo: comment
            }
          },
        ]);

      if (historicoError) throw historicoError;

      // 3. Se for revisão, adicionar comentário
      if (action === "revisao_solicitada" && comment) {
        const { error: comentarioError } = await supabase
          .from("comentarios")
          .insert([
            {
              solicitacao_id: selectedSubmission.id,
              usuario_id: user.id,
              conteudo: comment,
              tipo: "revisao"
            }
          ]);

        if (comentarioError) throw comentarioError;
      }

      toast({
        title: "Sucesso!",
        description: `Solicitação ${action === "aprovado" ? "aprovada" : action === "rejeitado" ? "rejeitada" : "enviada para revisão"} com sucesso.`,
      });

      // Atualizar lista e limpar seleção
      await fetchSubmissions();
      setSelectedSubmission(null);
      setComment("");
    } catch (error) {
      console.error("Erro ao processar solicitação:", error);
      toast({
        title: "Erro",
        description: "Não foi possível processar a solicitação.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <Image className="h-4 w-4" />;
    if (type.startsWith("video/")) return <Video className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando solicitações...</p>
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
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                Aprovação de Conteúdo
              </h1>
              <p className="text-gray-600">
                Revise e aprove as solicitações pendentes
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Lista de Solicitações */}
              <div className="space-y-4">
                {submissions.length === 0 ? (
                  <Card className="bg-white">
                    <CardContent className="p-12 text-center">
                      <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Nenhuma solicitação pendente
                      </h3>
                      <p className="text-gray-600">
                        Não há solicitações aguardando aprovação no momento.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  submissions.map((submission) => (
                    <Card
                      key={submission.id}
                      className={`bg-white cursor-pointer transition-all ${
                        selectedSubmission?.id === submission.id
                          ? "ring-2 ring-blue-500"
                          : "hover:shadow-md"
                      }`}
                      onClick={() => setSelectedSubmission(submission)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              {submission.titulo}
                            </h3>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {submission.descricao}
                            </p>
                            <div className="mt-4 flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage
                                    src={submission.solicitante_avatar}
                                  />
                                  <AvatarFallback>
                                    {submission.solicitante_nome[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {submission.solicitante_nome}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {submission.solicitante_email}
                                  </p>
                                </div>
                              </div>
                              <Badge variant="outline">
                                {submission.arquivos.length} arquivo
                                {submission.arquivos.length !== 1 && "s"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {/* Detalhes da Solicitação */}
              {selectedSubmission && (
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle className="text-xl font-medium text-gray-900">
                      Detalhes da Solicitação
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {selectedSubmission.titulo}
                      </h3>
                      <p className="text-gray-600">
                        {selectedSubmission.descricao}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">
                        Arquivos
                      </h4>
                      <div className="space-y-2">
                        {selectedSubmission.arquivos.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center space-x-3">
                              {getFileIcon(file.tipo)}
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {file.nome}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatFileSize(file.tamanho)}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(file.url, "_blank")}
                            >
                              Visualizar
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">
                        Comentário
                      </h4>
                      <Textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Adicione um comentário sobre sua decisão..."
                        rows={4}
                      />
                    </div>

                    <div className="flex justify-end space-x-4">
                      <Button
                        variant="outline"
                        onClick={() => handleAction("revisao_solicitada")}
                        disabled={isProcessing}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Solicitar Revisão
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleAction("rejeitado")}
                        disabled={isProcessing}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Rejeitar
                      </Button>
                      <Button
                        onClick={() => handleAction("aprovado")}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processando...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Aprovar
                          </>
                        )}
                      </Button>
                    </div>
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
