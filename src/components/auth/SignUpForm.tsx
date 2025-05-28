import { useState } from "react";
import { useAuth } from "../../../supabase/auth";
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
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { useToast } from "@/components/ui/use-toast";
import { PerfilUsuario } from "@/types/supabase";

export default function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [perfil, setPerfil] = useState<PerfilUsuario>("solicitante");
  const [error, setError] = useState("");
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signUp(email, password, fullName, perfil);
      toast({
        title: "Conta criada com sucesso",
        description: "Verifique seu email para confirmar sua conta.",
        duration: 5000,
      });
      navigate("/login");
    } catch (error) {
      setError("Erro ao criar conta");
    }
  };

  return (
    <AuthLayout>
      <div className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label
              htmlFor="fullName"
              className="text-sm font-medium text-gray-700"
            >
              Nome Completo
            </Label>
            <Input
              id="fullName"
              placeholder="João Silva"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="h-12 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="nome@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="perfil"
              className="text-sm font-medium text-gray-700"
            >
              Perfil de Usuário
            </Label>
            <Select
              value={perfil}
              onValueChange={(value: PerfilUsuario) => setPerfil(value)}
            >
              <SelectTrigger className="h-12 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500">
                <SelectValue placeholder="Selecione seu perfil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solicitante">
                  Solicitante - Enviar conteúdo para aprovação
                </SelectItem>
                <SelectItem value="aprovador">
                  Aprovador - Revisar e aprovar conteúdo
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              Senha
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Crie uma senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              A senha deve ter pelo menos 8 caracteres
            </p>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button
            type="submit"
            className="w-full h-12 rounded-full bg-black text-white hover:bg-gray-800 text-sm font-medium"
          >
            Criar conta
          </Button>

          <div className="text-xs text-center text-gray-500 mt-6">
            Ao criar uma conta, você concorda com nossos{" "}
            <Link to="/" className="text-blue-600 hover:underline">
              Termos de Serviço
            </Link>{" "}
            e{" "}
            <Link to="/" className="text-blue-600 hover:underline">
              Política de Privacidade
            </Link>
          </div>

          <div className="text-sm text-center text-gray-600 mt-6">
            Já tem uma conta?{" "}
            <Link
              to="/login"
              className="text-blue-600 hover:underline font-medium"
            >
              Entrar
            </Link>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}
