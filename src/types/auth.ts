import { Usuario } from "./supabase";

export interface AuthContextType {
  user: Usuario | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
} 