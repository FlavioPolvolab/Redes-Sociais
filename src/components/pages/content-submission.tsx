import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Upload, File, X, Loader2 } from "lucide-react";
import TopNavigation from "../dashboard/layout/TopNavigation";
import Sidebar from "../dashboard/layout/Sidebar";
import { supabase } from "../../../supabase/supabase";

interface FileUpload {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
}

export default function ContentSubmission() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;

    const newFiles: FileUpload[] = [];

    for (const file of Array.from(selectedFiles)) {
      if (file.size > 10 * 1024 * 1024) {
        // 10MB
        toast({
          title: "Erro",
          description: `O arquivo ${file.name} excede o limite de 10MB`,
          variant: "destructive",
        });
        continue;
      }

      const allowedTypes = [
        "image/png",
        "image/jpeg",
        "application/pdf",
        "video/mp4",
        "video/webm",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Erro",
          description: `O arquivo ${file.name} não é um tipo permitido (PNG, JPG, PDF, MP4 ou WEBM)`,
          variant: "destructive",
        });
        continue;
      }

      newFiles.push({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        file: file,
      });
    }

    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  const removeFile = (fileId: string) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Verificar autenticação
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error("Usuário não autenticado");
      }

      // 2. Criar a solicitação
      const { data: solicitacao, error: solicitacaoError } = await supabase
        .from("solicitacoes")
        .insert([
          {
            titulo: title,
            descricao: description,
            status: "pendente",
            solicitante_id: user.id,
          },
        ])
        .select()
        .single();

      if (solicitacaoError) {
        console.error("Erro ao criar solicitação:", solicitacaoError);
        throw new Error("Não foi possível criar a solicitação");
      }

      // 3. Criar entrada no histórico
      const { error: historicoError } = await supabase
        .from("historico_versoes")
        .insert([
          {
            solicitacao_id: solicitacao.id,
            usuario_id: user.id,
            acao: "criado",
            comentario: "Solicitação criada",
            detalhes: {
              titulo: title,
              descricao: description,
              status: "pendente",
            },
          },
        ]);

      if (historicoError) {
        console.error("Erro ao criar histórico:", historicoError);
      }

      // 4. Upload e registro dos arquivos
      for (const file of files) {
        try {
          const fileExt = file.name.split(".").pop();
          const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

          // Upload do arquivo
          const { error: uploadError } = await supabase.storage
            .from("solicitacoes")
            .upload(fileName, file.file, {
              contentType: file.type,
            });

          if (uploadError) {
            console.error("Erro no upload:", uploadError);
            continue;
          }

          // Obter URL pública
          const {
            data: { publicUrl },
          } = supabase.storage.from("solicitacoes").getPublicUrl(fileName);

          // Registrar arquivo no banco
          const { error: arquivoError } = await supabase
            .from("arquivos")
            .insert([
              {
                solicitacao_id: solicitacao.id,
                nome_arquivo: file.name,
                caminho_storage: fileName,
                tipo_conteudo: file.type.includes("image")
                  ? "imagem"
                  : file.type.includes("video")
                    ? "video"
                    : "pdf",
                tamanho_bytes: file.size,
                url_publica: publicUrl,
              },
            ]);

          if (arquivoError) {
            console.error("Erro ao registrar arquivo:", arquivoError);
          }
        } catch (fileError) {
          console.error("Erro ao processar arquivo:", fileError);
        }
      }

      toast({
        title: "Sucesso!",
        description: "Sua solicitação foi enviada com sucesso.",
      });

      // Limpar formulário
      setTitle("");
      setDescription("");
      setFiles([]);
    } catch (error) {
      console.error("Erro ao enviar solicitação:", error);
      toast({
        title: "Erro",
        description:
          error instanceof Error
            ? error.message
            : "Não foi possível enviar sua solicitação. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <TopNavigation />
      <div className="flex h-[calc(100vh-64px)] mt-16">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                Nova Solicitação
              </h1>
              <p className="text-gray-600">
                Preencha os detalhes abaixo para enviar uma nova solicitação
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <Card className="bg-white mb-6">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="title">Título</Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Digite o título da solicitação"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Descreva os detalhes da sua solicitação"
                        required
                        rows={4}
                      />
                    </div>

                    <div>
                      <Label>Arquivos</Label>
                      <div className="mt-2">
                        <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                          <div className="space-y-1 text-center">
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-gray-600">
                              <label
                                htmlFor="file-upload"
                                className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                              >
                                <span>Upload de arquivos</span>
                                <input
                                  id="file-upload"
                                  name="file-upload"
                                  type="file"
                                  multiple
                                  className="sr-only"
                                  onChange={handleFileChange}
                                />
                              </label>
                              <p className="pl-1">ou arraste e solte</p>
                            </div>
                            <p className="text-xs text-gray-500">
                              PNG, JPG, PDF, MP4 ou WEBM até 10MB
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {files.length > 0 && (
                      <div className="space-y-2">
                        {files.map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center space-x-3">
                              <File className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {file.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatFileSize(file.size)}
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(file.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setTitle("");
                    setDescription("");
                    setFiles([]);
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar Solicitação"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
