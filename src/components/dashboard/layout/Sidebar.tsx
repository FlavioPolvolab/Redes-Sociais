import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../../../supabase/auth";
import {
  LayoutDashboard,
  Users,
  Settings,
  User,
  FileText,
  PlusCircle,
  CheckCircle,
  History,
  Clock,
} from "lucide-react";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  requiresAdmin?: boolean;
  requiresAprovador?: boolean;
}

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario } = useAuth();

  const navItems: NavItem[] = [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard", href: "/dashboard" },
    { icon: <PlusCircle size={20} />, label: "Nova Solicitação", href: "/solicitacoes/nova" },
    { 
      icon: <CheckCircle size={20} />, 
      label: "Aprovação", 
      href: "/solicitacoes/aprovacao",
      requiresAprovador: true 
    },
    { icon: <History size={20} />, label: "Histórico", href: "/solicitacoes/historico" },
    { icon: <Users size={20} />, label: "Usuários", href: "/users", requiresAdmin: true },
  ];

  const bottomItems: NavItem[] = [
    { icon: <User size={20} />, label: "Perfil", href: "/profile" },
    { icon: <Settings size={20} />, label: "Configurações", href: "/settings" },
  ];

  const handleNavigation = (href: string) => {
    navigate(href);
  };

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  return (
    <div className="w-[280px] h-full bg-white/80 backdrop-blur-md border-r border-gray-200 flex flex-col">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-2 text-gray-900">Sistema</h2>
        <p className="text-sm text-gray-500">
          Gerenciamento de solicitações
        </p>
      </div>

      <ScrollArea className="flex-1 px-4">
        <div className="space-y-1.5">
          {navItems.map((item) => {
            if (item.requiresAdmin && usuario?.perfil !== "admin") {
              return null;
            }
            if (item.requiresAprovador && usuario?.perfil !== "aprovador" && usuario?.perfil !== "admin") {
              return null;
            }
            return (
              <Button
                key={item.label}
                variant="ghost"
                className={`w-full justify-start gap-3 h-10 rounded-xl text-sm font-medium ${
                  isActive(item.href)
                    ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => handleNavigation(item.href)}
              >
                <span
                  className={`${
                    isActive(item.href) ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  {item.icon}
                </span>
                {item.label}
              </Button>
            );
          })}
        </div>

        <Separator className="my-4 bg-gray-100" />

        <div className="space-y-1.5">
          {bottomItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              className={`w-full justify-start gap-3 h-10 rounded-xl text-sm font-medium ${
                isActive(item.href)
                  ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => handleNavigation(item.href)}
            >
              <span
                className={`${
                  isActive(item.href) ? "text-blue-600" : "text-gray-500"
                }`}
              >
                {item.icon}
              </span>
              {item.label}
            </Button>
          ))}
        </div>

        <Separator className="my-4 bg-gray-100" />

        <div className="space-y-1.5">
          {usuario?.perfil === "solicitante" && (
            <>
              <Link
                to="/solicitacoes/nova"
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <PlusCircle className="h-5 w-5" />
                <span>Nova Solicitação</span>
              </Link>
              <Link
                to="/dashboard"
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <FileText className="h-5 w-5" />
                <span>Minhas Solicitações</span>
              </Link>
            </>
          )}

          {usuario?.perfil === "admin" && (
            <Link
              to="/usuarios"
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <Users className="h-5 w-5" />
              <span>Gerenciar Usuários</span>
            </Link>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default Sidebar;
