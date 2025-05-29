import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, UserPlus } from "lucide-react";
import TopNavigation from "../dashboard/layout/TopNavigation";
import Sidebar from "../dashboard/layout/Sidebar";
import { supabase } from "../../supabase/supabase";
import { useAuth, AuthContextType } from "../../supabase/auth";
import { useNavigate } from "react-router-dom";
import { PerfilUsuario } from "@/types/supabase";

interface NovoUsuario {
  email: string;
  senha: string;
  nome: string;
  perfil: PerfilUsuario;
}

interface Usuario {
  id: string;
  email: string;
  nome_completo: string;
  perfil: PerfilUsuario;
  criado_em?: string;
  avatar_url?: string;
  ativo?: boolean;
}

export default function UserManagement() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [novoUsuario, setNovoUsuario] = useState<NovoUsuario>({
    email: "",
    senha: "",
    nome: "",
    perfil: "solicitante",
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const auth = useAuth();
  const { user } = auth;
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.perfil !== "admin") {
      navigate("/dashboard");
      return;
    }
    fetchUsuarios();
  }, [user]);

  const fetchUsuarios = async () => {
    try {
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .order("criado_em", { ascending: false });

      if (error) throw error;
      setUsuarios(data || []);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de usuários.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Usar a função do banco para criar usuário admin
      const { data, error } = await supabase.rpc("criar_usuario_admin", {
        email_admin: novoUsuario.email,
        senha_admin: novoUsuario.senha,
      });

      if (error) throw error;

      // Inserir dados na tabela de usuários
      const { error: dbError } = await supabase.from("usuarios").insert([
        {
          id: data,
          email: novoUsuario.email,
          nome_completo: novoUsuario.nome,
          perfil: novoUsuario.perfil,
        },
      ]);

      if (dbError) throw dbError;

      toast({
        title: "Sucesso!",
        description: "Usuário criado com sucesso.",
      });
      setNovoUsuario({
        email: "",
        senha: "",
        nome: "",
        perfil: "solicitante",
      });
      fetchUsuarios();
    } catch (error: any) {
      console.error("Erro ao criar usuário:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível criar o usuário.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
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
                Gerenciamento de Usuários
              </h1>
              <p className="text-gray-600">
                Crie e gerencie usuários do sistema
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Novo Usuário</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="nome">Nome</Label>
                      <Input
                        id="nome"
                        value={novoUsuario.nome}
                        onChange={(e) =>
                          setNovoUsuario((prev) => ({
                            ...prev,
                            nome: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        value={novoUsuario.email}
                        onChange={(e) =>
                          setNovoUsuario((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="senha">Senha</Label>
                      <Input
                        id="senha"
                        type="password"
                        value={novoUsuario.senha}
                        onChange={(e) =>
                          setNovoUsuario((prev) => ({
                            ...prev,
                            senha: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="perfil">Perfil</Label>
                      <Select
                        value={novoUsuario.perfil}
                        onValueChange={(
                          value: "solicitante" | "aprovador" | "admin",
                        ) =>
                          setNovoUsuario((prev) => ({
                            ...prev,
                            perfil: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um perfil" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="solicitante">
                            Solicitante
                          </SelectItem>
                          <SelectItem value="aprovador">Aprovador</SelectItem>
                          <SelectItem value="admin">Administrador</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Criando...
                        </>
                      ) : (
                        <>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Criar Usuário
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Usuários do Sistema</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>E-mail</TableHead>
                        <TableHead>Perfil</TableHead>
                        <TableHead>Data de Criação</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usuarios.map((usuario) => (
                        <TableRow key={usuario.id}>
                          <TableCell>{usuario.nome_completo}</TableCell>
                          <TableCell>{usuario.email}</TableCell>
                          <TableCell className="capitalize">
                            {usuario.perfil}
                          </TableCell>
                          <TableCell>
                            {new Date(
                              usuario.criado_em || "",
                            ).toLocaleDateString("pt-BR")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
