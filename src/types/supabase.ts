export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      arquivos: {
        Row: {
          caminho_storage: string
          criado_em: string | null
          id: string
          nome_arquivo: string
          solicitacao_id: string
          tamanho_bytes: number | null
          tipo_conteudo: Database["public"]["Enums"]["tipo_conteudo"]
          url_publica: string | null
        }
        Insert: {
          caminho_storage: string
          criado_em?: string | null
          id?: string
          nome_arquivo: string
          solicitacao_id: string
          tamanho_bytes?: number | null
          tipo_conteudo: Database["public"]["Enums"]["tipo_conteudo"]
          url_publica?: string | null
        }
        Update: {
          caminho_storage?: string
          criado_em?: string | null
          id?: string
          nome_arquivo?: string
          solicitacao_id?: string
          tamanho_bytes?: number | null
          tipo_conteudo?: Database["public"]["Enums"]["tipo_conteudo"]
          url_publica?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "arquivos_solicitacao_id_fkey"
            columns: ["solicitacao_id"]
            isOneToOne: false
            referencedRelation: "solicitacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "arquivos_solicitacao_id_fkey"
            columns: ["solicitacao_id"]
            isOneToOne: false
            referencedRelation: "vw_solicitacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      comentarios: {
        Row: {
          conteudo: string
          criado_em: string | null
          id: string
          solicitacao_id: string
          tipo: string | null
          usuario_id: string
        }
        Insert: {
          conteudo: string
          criado_em?: string | null
          id?: string
          solicitacao_id: string
          tipo?: string | null
          usuario_id: string
        }
        Update: {
          conteudo?: string
          criado_em?: string | null
          id?: string
          solicitacao_id?: string
          tipo?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comentarios_solicitacao_id_fkey"
            columns: ["solicitacao_id"]
            isOneToOne: false
            referencedRelation: "solicitacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comentarios_solicitacao_id_fkey"
            columns: ["solicitacao_id"]
            isOneToOne: false
            referencedRelation: "vw_solicitacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comentarios_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracoes_usuario: {
        Row: {
          atualizado_em: string | null
          criado_em: string | null
          id: string
          notificacoes_email: boolean | null
          notificacoes_push: boolean | null
          notificacoes_sistema: boolean | null
          privacidade_mostrar_email: boolean | null
          privacidade_mostrar_telefone: boolean | null
          privacidade_perfil_publico: boolean | null
          usuario_id: string
        }
        Insert: {
          atualizado_em?: string | null
          criado_em?: string | null
          id?: string
          notificacoes_email?: boolean | null
          notificacoes_push?: boolean | null
          notificacoes_sistema?: boolean | null
          privacidade_mostrar_email?: boolean | null
          privacidade_mostrar_telefone?: boolean | null
          privacidade_perfil_publico?: boolean | null
          usuario_id: string
        }
        Update: {
          atualizado_em?: string | null
          criado_em?: string | null
          id?: string
          notificacoes_email?: boolean | null
          notificacoes_push?: boolean | null
          notificacoes_sistema?: boolean | null
          privacidade_mostrar_email?: boolean | null
          privacidade_mostrar_telefone?: boolean | null
          privacidade_perfil_publico?: boolean | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "configuracoes_usuario_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: true
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      historico_versoes: {
        Row: {
          acao: string
          comentario: string | null
          criado_em: string | null
          detalhes: Json | null
          id: string
          solicitacao_id: string
          usuario_id: string
        }
        Insert: {
          acao: string
          comentario?: string | null
          criado_em?: string | null
          detalhes?: Json | null
          id?: string
          solicitacao_id: string
          usuario_id: string
        }
        Update: {
          acao?: string
          comentario?: string | null
          criado_em?: string | null
          detalhes?: Json | null
          id?: string
          solicitacao_id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "historico_versoes_solicitacao_id_fkey"
            columns: ["solicitacao_id"]
            isOneToOne: false
            referencedRelation: "solicitacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historico_versoes_solicitacao_id_fkey"
            columns: ["solicitacao_id"]
            isOneToOne: false
            referencedRelation: "vw_solicitacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historico_versoes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      solicitacoes: {
        Row: {
          aprovado_em: string | null
          aprovador_id: string | null
          atualizado_em: string | null
          criado_em: string | null
          data_limite: string | null
          descricao: string | null
          id: string
          rejeitado_em: string | null
          solicitante_id: string
          status: Database["public"]["Enums"]["status_solicitacao"] | null
          titulo: string
        }
        Insert: {
          aprovado_em?: string | null
          aprovador_id?: string | null
          atualizado_em?: string | null
          criado_em?: string | null
          data_limite?: string | null
          descricao?: string | null
          id?: string
          rejeitado_em?: string | null
          solicitante_id: string
          status?: Database["public"]["Enums"]["status_solicitacao"] | null
          titulo: string
        }
        Update: {
          aprovado_em?: string | null
          aprovador_id?: string | null
          atualizado_em?: string | null
          criado_em?: string | null
          data_limite?: string | null
          descricao?: string | null
          id?: string
          rejeitado_em?: string | null
          solicitante_id?: string
          status?: Database["public"]["Enums"]["status_solicitacao"] | null
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "solicitacoes_aprovador_id_fkey"
            columns: ["aprovador_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitacoes_solicitante_id_fkey"
            columns: ["solicitante_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          image: string | null
          name: string | null
          token_identifier: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          image?: string | null
          name?: string | null
          token_identifier: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          image?: string | null
          name?: string | null
          token_identifier?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          ativo: boolean | null
          atualizado_em: string | null
          avatar_url: string | null
          cargo: string | null
          criado_em: string | null
          departamento: string | null
          email: string
          id: string
          nome_completo: string
          perfil: Database["public"]["Enums"]["perfil_usuario"]
          telefone: string | null
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string | null
          avatar_url?: string | null
          cargo?: string | null
          criado_em?: string | null
          departamento?: string | null
          email: string
          id: string
          nome_completo: string
          perfil?: Database["public"]["Enums"]["perfil_usuario"]
          telefone?: string | null
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string | null
          avatar_url?: string | null
          cargo?: string | null
          criado_em?: string | null
          departamento?: string | null
          email?: string
          id?: string
          nome_completo?: string
          perfil?: Database["public"]["Enums"]["perfil_usuario"]
          telefone?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      vw_historico_solicitacoes: {
        Row: {
          acao: string | null
          acao_descricao: string | null
          comentario: string | null
          criado_em: string | null
          detalhes: Json | null
          id: string | null
          solicitacao_id: string | null
          solicitacao_status:
            | Database["public"]["Enums"]["status_solicitacao"]
            | null
          solicitacao_titulo: string | null
          usuario_avatar: string | null
          usuario_email: string | null
          usuario_id: string | null
          usuario_nome: string | null
          usuario_perfil: Database["public"]["Enums"]["perfil_usuario"] | null
        }
        Relationships: [
          {
            foreignKeyName: "historico_versoes_solicitacao_id_fkey"
            columns: ["solicitacao_id"]
            isOneToOne: false
            referencedRelation: "solicitacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historico_versoes_solicitacao_id_fkey"
            columns: ["solicitacao_id"]
            isOneToOne: false
            referencedRelation: "vw_solicitacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historico_versoes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      vw_solicitacoes: {
        Row: {
          aprovado_em: string | null
          aprovador_avatar: string | null
          aprovador_email: string | null
          aprovador_id: string | null
          aprovador_nome: string | null
          arquivos: Json | null
          atualizado_em: string | null
          criado_em: string | null
          data_limite: string | null
          descricao: string | null
          id: string | null
          rejeitado_em: string | null
          solicitante_avatar: string | null
          solicitante_email: string | null
          solicitante_id: string | null
          solicitante_nome: string | null
          status: Database["public"]["Enums"]["status_solicitacao"] | null
          titulo: string | null
        }
        Relationships: [
          {
            foreignKeyName: "solicitacoes_aprovador_id_fkey"
            columns: ["aprovador_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitacoes_solicitante_id_fkey"
            columns: ["solicitante_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      criar_usuario_admin: {
        Args: { email_admin: string; senha_admin: string }
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      perfil_usuario: "admin" | "aprovador" | "solicitante"
      status_solicitacao:
        | "pendente"
        | "aprovado"
        | "rejeitado"
        | "revisao_solicitada"
      tipo_conteudo: "imagem" | "video" | "pdf" | "texto"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      perfil_usuario: ["admin", "aprovador", "solicitante"],
      status_solicitacao: [
        "pendente",
        "aprovado",
        "rejeitado",
        "revisao_solicitada",
      ],
      tipo_conteudo: ["imagem", "video", "pdf", "texto"],
    },
  },
} as const
