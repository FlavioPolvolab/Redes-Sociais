import { ReactNode } from "react";
import { Link } from "react-router-dom";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-black">
      {/* Apple-style navigation */}
      <header className="fixed top-0 z-50 w-full bg-[rgba(255,255,255,0.8)] backdrop-blur-md border-b border-[#f5f5f7]/30">
        <div className="max-w-[980px] mx-auto flex h-12 items-center justify-between px-4">
          <div className="flex items-center">
            <Link to="/" className="font-medium text-xl">
              Sistema de Aprovação
            </Link>
          </div>
          <nav className="hidden md:flex items-center space-x-7 text-sm font-light">
            <Link to="/" className="hover:text-gray-500">
              Recursos
            </Link>
            <Link to="/" className="hover:text-gray-500">
              Documentação
            </Link>
            <Link to="/" className="hover:text-gray-500">
              Componentes
            </Link>
            <Link to="/" className="hover:text-gray-500">
              Exemplos
            </Link>
            <Link to="/" className="hover:text-gray-500">
              Suporte
            </Link>
          </nav>
        </div>
      </header>

      <div className="min-h-screen flex items-center justify-center pt-12">
        <div className="max-w-md w-full px-4">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-semibold tracking-tight">
              Sistema de Aprovação
            </h2>
            <p className="text-xl font-medium text-gray-500 mt-2">
              Faça login para acessar sua conta
            </p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
