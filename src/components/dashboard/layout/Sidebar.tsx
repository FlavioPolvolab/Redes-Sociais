import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../../supabase/auth";
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";

interface SidebarProps {
  activeItem?: string;
}

export default function Sidebar({ activeItem }: SidebarProps) {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const isActive = (path: string) => {
    if (activeItem) {
      return activeItem === path;
    }
    return location.pathname === path;
  };

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      show: true,
    },
    {
      name: "Nova Solicitação",
      path: "/solicitacoes/nova",
      icon: <FileText className="h-5 w-5" />,
      show: user?.perfil === "solicitante" || user?.perfil === "admin",
    },
    {
      name: "Aprovação",
      path: "/solicitacoes/aprovacao",
      icon: <FileText className="h-5 w-5" />,
      show: user?.perfil === "aprovador" || user?.perfil === "admin",
    },
    {
      name: "Histórico",
      path: "/solicitacoes/historico",
      icon: <FileText className="h-5 w-5" />,
      show: true,
    },
    {
      name: "Usuários",
      path: "/usuarios",
      icon: <Users className="h-5 w-5" />,
      show: user?.perfil === "admin",
    },
    {
      name: "Configurações",
      path: "/settings",
      icon: <Settings className="h-5 w-5" />,
      show: true,
    },
    {
      name: "Ajuda",
      path: "/help",
      icon: <HelpCircle className="h-5 w-5" />,
      show: true,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
      <div className="h-full flex flex-col">
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {menuItems
              .filter((item) => item.show)
              .map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg ${
                      isActive(item.path)
                        ? "text-blue-700 bg-blue-50"
                        : "text-gray-700 hover:text-blue-700 hover:bg-blue-50"
                    }`}
                  >
                    {item.icon}
                    <span className="ml-3">{item.name}</span>
                  </Link>
                </li>
              ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={signOut}
            className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:text-blue-700 hover:bg-blue-50"
          >
            <LogOut className="h-5 w-5" />
            <span className="ml-3">Sair</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
