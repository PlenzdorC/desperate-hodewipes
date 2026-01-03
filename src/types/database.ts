export interface Database {
  public: {
    Tables: {
      admin_users: {
        Row: {
          id: string
          username: string
          password: string
          created_at: string
          last_login: string | null
        }
        Insert: {
          id?: string
          username: string
          password: string
          created_at?: string
          last_login?: string | null
        }
        Update: {
          id?: string
          username?: string
          password?: string
          created_at?: string
          last_login?: string | null
        }
      }
      members: {
        Row: {
          id: string
          name: string
          class: string
          specialization: string
          role: string
          item_level: number | null
          raiderio_score: number | null
          status: string
          is_officer: boolean
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          class: string
          specialization: string
          role: string
          item_level?: number | null
          raiderio_score?: number | null
          status?: string
          is_officer?: boolean
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          class?: string
          specialization?: string
          role?: string
          item_level?: number | null
          raiderio_score?: number | null
          status?: string
          is_officer?: boolean
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      applications: {
        Row: {
          id: string
          character_name: string
          character_class: string
          specialization: string
          item_level: number
          raiderio_score: number | null
          experience: string
          motivation: string
          availability: string
          discord_name: string
          status: string
          notes: string | null
          created_at: string
          reviewed_at: string | null
          reviewed_by: string | null
        }
        Insert: {
          id?: string
          character_name: string
          character_class: string
          specialization: string
          item_level: number
          raiderio_score?: number | null
          experience: string
          motivation: string
          availability: string
          discord_name: string
          status?: string
          notes?: string | null
          created_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
        }
        Update: {
          id?: string
          character_name?: string
          character_class?: string
          specialization?: string
          item_level?: number
          raiderio_score?: number | null
          experience?: string
          motivation?: string
          availability?: string
          discord_name?: string
          status?: string
          notes?: string | null
          created_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
        }
      }
      raids: {
        Row: {
          id: string
          name: string
          difficulty: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          difficulty: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          difficulty?: string
          created_at?: string
        }
      }
      bosses: {
        Row: {
          id: string
          raid_id: string
          name: string
          position: number
          status: string
          kill_date: string | null
          progress_percentage: number
          difficulty: string
        }
        Insert: {
          id?: string
          raid_id: string
          name: string
          position: number
          status?: string
          kill_date?: string | null
          progress_percentage?: number
          difficulty: string
        }
        Update: {
          id?: string
          raid_id?: string
          name?: string
          position?: number
          status?: string
          kill_date?: string | null
          progress_percentage?: number
          difficulty?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          description: string | null
          event_type: string
          event_date: string
          event_time: string
          max_attendees: number | null
          current_attendees: number
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          event_type: string
          event_date: string
          event_time: string
          max_attendees?: number | null
          current_attendees?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          event_type?: string
          event_date?: string
          event_time?: string
          max_attendees?: number | null
          current_attendees?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      gallery: {
        Row: {
          id: string
          title: string
          description: string | null
          image_url: string
          category: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          image_url: string
          category: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          image_url?: string
          category?: string
          created_at?: string
        }
      }
      guild_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: string | null
          updated_at?: string
        }
      }
      activity_log: {
        Row: {
          id: string
          action: string
          description: string
          user: string | null
          created_at: string
        }
        Insert: {
          id?: string
          action: string
          description: string
          user?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          action?: string
          description?: string
          user?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
