import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import {
  File,
  Image,
  Video,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  X,
} from "lucide-react";
import TopNavigation from "../dashboard/layout/TopNavigation";
import Sidebar from "../dashboard/layout/Sidebar";
import { supabase } from "../../../supabase/supabase";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Historico {
  id: string;
  acao: string;
  acao_descricao: string;
  comentario: string | null;
  criado_em: string;
  usuario_nome: string;
  usuario_avatar: string;
  usuario_perfil: string;
}

interface Solicitacao {
  id: string;
  titulo: string;
  descricao: string;
  status: string;
  criado_em: string;
  arquivos: {
    id: string;
    nome: string;
    tipo: string;
    tamanho: number;
    url: string;
  }[];
  solicitante_nome: string;
  solicitante_email: string;
  solicitante_avatar: string;
  aprovador_nome?: string;
  aprovador_email?: string;
  aprovador_avatar?: string;
}

export default function ContentDetails() {
  const { id } = useParams<{ id: string }>();
  const [solicitacao, setSolicitacao] = useState<Solicitacao | null>(null);
  const [historico, setHistorico] = useState<Historico[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchSolicitacao();
      fetchHistorico();
    }
  }, [id]);

  const fetchSolicitacao = async () => {
    try {
      const { data, error } = await supabase
        .from("vw_solicitacoes")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setSolicitacao(data);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os detalhes da solicitação.",
        variant: "destructive",
      });
    }
  };

  const fetchHistorico = async () => {
    try {
      const { data, error } = await supabase
        .from("vw_historico_solicitacoes")
        .select("*")
        .eq("solicitacao_id", id)
        .order("criado_em", { ascending: true });

      if (error) throw error;
      setHistorico(data || []);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar o histórico da solicitação.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pendente: { class: "bg-yellow-100 text-yellow-800", text: "Pendente" },
      aprovado: { class: "bg-green-100 text-green-800", text: "Aprovado" },
      rejeitado: { class: "bg-red-100 text-red-800", text: "Rejeitado" },
      revisao_solicitada: { class: "bg-blue-100 text-blue-800", text: "Em Revisão" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pendente;
    return <Badge className={config.class}>{config.text}</Badge>;
  };

  const handleFileClick = (file: any) => {
    setSelectedFile(file);
  };

  const handleCloseModal = () => {
    setSelectedFile(null);
  };

  const getFileIcon = (tipo: string) => {
    switch (tipo) {
      case "imagem":
        return <Image className="h-5 w-5" />;
      case "video":
        return <Video className="h-5 w-5" />;
      default:
        return <File className="h-5 w-5" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getActionIcon = (acao: string) => {
    switch (acao) {
      case "aprovado":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "rejeitado":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "revisao_solicitada":
        return <MessageSquare className="h-5 w-5 text-yellow-500" />;
      case "comentario_adicionado":
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando detalhes...</p>
        </div>
      </div>
    );
  }

  if (!solicitacao) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Solicitação não encontrada.</p>
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
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                    {solicitacao.titulo}
                  </h1>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(solicitacao.status)}
                    <span className="text-xs text-gray-500">
                      {format(new Date(solicitacao.criado_em), "dd 'de' MMMM 'de' yyyy HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <CardHeader>
                <CardTitle>Informações da Solicitação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {solicitacao.titulo}
                  </h3>
                  <p className="text-gray-600">{solicitacao.descricao}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={solicitacao.solicitante_avatar} />
                    <AvatarFallback>
                      {solicitacao.solicitante_nome[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {solicitacao.solicitante_nome}
                    </p>
                    <p className="text-sm text-gray-500">
                      {solicitacao.solicitante_email}
                    </p>
                  </div>
                </div>
              </CardContent>

              <Card>
                <CardHeader>
                  <CardTitle>Histórico da Solicitação</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {historico.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start space-x-4 border-b border-gray-100 pb-6 last:border-0 last:pb-0"
                      >
                        <div className="flex-shrink-0">
                          {getActionIcon(item.acao)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={item.usuario_avatar} />
                                <AvatarFallback>
                                  {item.usuario_nome[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {item.usuario_nome}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {item.acao_descricao}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm text-gray-500">
                              {format(new Date(item.criado_em), "dd 'de' MMMM 'às' HH:mm", {
                                locale: ptBR,
                              })}
                            </p>
                          </div>
                          <p className="mt-2 text-sm text-gray-600">
                            {item.comentario}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Arquivos Anexados</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      Arquivos Anexados
                    </h4>
                    <div className="space-y-2">
                      {solicitacao.arquivos.map((file, index) => (
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
                            onClick={() => handleFileClick(file)}
                          >
                            Visualizar
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Arquivos */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Arquivos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {solicitacao.arquivos.length === 0 && (
                      <p className="text-gray-500">Nenhum arquivo enviado.</p>
                    )}
                    {solicitacao.arquivos.map((file) => (
                      <div
                        key={file.id}
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
                          onClick={() => handleFileClick(file)}
                        >
                          Visualizar
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Modal para visualização de imagem ou vídeo */}
              <Dialog open={!!selectedFile} onOpenChange={handleCloseModal}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{selectedFile?.nome}</DialogTitle>
                  </DialogHeader>
                  {selectedFile && selectedFile.tipo === "imagem" && (
                    <img src={selectedFile.url} alt={selectedFile.nome} className="max-h-[60vh] mx-auto" />
                  )}
                  {selectedFile && selectedFile.tipo === "video" && (
                    <video src={selectedFile.url} controls className="max-h-[60vh] mx-auto" />
                  )}
                  {selectedFile && selectedFile.tipo !== "imagem" && selectedFile.tipo !== "video" && (
                    <a href={selectedFile.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Abrir arquivo</a>
                  )}
                </DialogContent>
              </Dialog>

              {solicitacao.status === 'revisao_solicitada' && (
                <Button
                  className="mt-4"
                  onClick={async () => {
                    try {
                      const { error } = await supabase
                        .from('solicitacoes')
                        .update({ status: 'pendente' })
                        .eq('id', solicitacao.id);
                      if (error) throw error;
                      toast({ title: 'Sucesso!', description: 'Solicitação enviada para aprovação novamente.' });
                      fetchSolicitacao();
                    } catch (error) {
                      toast({ title: 'Erro', description: 'Não foi possível reenviar para aprovação.', variant: 'destructive' });
                    }
                  }}
                >
                  Enviar para aprovação novamente
                </Button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 