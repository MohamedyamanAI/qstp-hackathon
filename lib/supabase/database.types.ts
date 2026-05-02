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
      kpi_submissions: {
        Row: {
          created_at: string
          generated_outputs: Json
          id: string
          metrics: Json
          period_end: string
          period_start: string
          publication_id: string | null
          startup_id: string
          status: Database["public"]["Enums"]["submission_status_enum"]
          submitted_at: string | null
          submitted_by: string
          updated_at: string
          verified_fields: Json
        }
        Insert: {
          created_at?: string
          generated_outputs?: Json
          id?: string
          metrics?: Json
          period_end: string
          period_start: string
          publication_id?: string | null
          startup_id: string
          status?: Database["public"]["Enums"]["submission_status_enum"]
          submitted_at?: string | null
          submitted_by: string
          updated_at?: string
          verified_fields?: Json
        }
        Update: {
          created_at?: string
          generated_outputs?: Json
          id?: string
          metrics?: Json
          period_end?: string
          period_start?: string
          publication_id?: string | null
          startup_id?: string
          status?: Database["public"]["Enums"]["submission_status_enum"]
          submitted_at?: string | null
          submitted_by?: string
          updated_at?: string
          verified_fields?: Json
        }
        Relationships: [
          {
            foreignKeyName: "kpi_submissions_publication_id_fkey"
            columns: ["publication_id"]
            isOneToOne: false
            referencedRelation: "report_publications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kpi_submissions_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "startups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kpi_submissions_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          content: Json
          created_at: string
          id: string
          read_at: string | null
          type: string
          user_id: string
        }
        Insert: {
          content: Json
          created_at?: string
          id?: string
          read_at?: string | null
          type: string
          user_id: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          read_at?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunities: {
        Row: {
          category: Database["public"]["Enums"]["opportunity_category_enum"]
          created_at: string
          deadline: string | null
          description: string
          fit_score: number | null
          id: string
          source: string
          startup_id: string | null
          status: Database["public"]["Enums"]["opportunity_status_enum"]
          title: string
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["opportunity_category_enum"]
          created_at?: string
          deadline?: string | null
          description: string
          fit_score?: number | null
          id?: string
          source: string
          startup_id?: string | null
          status?: Database["public"]["Enums"]["opportunity_status_enum"]
          title: string
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["opportunity_category_enum"]
          created_at?: string
          deadline?: string | null
          description?: string
          fit_score?: number | null
          id?: string
          source?: string
          startup_id?: string | null
          status?: Database["public"]["Enums"]["opportunity_status_enum"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "startups"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          language_preference: Database["public"]["Enums"]["language_pref_enum"]
          preferences: Json
          role: Database["public"]["Enums"]["user_role_enum"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
          language_preference?: Database["public"]["Enums"]["language_pref_enum"]
          preferences?: Json
          role?: Database["public"]["Enums"]["user_role_enum"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          language_preference?: Database["public"]["Enums"]["language_pref_enum"]
          preferences?: Json
          role?: Database["public"]["Enums"]["user_role_enum"]
          updated_at?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          last_used_at: string | null
          p256dh: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          last_used_at?: string | null
          p256dh: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          last_used_at?: string | null
          p256dh?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      report_assignments: {
        Row: {
          created_at: string
          id: string
          publication_id: string
          startup_id: string
          status: Database["public"]["Enums"]["submission_status_enum"]
          submission_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          publication_id: string
          startup_id: string
          status?: Database["public"]["Enums"]["submission_status_enum"]
          submission_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          publication_id?: string
          startup_id?: string
          status?: Database["public"]["Enums"]["submission_status_enum"]
          submission_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_assignments_publication_id_fkey"
            columns: ["publication_id"]
            isOneToOne: false
            referencedRelation: "report_publications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_assignments_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "startups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_assignments_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "kpi_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      report_publications: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          due_date: string
          id: string
          period_end: string
          period_start: string
          published_at: string
          questions: Json
          template_id: string | null
          title: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          due_date: string
          id?: string
          period_end: string
          period_start: string
          published_at?: string
          questions: Json
          template_id?: string | null
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string
          id?: string
          period_end?: string
          period_start?: string
          published_at?: string
          questions?: Json
          template_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_publications_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_publications_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "report_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      report_templates: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_default: boolean
          questions: Json
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean
          questions?: Json
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean
          questions?: Json
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_templates_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      startups: {
        Row: {
          cohort: string | null
          connected_integrations: Json
          created_at: string
          extended_profile: Json
          form_config: Json
          founder_id: string
          health_score: number | null
          id: string
          investor_mode_enabled: boolean | null
          investor_mode_password_hash: string | null
          is_software_product: boolean | null
          name: string
          points_balance: number | null
          privacy_settings: Json
          recipients: Json
          sector: string
          stage: Database["public"]["Enums"]["startup_stage_enum"]
          team_size: number | null
          tier: Database["public"]["Enums"]["startup_tier_enum"]
          updated_at: string
        }
        Insert: {
          cohort?: string | null
          connected_integrations?: Json
          created_at?: string
          extended_profile?: Json
          form_config?: Json
          founder_id: string
          health_score?: number | null
          id?: string
          investor_mode_enabled?: boolean | null
          investor_mode_password_hash?: string | null
          is_software_product?: boolean | null
          name: string
          points_balance?: number | null
          privacy_settings?: Json
          recipients?: Json
          sector: string
          stage: Database["public"]["Enums"]["startup_stage_enum"]
          team_size?: number | null
          tier?: Database["public"]["Enums"]["startup_tier_enum"]
          updated_at?: string
        }
        Update: {
          cohort?: string | null
          connected_integrations?: Json
          created_at?: string
          extended_profile?: Json
          form_config?: Json
          founder_id?: string
          health_score?: number | null
          id?: string
          investor_mode_enabled?: boolean | null
          investor_mode_password_hash?: string | null
          is_software_product?: boolean | null
          name?: string
          points_balance?: number | null
          privacy_settings?: Json
          recipients?: Json
          sector?: string
          stage?: Database["public"]["Enums"]["startup_stage_enum"]
          team_size?: number | null
          tier?: Database["public"]["Enums"]["startup_tier_enum"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "startups_founder_id_fkey"
            columns: ["founder_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      submission_feedback: {
        Row: {
          content: string
          created_at: string
          id: string
          reaction: Database["public"]["Enums"]["feedback_reaction_enum"] | null
          submission_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          reaction?:
            | Database["public"]["Enums"]["feedback_reaction_enum"]
            | null
          submission_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          reaction?:
            | Database["public"]["Enums"]["feedback_reaction_enum"]
            | null
          submission_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "submission_feedback_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "kpi_submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submission_feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      team_assignments: {
        Row: {
          assigned_at: string
          id: string
          startup_id: string
          team_member_id: string
        }
        Insert: {
          assigned_at?: string
          id?: string
          startup_id: string
          team_member_id: string
        }
        Update: {
          assigned_at?: string
          id?: string
          startup_id?: string
          team_member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_assignments_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "startups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_assignments_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      templates: {
        Row: {
          content: Json
          created_at: string
          created_by: string | null
          id: string
          name: string
          scope: Database["public"]["Enums"]["template_scope_enum"]
          startup_id: string | null
          type: Database["public"]["Enums"]["distribution_type_enum"]
          updated_at: string
        }
        Insert: {
          content: Json
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          scope?: Database["public"]["Enums"]["template_scope_enum"]
          startup_id?: string | null
          type: Database["public"]["Enums"]["distribution_type_enum"]
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          scope?: Database["public"]["Enums"]["template_scope_enum"]
          startup_id?: string | null
          type?: Database["public"]["Enums"]["distribution_type_enum"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "templates_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "startups"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      distribution_type_enum:
        | "investor_update"
        | "board_deck"
        | "pitch_deck"
        | "grant_report"
        | "internal_post"
        | "linkedin_post"
      feedback_reaction_enum: "kudos" | "flag" | "clarify" | "none"
      language_pref_enum: "en" | "ar"
      opportunity_category_enum:
        | "grant"
        | "competition"
        | "investor"
        | "customer"
        | "talent"
        | "resource"
      opportunity_status_enum: "new" | "saved" | "applied" | "dismissed"
      startup_stage_enum:
        | "idea"
        | "pre_seed"
        | "seed"
        | "series_a"
        | "series_b"
        | "growth"
      startup_tier_enum:
        | "spark"
        | "catalyst"
        | "trailblazer"
        | "pioneer"
        | "legend"
      submission_status_enum: "pending" | "draft" | "in_progress" | "submitted"
      template_scope_enum: "founder" | "team" | "system"
      user_role_enum: "founder" | "team"
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
    Enums: {
      distribution_type_enum: [
        "investor_update",
        "board_deck",
        "pitch_deck",
        "grant_report",
        "internal_post",
        "linkedin_post",
      ],
      feedback_reaction_enum: ["kudos", "flag", "clarify", "none"],
      language_pref_enum: ["en", "ar"],
      opportunity_category_enum: [
        "grant",
        "competition",
        "investor",
        "customer",
        "talent",
        "resource",
      ],
      opportunity_status_enum: ["new", "saved", "applied", "dismissed"],
      startup_stage_enum: [
        "idea",
        "pre_seed",
        "seed",
        "series_a",
        "series_b",
        "growth",
      ],
      startup_tier_enum: [
        "spark",
        "catalyst",
        "trailblazer",
        "pioneer",
        "legend",
      ],
      submission_status_enum: ["pending", "draft", "in_progress", "submitted"],
      template_scope_enum: ["founder", "team", "system"],
      user_role_enum: ["founder", "team"],
    },
  },
} as const
