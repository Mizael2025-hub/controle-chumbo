export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      alocacoes_consumo: {
        Row: {
          apontamento_id: string
          barras_baixadas: number
          created_at: string | null
          created_by: string | null
          id: string
          kg_por_barra_snapshot: number
          monte_id: string
          peso_baixado_kg: number
          updated_at: string | null
        }
        Insert: {
          apontamento_id: string
          barras_baixadas: number
          created_at?: string | null
          created_by?: string | null
          id?: string
          kg_por_barra_snapshot: number
          monte_id: string
          peso_baixado_kg: number
          updated_at?: string | null
        }
        Update: {
          apontamento_id?: string
          barras_baixadas?: number
          created_at?: string | null
          created_by?: string | null
          id?: string
          kg_por_barra_snapshot?: number
          monte_id?: string
          peso_baixado_kg?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alocacoes_consumo_apontamento_id_fkey"
            columns: ["apontamento_id"]
            isOneToOne: false
            referencedRelation: "apontamentos_consumo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alocacoes_consumo_monte_id_fkey"
            columns: ["monte_id"]
            isOneToOne: false
            referencedRelation: "montes"
            referencedColumns: ["id"]
          },
        ]
      }
      apontamentos_consumo: {
        Row: {
          barras: number
          borra_kg: number
          borra_pct: number
          created_at: string | null
          created_by: string | null
          data_consumo: string
          id: string
          liga_id: string
          lote_id: string | null
          lote_produto: string | null
          maquina_id: string | null
          modelo_produto_id: string | null
          modo_selecao_montes: string
          nome_maquina: string
          nome_modelo_produto: string
          nome_operador: string
          nome_setor: string
          nome_turno: string
          numero_lote_snapshot: string
          observacoes: string | null
          operador_id: string | null
          peso_kg: number
          setor_id: string
          turno_id: string | null
          updated_at: string | null
        }
        Insert: {
          barras: number
          borra_kg?: number
          borra_pct?: number
          created_at?: string | null
          created_by?: string | null
          data_consumo: string
          id?: string
          liga_id: string
          lote_id?: string | null
          lote_produto?: string | null
          maquina_id?: string | null
          modelo_produto_id?: string | null
          modo_selecao_montes?: string
          nome_maquina?: string
          nome_modelo_produto?: string
          nome_operador?: string
          nome_setor?: string
          nome_turno?: string
          numero_lote_snapshot?: string
          observacoes?: string | null
          operador_id?: string | null
          peso_kg: number
          setor_id: string
          turno_id?: string | null
          updated_at?: string | null
        }
        Update: {
          barras?: number
          borra_kg?: number
          borra_pct?: number
          created_at?: string | null
          created_by?: string | null
          data_consumo?: string
          id?: string
          liga_id?: string
          lote_id?: string | null
          lote_produto?: string | null
          maquina_id?: string | null
          modelo_produto_id?: string | null
          modo_selecao_montes?: string
          nome_maquina?: string
          nome_modelo_produto?: string
          nome_operador?: string
          nome_setor?: string
          nome_turno?: string
          numero_lote_snapshot?: string
          observacoes?: string | null
          operador_id?: string | null
          peso_kg?: number
          setor_id?: string
          turno_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "apontamentos_consumo_liga_id_fkey"
            columns: ["liga_id"]
            isOneToOne: false
            referencedRelation: "ligas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apontamentos_consumo_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "lotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apontamentos_consumo_maquina_id_fkey"
            columns: ["maquina_id"]
            isOneToOne: false
            referencedRelation: "maquinas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apontamentos_consumo_modelo_produto_id_fkey"
            columns: ["modelo_produto_id"]
            isOneToOne: false
            referencedRelation: "modelos_produto"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apontamentos_consumo_operador_id_fkey"
            columns: ["operador_id"]
            isOneToOne: false
            referencedRelation: "operadores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apontamentos_consumo_setor_id_fkey"
            columns: ["setor_id"]
            isOneToOne: false
            referencedRelation: "setores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apontamentos_consumo_turno_id_fkey"
            columns: ["turno_id"]
            isOneToOne: false
            referencedRelation: "turnos"
            referencedColumns: ["id"]
          },
        ]
      }
      destinos_saida: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean
          nome: string
          slug: string
          sort_order: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean
          nome: string
          slug: string
          sort_order?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean
          nome?: string
          slug?: string
          sort_order?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      eventos_monte: {
        Row: {
          created_at: string | null
          created_by: string | null
          data_evento: string
          destinatario: string
          id: string
          monte_id: string
          tipo: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          data_evento: string
          destinatario: string
          id?: string
          monte_id: string
          tipo: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          data_evento?: string
          destinatario?: string
          id?: string
          monte_id?: string
          tipo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "eventos_monte_monte_id_fkey"
            columns: ["monte_id"]
            isOneToOne: false
            referencedRelation: "montes"
            referencedColumns: ["id"]
          },
        ]
      }
      ligas: {
        Row: {
          chave_cor: string
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean
          nome: string
          updated_at: string | null
        }
        Insert: {
          chave_cor?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean
          nome: string
          updated_at?: string | null
        }
        Update: {
          chave_cor?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean
          nome?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      lotes: {
        Row: {
          barras_iniciais: number
          colunas_grade: number
          created_at: string | null
          created_by: string | null
          data_chegada: string
          id: string
          liga_id: string
          linhas_grade: number
          numero_lote: string
          peso_inicial_kg: number
          updated_at: string | null
        }
        Insert: {
          barras_iniciais: number
          colunas_grade?: number
          created_at?: string | null
          created_by?: string | null
          data_chegada: string
          id?: string
          liga_id: string
          linhas_grade?: number
          numero_lote: string
          peso_inicial_kg: number
          updated_at?: string | null
        }
        Update: {
          barras_iniciais?: number
          colunas_grade?: number
          created_at?: string | null
          created_by?: string | null
          data_chegada?: string
          id?: string
          liga_id?: string
          linhas_grade?: number
          numero_lote?: string
          peso_inicial_kg?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lotes_liga_id_fkey"
            columns: ["liga_id"]
            isOneToOne: false
            referencedRelation: "ligas"
            referencedColumns: ["id"]
          },
        ]
      }
      maquinas: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean
          nome: string
          setor_id: string
          sort_order: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean
          nome: string
          setor_id: string
          sort_order?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean
          nome?: string
          setor_id?: string
          sort_order?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maquinas_setor_id_fkey"
            columns: ["setor_id"]
            isOneToOne: false
            referencedRelation: "setores"
            referencedColumns: ["id"]
          },
        ]
      }
      modelos_produto: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean
          nome: string
          placas_por_grade: number
          polaridade: string
          sort_order: number
          tipo_produto: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean
          nome: string
          placas_por_grade?: number
          polaridade: string
          sort_order?: number
          tipo_produto?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean
          nome?: string
          placas_por_grade?: number
          polaridade?: string
          sort_order?: number
          tipo_produto?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      montes: {
        Row: {
          barras_atuais: number
          created_at: string | null
          created_by: string | null
          grupo_reserva_id: string | null
          id: string
          localizacao: string
          lote_id: string
          monte_origem_id: string | null
          movido_setor_em: string | null
          peso_atual_kg: number
          posicao_x: number
          posicao_y: number
          reservado_em: string | null
          reservado_para: string | null
          setor_id: string | null
          setor_reserva_id: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          barras_atuais: number
          created_at?: string | null
          created_by?: string | null
          grupo_reserva_id?: string | null
          id?: string
          localizacao?: string
          lote_id: string
          monte_origem_id?: string | null
          movido_setor_em?: string | null
          peso_atual_kg: number
          posicao_x: number
          posicao_y: number
          reservado_em?: string | null
          reservado_para?: string | null
          setor_id?: string | null
          setor_reserva_id?: string | null
          status: string
          updated_at?: string | null
        }
        Update: {
          barras_atuais?: number
          created_at?: string | null
          created_by?: string | null
          grupo_reserva_id?: string | null
          id?: string
          localizacao?: string
          lote_id?: string
          monte_origem_id?: string | null
          movido_setor_em?: string | null
          peso_atual_kg?: number
          posicao_x?: number
          posicao_y?: number
          reservado_em?: string | null
          reservado_para?: string | null
          setor_id?: string | null
          setor_reserva_id?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "montes_lote_id_fkey"
            columns: ["lote_id"]
            isOneToOne: false
            referencedRelation: "lotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "montes_monte_origem_id_fkey"
            columns: ["monte_origem_id"]
            isOneToOne: false
            referencedRelation: "montes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "montes_setor_id_fkey"
            columns: ["setor_id"]
            isOneToOne: false
            referencedRelation: "setores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "montes_setor_reserva_id_fkey"
            columns: ["setor_reserva_id"]
            isOneToOne: false
            referencedRelation: "setores"
            referencedColumns: ["id"]
          },
        ]
      }
      operadores: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean
          nome: string
          sort_order: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean
          nome: string
          sort_order?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean
          nome?: string
          sort_order?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      setores: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean
          nome: string
          slug: string
          sort_order: number
          tipo: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean
          nome: string
          slug: string
          sort_order?: number
          tipo?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean
          nome?: string
          slug?: string
          sort_order?: number
          tipo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      transacoes_saida: {
        Row: {
          barras_baixadas: number
          created_at: string | null
          created_by: string | null
          data_transacao: string
          destino_saida_id: string
          estornada: boolean
          estornada_em: string | null
          estornada_por: string | null
          grupo_liberacao_id: string | null
          id: string
          monte_id: string
          observacao: string | null
          peso_baixado_kg: number
          setor_id: string | null
          updated_at: string | null
        }
        Insert: {
          barras_baixadas: number
          created_at?: string | null
          created_by?: string | null
          data_transacao: string
          destino_saida_id: string
          estornada?: boolean
          estornada_em?: string | null
          estornada_por?: string | null
          grupo_liberacao_id?: string | null
          id?: string
          monte_id: string
          observacao?: string | null
          peso_baixado_kg: number
          setor_id?: string | null
          updated_at?: string | null
        }
        Update: {
          barras_baixadas?: number
          created_at?: string | null
          created_by?: string | null
          data_transacao?: string
          destino_saida_id?: string
          estornada?: boolean
          estornada_em?: string | null
          estornada_por?: string | null
          grupo_liberacao_id?: string | null
          id?: string
          monte_id?: string
          observacao?: string | null
          peso_baixado_kg?: number
          setor_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transacoes_saida_destino_saida_id_fkey"
            columns: ["destino_saida_id"]
            isOneToOne: false
            referencedRelation: "destinos_saida"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacoes_saida_monte_id_fkey"
            columns: ["monte_id"]
            isOneToOne: false
            referencedRelation: "montes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacoes_saida_setor_id_fkey"
            columns: ["setor_id"]
            isOneToOne: false
            referencedRelation: "setores"
            referencedColumns: ["id"]
          },
        ]
      }
      turnos: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean
          nome: string
          sort_order: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean
          nome: string
          sort_order?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean
          nome?: string
          sort_order?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_active: boolean
          nome: string
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean
          nome: string
          role?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean
          nome?: string
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
