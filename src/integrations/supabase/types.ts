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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      articles: {
        Row: {
          author: string
          content: string
          created_at: string
          excerpt: string | null
          featured_image_url: string | null
          gallery_images: string[] | null
          id: string
          is_featured: boolean | null
          published_at: string | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author?: string
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          gallery_images?: string[] | null
          id?: string
          is_featured?: boolean | null
          published_at?: string | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author?: string
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          gallery_images?: string[] | null
          id?: string
          is_featured?: boolean | null
          published_at?: string | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      bishop: {
        Row: {
          appointment_date: string | null
          bio: string | null
          created_at: string | null
          email: string | null
          episcopal_ordination_date: string | null
          id: string
          motto: string | null
          name: string
          ordination_date: string | null
          pastoral_letter: string | null
          phone: string | null
          photo_url: string | null
          slug: string
          title: string
          updated_at: string | null
        }
        Insert: {
          appointment_date?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          episcopal_ordination_date?: string | null
          id?: string
          motto?: string | null
          name: string
          ordination_date?: string | null
          pastoral_letter?: string | null
          phone?: string | null
          photo_url?: string | null
          slug: string
          title?: string
          updated_at?: string | null
        }
        Update: {
          appointment_date?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          episcopal_ordination_date?: string | null
          id?: string
          motto?: string | null
          name?: string
          ordination_date?: string | null
          pastoral_letter?: string | null
          phone?: string | null
          photo_url?: string | null
          slug?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      clergy: {
        Row: {
          bio: string | null
          created_at: string
          email: string | null
          government_order: number | null
          id: string
          is_government: boolean | null
          motto: string | null
          name: string
          ordination_date: string | null
          parish_id: string | null
          phone: string | null
          photo_url: string | null
          position: string
          provisioned_since: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          email?: string | null
          government_order?: number | null
          id?: string
          is_government?: boolean | null
          motto?: string | null
          name: string
          ordination_date?: string | null
          parish_id?: string | null
          phone?: string | null
          photo_url?: string | null
          position: string
          provisioned_since?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          email?: string | null
          government_order?: number | null
          id?: string
          is_government?: boolean | null
          motto?: string | null
          name?: string
          ordination_date?: string | null
          parish_id?: string | null
          phone?: string | null
          photo_url?: string | null
          position?: string
          provisioned_since?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_clergy_parish"
            columns: ["parish_id"]
            isOneToOne: false
            referencedRelation: "parishes"
            referencedColumns: ["id"]
          },
        ]
      }
      cloudinary_settings: {
        Row: {
          api_key: string
          api_secret: string
          cloud_name: string
          created_at: string | null
          folder_structure: string
          id: string
          updated_at: string | null
          upload_preset: string
        }
        Insert: {
          api_key: string
          api_secret: string
          cloud_name: string
          created_at?: string | null
          folder_structure?: string
          id?: string
          updated_at?: string | null
          upload_preset?: string
        }
        Update: {
          api_key?: string
          api_secret?: string
          cloud_name?: string
          created_at?: string | null
          folder_structure?: string
          id?: string
          updated_at?: string | null
          upload_preset?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          description: string
          end_date: string | null
          event_date: string
          featured_image_url: string | null
          id: string
          is_featured: boolean | null
          location: string
          slug: string
          status: Database["public"]["Enums"]["event_status"] | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          end_date?: string | null
          event_date: string
          featured_image_url?: string | null
          id?: string
          is_featured?: boolean | null
          location: string
          slug: string
          status?: Database["public"]["Enums"]["event_status"] | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          end_date?: string | null
          event_date?: string
          featured_image_url?: string | null
          id?: string
          is_featured?: boolean | null
          location?: string
          slug?: string
          status?: Database["public"]["Enums"]["event_status"] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      journals: {
        Row: {
          cover_image_url: string | null
          created_at: string
          description: string | null
          edition_number: number | null
          id: string
          pdf_url: string
          publication_date: string
          title: string
          updated_at: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          edition_number?: number | null
          id?: string
          pdf_url: string
          publication_date: string
          title: string
          updated_at?: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          edition_number?: number | null
          id?: string
          pdf_url?: string
          publication_date?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      parishes: {
        Row: {
          address: string
          created_at: string
          creation_date: string | null
          description: string | null
          email: string | null
          id: string
          image_url: string | null
          mass_schedule: string | null
          name: string
          parish_priest_id: string | null
          phone: string | null
          service_hours: string | null
          slug: string
          updated_at: string
          website: string | null
        }
        Insert: {
          address: string
          created_at?: string
          creation_date?: string | null
          description?: string | null
          email?: string | null
          id?: string
          image_url?: string | null
          mass_schedule?: string | null
          name: string
          parish_priest_id?: string | null
          phone?: string | null
          service_hours?: string | null
          slug: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string
          created_at?: string
          creation_date?: string | null
          description?: string | null
          email?: string | null
          id?: string
          image_url?: string | null
          mass_schedule?: string | null
          name?: string
          parish_priest_id?: string | null
          phone?: string | null
          service_hours?: string | null
          slug?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_parish_priest"
            columns: ["parish_priest_id"]
            isOneToOne: false
            referencedRelation: "clergy"
            referencedColumns: ["id"]
          },
        ]
      }
      pastor_messages: {
        Row: {
          content: string | null
          content_type: Database["public"]["Enums"]["content_type"] | null
          created_at: string
          id: string
          is_featured: boolean | null
          media_url: string | null
          published_at: string | null
          slug: string
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          content_type?: Database["public"]["Enums"]["content_type"] | null
          created_at?: string
          id?: string
          is_featured?: boolean | null
          media_url?: string | null
          published_at?: string | null
          slug: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          content_type?: Database["public"]["Enums"]["content_type"] | null
          created_at?: string
          id?: string
          is_featured?: boolean | null
          media_url?: string | null
          published_at?: string | null
          slug?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      photos: {
        Row: {
          album_name: string | null
          created_at: string
          description: string | null
          event_id: string | null
          id: string
          image_url: string
          photographer: string | null
          taken_date: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          album_name?: string | null
          created_at?: string
          description?: string | null
          event_id?: string | null
          id?: string
          image_url: string
          photographer?: string | null
          taken_date?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          album_name?: string | null
          created_at?: string
          description?: string | null
          event_id?: string | null
          id?: string
          image_url?: string
          photographer?: string | null
          taken_date?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_photo_event"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          created_at: string
          email_contact: string | null
          facebook_url: string | null
          faithful_count: string | null
          id: string
          instagram_url: string | null
          logo_url: string | null
          meta_description: string | null
          parishes_count: number | null
          priests_count: number | null
          site_name: string
          site_title: string
          updated_at: string
          years_count: number | null
          youtube_url: string | null
        }
        Insert: {
          created_at?: string
          email_contact?: string | null
          facebook_url?: string | null
          faithful_count?: string | null
          id?: string
          instagram_url?: string | null
          logo_url?: string | null
          meta_description?: string | null
          parishes_count?: number | null
          priests_count?: number | null
          site_name?: string
          site_title?: string
          updated_at?: string
          years_count?: number | null
          youtube_url?: string | null
        }
        Update: {
          created_at?: string
          email_contact?: string | null
          facebook_url?: string | null
          faithful_count?: string | null
          id?: string
          instagram_url?: string | null
          logo_url?: string | null
          meta_description?: string | null
          parishes_count?: number | null
          priests_count?: number | null
          site_name?: string
          site_title?: string
          updated_at?: string
          years_count?: number | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      timeline_events: {
        Row: {
          created_at: string
          description: string
          event_date: string
          id: string
          image_url: string | null
          is_active: boolean | null
          order_position: number | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          event_date: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          order_position?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          event_date?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          order_position?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      content_type: "texto" | "video" | "audio"
      event_status: "confirmado" | "cancelado" | "adiado"
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
      content_type: ["texto", "video", "audio"],
      event_status: ["confirmado", "cancelado", "adiado"],
    },
  },
} as const
