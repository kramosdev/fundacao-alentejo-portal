import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')!
    supabase.auth.setSession({
      access_token: authHeader.replace('Bearer ', ''),
      refresh_token: '',
    })

    const { request_id, new_status, notes, decision } = await req.json()

    // Get current user and validate permissions
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user profile to check role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!profile) {
      return new Response(
        JSON.stringify({ error: 'User profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get current request
    const { data: currentRequest } = await supabase
      .from('requests')
      .select('*')
      .eq('id', request_id)
      .single()

    if (!currentRequest) {
      return new Response(
        JSON.stringify({ error: 'Request not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate status transition based on user role
    const validTransitions: Record<string, Record<string, string[]>> = {
      'DGIEA': {
        'submetido': ['em_analise_dgiea', 'rejeitado'],
        'em_analise_dgiea': ['enviado_direcao', 'rejeitado']
      },
      'direcao': {
        'enviado_direcao': ['aprovado', 'rejeitado']
      },
      'admin': {
        'submetido': ['em_analise_dgiea', 'enviado_direcao', 'aprovado', 'rejeitado'],
        'em_analise_dgiea': ['enviado_direcao', 'aprovado', 'rejeitado'],
        'enviado_direcao': ['aprovado', 'rejeitado']
      }
    }

    const allowedStatuses = validTransitions[profile.role]?.[currentRequest.status] || []
    
    if (!allowedStatuses.includes(new_status)) {
      return new Response(
        JSON.stringify({ error: 'Invalid status transition for your role' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Prepare update data
    const updateData: any = { status: new_status }

    if (profile.role === 'DGIEA') {
      updateData.dgiea_user_id = user.id
      updateData.dgiea_notes = notes
      updateData.dgiea_processed_at = new Date().toISOString()
    } else if (profile.role === 'direcao') {
      updateData.direction_user_id = user.id
      updateData.direction_decision = decision || notes
      updateData.direction_processed_at = new Date().toISOString()
    }

    // Update request
    const { data: updatedRequest, error: updateError } = await supabase
      .from('requests')
      .update(updateData)
      .eq('id', request_id)
      .select('*')
      .single()

    if (updateError) {
      return new Response(
        JSON.stringify({ error: updateError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create notification for request owner
    const notificationMessage = getNotificationMessage(new_status, profile.role, notes || decision)
    
    await supabase
      .from('notifications')
      .insert({
        user_id: updatedRequest.user_id,
        request_id: request_id,
        title: 'Atualização da Requisição',
        message: notificationMessage,
        type: getNotificationType(new_status)
      })

    // If forwarding to direction, notify direction users
    if (new_status === 'enviado_direcao') {
      const { data: directionUsers } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('role', 'direcao')
        .eq('is_active', true)

      if (directionUsers && directionUsers.length > 0) {
        const directionNotifications = directionUsers.map(dirUser => ({
          user_id: dirUser.user_id,
          request_id: request_id,
          title: 'Requisição para Aprovação',
          message: `Requisição "${updatedRequest.title}" aguarda aprovação da Direção`,
          type: 'info'
        }))

        await supabase
          .from('notifications')
          .insert(directionNotifications)
      }
    }

    return new Response(
      JSON.stringify({ data: updatedRequest }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function getNotificationMessage(status: string, userRole: string, notes?: string): string {
  const messages: Record<string, string> = {
    'em_analise_dgiea': 'A sua requisição está em análise pela DGIEA',
    'enviado_direcao': 'A sua requisição foi validada e enviada para aprovação da Direção',
    'aprovado': 'A sua requisição foi aprovada pela Direção',
    'rejeitado': `A sua requisição foi rejeitada${notes ? `: ${notes}` : ''}`
  }
  
  return messages[status] || 'Estado da requisição atualizado'
}

function getNotificationType(status: string): string {
  switch (status) {
    case 'aprovado': return 'success'
    case 'rejeitado': return 'error'
    case 'enviado_direcao': return 'info'
    default: return 'info'
  }
}