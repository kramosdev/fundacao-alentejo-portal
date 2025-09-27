import { createClient } from '@supabase/supabase-js'

// Get Supabase environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate that Supabase is properly configured
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase environment variables are missing. Please ensure your Supabase integration is properly connected via the green Supabase button in the top right of the interface.'
  )
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          role: 'colaborador' | 'DGIEA' | 'direcao' | 'admin'
          department?: string
          phone?: string
          avatar_url?: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role?: 'colaborador' | 'DGIEA' | 'direcao' | 'admin'
          department?: string
          phone?: string
          avatar_url?: string
          is_active?: boolean
        }
        Update: {
          email?: string
          full_name?: string
          role?: 'colaborador' | 'DGIEA' | 'direcao' | 'admin'
          department?: string
          phone?: string
          avatar_url?: string
          is_active?: boolean
        }
      }
      requests: {
        Row: {
          id: string
          user_id: string
          category_id: string
          title: string
          description: string
          type: 'viatura' | 'alimentacao' | 'material' | 'outro'
          status: 'submetido' | 'em_analise_dgiea' | 'enviado_direcao' | 'aprovado' | 'rejeitado'
          priority: 'baixa' | 'media' | 'alta' | 'critica'
          requested_date?: string
          requested_time?: string
          location?: string
          additional_info?: any
          attachments?: string[]
          dgiea_user_id?: string
          dgiea_notes?: string
          dgiea_processed_at?: string
          direction_user_id?: string
          direction_decision?: string
          direction_processed_at?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          category_id: string
          title: string
          description: string
          type: 'viatura' | 'alimentacao' | 'material' | 'outro'
          priority?: 'baixa' | 'media' | 'alta' | 'critica'
          requested_date?: string
          requested_time?: string
          location?: string
          additional_info?: any
          attachments?: string[]
        }
        Update: {
          status?: 'submetido' | 'em_analise_dgiea' | 'enviado_direcao' | 'aprovado' | 'rejeitado'
          dgiea_user_id?: string
          dgiea_notes?: string
          dgiea_processed_at?: string
          direction_user_id?: string
          direction_decision?: string
          direction_processed_at?: string
        }
      }
      request_categories: {
        Row: {
          id: string
          name: string
          description?: string
          type: 'viatura' | 'alimentacao' | 'material' | 'outro'
          is_active: boolean
          requires_approval: boolean
          created_at: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          request_id?: string
          title: string
          message: string
          type: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          user_id: string
          request_id?: string
          title: string
          message: string
          type?: string
          is_read?: boolean
        }
        Update: {
          is_read?: boolean
        }
      }
      request_history: {
        Row: {
          id: string
          request_id: string
          user_id: string
          action: string
          old_status?: string
          new_status?: string
          notes?: string
          metadata?: any
          created_at: string
        }
      }
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Request = Database['public']['Tables']['requests']['Row']
export type RequestCategory = Database['public']['Tables']['request_categories']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']
export type RequestHistory = Database['public']['Tables']['request_history']['Row']