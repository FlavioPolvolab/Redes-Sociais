import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { Usuario, PerfilUsuario } from "../src/types/supabase";

type AuthContextType = {
  user: User | null;
  usuario: Usuario | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    perfil?: PerfilUsuario,
  ) => Promise<void>;
  signOut: () => Promise<void>;
  hasPermission: (action: string) => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUsuario = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Erro ao buscar usuário:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      return null;
    }
  };

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);

      if (session?.user) {
        const userData = await fetchUsuario(session.user.id);
        setUsuario(userData);
      } else {
        setUsuario(null);
      }

      setLoading(false);
    });

    // Listen for changes on auth state (signed in, signed out, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);

      if (session?.user) {
        const userData = await fetchUsuario(session.user.id);
        setUsuario(userData);
      } else {
        setUsuario(null);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    perfil: PerfilUsuario = "solicitante",
  ) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          perfil: perfil,
        },
      },
    });
    if (error) throw error;
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUsuario(null);
  };

  const hasPermission = (action: string): boolean => {
    if (!usuario) return false;

    const { perfil } = usuario;

    switch (action) {
      case "criar_solicitacao":
        return perfil === "solicitante" || perfil === "admin";
      case "aprovar_solicitacao":
      case "rejeitar_solicitacao":
      case "comentar_solicitacao":
        return perfil === "aprovador" || perfil === "admin";
      case "gerenciar_usuarios":
      case "ver_todas_solicitacoes":
      case "deletar_solicitacao":
        return perfil === "admin";
      case "ver_proprias_solicitacoes":
      case "editar_perfil":
        return true; // Todos os usuários autenticados
      default:
        return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, usuario, loading, signIn, signUp, signOut, hasPermission }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
