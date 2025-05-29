import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabase";
import { useNavigate } from "react-router-dom";
import { Usuario } from "../types/supabase";

export interface AuthContextType {
  user: Usuario | null;
  usuario: Usuario | null; // Alias for backward compatibility
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const defaultContext: AuthContextType = {
  user: null,
  usuario: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
};

const AuthContext = createContext<AuthContextType>(defaultContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Check current session first
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Erro ao obter sessão:", sessionError);
          if (mounted) {
            setError(sessionError.message);
            setLoading(false);
          }
          return;
        }

        if (session?.user) {
          try {
            const { data: userData, error: userError } = await supabase
              .from("usuarios")
              .select("*")
              .eq("id", session.user.id)
              .single();

            if (userError) {
              console.error("Erro ao buscar dados do usuário:", userError);
              if (mounted) {
                setUser(null);
                setError("Usuário não encontrado no banco de dados");
              }
            } else if (mounted) {
              setUser(userData as Usuario);
              setError(null);
            }
          } catch (err) {
            console.error("Erro na consulta do usuário:", err);
            if (mounted) {
              setUser(null);
              setError("Erro ao carregar dados do usuário");
            }
          }
        } else if (mounted) {
          setUser(null);
          setError(null);
        }
      } catch (err) {
        console.error("Erro na inicialização da autenticação:", err);
        if (mounted) {
          setError("Erro na inicialização da autenticação");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log("Auth state changed:", event, session?.user?.id);

      if (session?.user) {
        try {
          const { data: userData, error: userError } = await supabase
            .from("usuarios")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (userError) {
            console.error("Erro ao buscar dados do usuário:", userError);
            setUser(null);
            setError("Usuário não encontrado");
          } else {
            setUser(userData as Usuario);
            setError(null);
          }
        } catch (err) {
          console.error("Erro na consulta do usuário:", err);
          setUser(null);
          setError("Erro ao carregar dados do usuário");
        }
      } else {
        setUser(null);
        setError(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/login");
    } catch (err: any) {
      console.error("Erro ao fazer logout:", err);
      setError(err.message);
    }
  };

  const value: AuthContextType = {
    user,
    usuario: user, // Alias for backward compatibility
    loading,
    signIn,
    signOut,
  };

  // Show error state if there's a critical error
  if (error && !loading && !user) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Erro de Autenticação
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
