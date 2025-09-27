// Re-export the supabase client from the auto-generated integration
export { supabase } from '@/integrations/supabase/client'
export type { Database } from '@/integrations/supabase/types'

// Define basic types for the application
export interface Profile {
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

export interface Request {
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

export interface RequestCategory {
  id: string
  name: string
  description?: string
  type: 'viatura' | 'alimentacao' | 'material' | 'outro'
  is_active: boolean
  requires_approval: boolean
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  request_id?: string
  title: string
  message: string
  type: string
  is_read: boolean
  created_at: string
}

export interface RequestHistory {
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