// Generado automáticamente desde el esquema real de Supabase
// (Supabase:generate_typescript_types, project nbhaacqjqhpofuvfztkz).
// NO editar a mano. Regenerar cuando cambie el esquema (tras cada
// migración) para que TypeScript detecte en compilación cualquier
// referencia a una tabla/columna que no exista de verdad.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      event_submission_log: {
        Row: {
          created_at: string
          email: string
          id: string
          ip: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          ip: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          ip?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          budget_max: number | null
          budget_min: number | null
          category: Database["public"]["Enums"]["artist_category"] | null
          city: string | null
          created_at: string
          date: string
          description: string | null
          id: string
          image_url: string | null
          is_published: boolean
          location: string
          organizer_email: string | null
          organizer_id: string | null
          title: string
          updated_at: string
          verification_expires_at: string | null
          verification_token_hash: string | null
        }
        Insert: {
          budget_max?: number | null
          budget_min?: number | null
          category?: Database["public"]["Enums"]["artist_category"] | null
          city?: string | null
          created_at?: string
          date: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          location: string
          organizer_email?: string | null
          organizer_id?: string | null
          title: string
          updated_at?: string
          verification_expires_at?: string | null
          verification_token_hash?: string | null
        }
        Update: {
          budget_max?: number | null
          budget_min?: number | null
          category?: Database["public"]["Enums"]["artist_category"] | null
          city?: string | null
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          location?: string
          organizer_email?: string | null
          organizer_id?: string | null
          title?: string
          updated_at?: string
          verification_expires_at?: string | null
          verification_token_hash?: string | null
        }
        Relationships: []
      }
      favorites: {
        Row: {
          artist_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          artist_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          artist_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      media: {
        Row: {
          created_at: string
          duration_seconds: number | null
          id: string
          position: number
          storage_path: string | null
          type: Database["public"]["Enums"]["media_type"]
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          id?: string
          position?: number
          storage_path?: string | null
          type: Database["public"]["Enums"]["media_type"]
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          id?: string
          position?: number
          storage_path?: string | null
          type?: Database["public"]["Enums"]["media_type"]
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          body: string
          created_at: string
          id: string
          is_read: boolean
          recipient_id: string
          sender_email: string | null
          sender_id: string | null
          sender_name: string | null
          subject: string | null
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_read?: boolean
          recipient_id: string
          sender_email?: string | null
          sender_id?: string | null
          sender_name?: string | null
          subject?: string | null
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_read?: boolean
          recipient_id?: string
          sender_email?: string | null
          sender_id?: string | null
          sender_name?: string | null
          subject?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          category: Database["public"]["Enums"]["artist_category"] | null
          city: string | null
          country: string | null
          cover_url: string | null
          created_at: string
          display_name: string
          id: string
          instagram: string | null
          is_published: boolean
          organizer_company: string | null
          organizer_email: string | null
          organizer_name: string | null
          organizer_phone: string | null
          organizer_website: string | null
          plan: Database["public"]["Enums"]["artist_plan"]
          price_from: number | null
          price_note: string | null
          rating: number | null
          requirements: string | null
          reviews_count: number
          slug: string | null
          spotify: string | null
          updated_at: string
          website: string | null
          youtube: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          category?: Database["public"]["Enums"]["artist_category"] | null
          city?: string | null
          country?: string | null
          cover_url?: string | null
          created_at?: string
          display_name: string
          id: string
          instagram?: string | null
          is_published?: boolean
          organizer_company?: string | null
          organizer_email?: string | null
          organizer_name?: string | null
          organizer_phone?: string | null
          organizer_website?: string | null
          plan?: Database["public"]["Enums"]["artist_plan"]
          price_from?: number | null
          price_note?: string | null
          rating?: number | null
          requirements?: string | null
          reviews_count?: number
          slug?: string | null
          spotify?: string | null
          updated_at?: string
          website?: string | null
          youtube?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          category?: Database["public"]["Enums"]["artist_category"] | null
          city?: string | null
          country?: string | null
          cover_url?: string | null
          created_at?: string
          display_name?: string
          id?: string
          instagram?: string | null
          is_published?: boolean
          organizer_company?: string | null
          organizer_email?: string | null
          organizer_name?: string | null
          organizer_phone?: string | null
          organizer_website?: string | null
          plan?: Database["public"]["Enums"]["artist_plan"]
          price_from?: number | null
          price_note?: string | null
          rating?: number | null
          requirements?: string | null
          reviews_count?: number
          slug?: string | null
          spotify?: string | null
          updated_at?: string
          website?: string | null
          youtube?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at: string | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan: Database["public"]["Enums"]["artist_plan"]
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["artist_plan"]
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["artist_plan"]
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_artist: { Args: { _user_id: string }; Returns: boolean }
      is_organizer: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "artist" | "organizer"
      artist_category:
        | "musica"
        | "teatro"
        | "magia"
        | "comedia"
        | "danza"
        | "dj"
        | "circo"
        | "arte"
        | "foto_video"
      artist_plan: "spark" | "spotlight" | "headliner"
      media_type: "image" | "video"
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
      app_role: ["admin", "artist", "organizer"],
      artist_category: [
        "musica",
        "teatro",
        "magia",
        "comedia",
        "danza",
        "dj",
        "circo",
        "arte",
        "foto_video",
      ],
      artist_plan: ["spark", "spotlight", "headliner"],
      media_type: ["image", "video"],
    },
  },
} as const
