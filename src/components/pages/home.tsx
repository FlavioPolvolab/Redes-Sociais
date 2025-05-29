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
import { useAuth } from "../../supabase/auth";

export default function Home() {
  const { user, signOut } = useAuth();

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50">
        <div className="h-full flex items-center justify-between px-6">
          <Link to="/" className="text-xl font-semibold text-gray-900">
            Sistema de Gestão de Conteúdo
          </Link>
          <div className="flex items-center space-x-4">
            {user ? (
              <Button variant="ghost" onClick={signOut}>
                Sair
              </Button>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Entrar</Button>
                </Link>
                <Link to="/signup">
                  <Button>Criar Conta</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="pt-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Bem-vindo ao Sistema de Gestão de Conteúdo
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Uma plataforma completa para gerenciar e aprovar conteúdo de forma
            eficiente.
          </p>
          {!user && (
            <div className="flex justify-center space-x-4">
              <Link to="/login">
                <Button size="lg">Começar Agora</Button>
              </Link>
              <Link to="/signup">
                <Button variant="outline" size="lg">
                  Criar uma Conta
                </Button>
              </Link>
            </div>
          )}
        </div>
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
