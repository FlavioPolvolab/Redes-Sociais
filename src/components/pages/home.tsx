import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronRight,
  Settings,
  User,
  Upload,
  CheckCircle,
  Clock,
  Users,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../supabase/auth";

export default function LandingPage() {
  const { user, signOut } = useAuth();

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Apple-style navigation */}
      <header className="fixed top-0 z-50 w-full bg-[rgba(255,255,255,0.8)] backdrop-blur-md border-b border-[#f5f5f7]/30">
        <div className="max-w-[980px] mx-auto flex h-12 items-center justify-between px-4">
          <div className="flex items-center">
            <Link to="/" className="font-medium text-xl">
              ContentFlow
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/dashboard">
                  <Button
                    variant="ghost"
                    className="text-sm font-light hover:text-gray-500"
                  >
                    Dashboard
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-8 w-8 hover:cursor-pointer">
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                        alt={user.email || ""}
                      />
                      <AvatarFallback>
                        {user.email?.[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="rounded-xl border-none shadow-lg"
                  >
                    <DropdownMenuLabel className="text-xs text-gray-500">
                      {user.email}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => navigate("/profile")}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Perfil
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => navigate("/settings")}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Configurações
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onSelect={() => signOut()}
                    >
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button
                    variant="ghost"
                    className="text-sm font-light hover:text-gray-500"
                  >
                    Entrar
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="rounded-full bg-black text-white hover:bg-gray-800 text-sm px-4">
                    Começar
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="pt-12">
        {/* Hero section */}
        <section className="py-20 text-center">
          <h2 className="text-5xl font-semibold tracking-tight mb-1">
            Sistema de Aprovação de Conteúdo
          </h2>
          <h3 className="text-2xl font-medium text-gray-500 mb-4">
            Simplifique seu processo de revisão de conteúdo com fluxos
            estruturados e colaboração perfeita.
          </h3>
          <div className="flex justify-center space-x-6 text-xl text-blue-600">
            <Link to="/dashboard" className="flex items-center hover:underline">
              Ver Dashboard <ChevronRight className="h-4 w-4" />
            </Link>
            <Link to="/signup" className="flex items-center hover:underline">
              Começar Gratuitamente <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 flex justify-center space-x-4">
            <div className="bg-blue-50 px-4 py-2 rounded-full text-sm font-medium text-blue-700">
              Para Criadores de Conteúdo
            </div>
            <div className="bg-green-50 px-4 py-2 rounded-full text-sm font-medium text-green-700">
              Para Gerentes de Aprovação
            </div>
          </div>
        </section>

        {/* Features section */}
        <section className="py-20 bg-[#f5f5f7] text-center">
          <h2 className="text-5xl font-semibold tracking-tight mb-1">
            Fluxo de Trabalho Simplificado
          </h2>
          <h3 className="text-2xl font-medium text-gray-500 mb-4">
            Tudo que você precisa para aprovação eficiente de conteúdo e
            colaboração
          </h3>
          <div className="flex justify-center space-x-6 text-xl text-blue-600">
            <Link to="/dashboard" className="flex items-center hover:underline">
              Experimentar o fluxo <ChevronRight className="h-4 w-4" />
            </Link>
            <Link to="/signup" className="flex items-center hover:underline">
              Começar hoje <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm text-left">
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Upload className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="text-xl font-medium mb-2">
                Submissão Fácil de Conteúdo
              </h4>
              <p className="text-gray-500">
                Interface de arrastar e soltar para upload de imagens, vídeos e
                PDFs com conteúdo de texto acompanhante.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm text-left">
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="text-xl font-medium mb-2">
                Processo de Aprovação Estruturado
              </h4>
              <p className="text-gray-500">
                Dashboard limpo para revisores com botões de aprovação/rejeição
                e campos de comentários obrigatórios.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm text-left">
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="text-xl font-medium mb-2">
                Histórico Completo de Versões
              </h4>
              <p className="text-gray-500">
                Timeline detalhada mostrando todas as interações, comentários e
                versões de arquivos com timestamps.
              </p>
            </div>
          </div>
        </section>

        {/* Grid section for other features */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3">
          <div className="bg-[#f5f5f7] rounded-3xl p-12 text-center">
            <h2 className="text-4xl font-semibold tracking-tight mb-1">
              Acesso Baseado em Funções
            </h2>
            <h3 className="text-xl font-medium text-gray-500 mb-4">
              Autenticação segura com funções de usuário distintas
            </h3>
            <div className="flex justify-center space-x-6 text-lg text-blue-600">
              <Link to="/login" className="flex items-center hover:underline">
                Entrar <ChevronRight className="h-4 w-4" />
              </Link>
              <Link to="/signup" className="flex items-center hover:underline">
                Criar conta <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-4 bg-white p-6 rounded-xl shadow-sm max-w-sm mx-auto">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-md">
                  <span className="text-sm font-medium text-blue-700">
                    Criador de Conteúdo
                  </span>
                  <Upload className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-md">
                  <span className="text-sm font-medium text-green-700">
                    Gerente de Aprovação
                  </span>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="text-xs text-gray-500 text-center pt-2">
                  Escolha sua função durante o registro
                </div>
              </div>
            </div>
          </div>
          <div className="bg-[#f5f5f7] rounded-3xl p-12 text-center">
            <h2 className="text-4xl font-semibold tracking-tight mb-1">
              Colaboração em Tempo Real
            </h2>
            <h3 className="text-xl font-medium text-gray-500 mb-4">
              Notificações instantâneas e trabalho em equipe perfeito
            </h3>
            <div className="flex justify-center space-x-6 text-lg text-blue-600">
              <Link
                to="/dashboard"
                className="flex items-center hover:underline"
              >
                Ver dashboard <ChevronRight className="h-4 w-4" />
              </Link>
              <Link to="/signup" className="flex items-center hover:underline">
                Juntar-se à equipe <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-4 bg-white p-6 rounded-xl shadow-sm max-w-sm mx-auto">
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-2 bg-yellow-50 rounded-md">
                  <div className="h-2 w-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-700">
                    Nova submissão pendente
                  </span>
                </div>
                <div className="flex items-center space-x-3 p-2 bg-green-50 rounded-md">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-gray-700">
                    Conteúdo aprovado
                  </span>
                </div>
                <div className="flex items-center space-x-3 p-2 bg-blue-50 rounded-md">
                  <Users className="h-3 w-3 text-blue-500" />
                  <span className="text-xs text-gray-700">
                    Membro da equipe adicionou comentário
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#f5f5f7] py-12 text-xs text-gray-500">
        <div className="max-w-[980px] mx-auto px-4">
          <div className="border-b border-gray-300 pb-8 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-medium text-sm text-gray-900 mb-4">
                ContentFlow
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="hover:underline">
                    Recursos
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="hover:underline">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:underline">
                    Fluxo de Trabalho
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:underline">
                    Preços
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-sm text-gray-900 mb-4">
                Para Equipes
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/signup" className="hover:underline">
                    Criadores de Conteúdo
                  </Link>
                </li>
                <li>
                  <Link to="/signup" className="hover:underline">
                    Gerentes de Aprovação
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:underline">
                    Empresarial
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:underline">
                    Integrações
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-sm text-gray-900 mb-4">
                Suporte
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/help" className="hover:underline">
                    Central de Ajuda
                  </Link>
                </li>
                <li>
                  <Link to="/help" className="hover:underline">
                    Fale Conosco
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:underline">
                    Status
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:underline">
                    Comunidade
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-sm text-gray-900 mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="hover:underline">
                    Política de Privacidade
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:underline">
                    Termos de Serviço
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:underline">
                    Segurança
                  </Link>
                </li>
                <li>
                  <Link to="/" className="hover:underline">
                    LGPD
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="py-4">
            <p>Copyright © 2025 ContentFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
