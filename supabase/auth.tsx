import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabase";
import { useNavigate } from "react-router-dom";
import { Usuario } from "../src/types/supabase";

export interface AuthContextType {
  usuario: Usuario | null;
  user: Usuario | null; // Alias for backward compatibility
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const { data: userData, error } = await supabase
          .from("usuarios")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (error) {
          console.error("Erro ao buscar dados do usuário:", error);
          setUsuario(null);
        } else {
          setUsuario(userData);
        }
      } else {
        setUsuario(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{ usuario, user: usuario, loading, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
