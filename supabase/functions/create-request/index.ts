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
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Set session properly
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      console.error('Auth error:', userError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: requestData } = await req.json()

    // Validate required fields
    if (!requestData.title || !requestData.description || !requestData.category_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user profile to ensure proper foreign key reference
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('user_id, full_name, email')
      .eq('user_id', user.id)
      .single()

    if (!userProfile) {
      return new Response(
        JSON.stringify({ error: 'User profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create the request
    const { data: request, error: requestError } = await supabase
      .from('requests')
      .insert({
        user_id: user.id,
        category_id: requestData.category_id,
        title: requestData.title,
        description: requestData.description,
        type: requestData.type,
        priority: requestData.priority || 'media',
        requested_date: requestData.requested_date,
        requested_time: requestData.requested_time,
        location: requestData.location,
        additional_info: requestData.additional_info || {},
        attachments: requestData.attachments || []
      })
      .select()
      .single()

    if (requestError) {
      return new Response(
        JSON.stringify({ error: requestError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create initial history entry
    await supabase
      .from('request_history')
      .insert({
        request_id: request.id,
        user_id: user.id,
        action: 'created',
        new_status: 'submetido',
        notes: 'Requisição submetida pelo utilizador'
      })

    // Get DGIEA users for notification
    const { data: dgieaUsers } = await supabase
      .from('profiles')
      .select('user_id, full_name, email')
      .eq('role', 'DGIEA')
      .eq('is_active', true)

    // Create notifications for DGIEA users
    if (dgieaUsers && dgieaUsers.length > 0) {
      const notifications = dgieaUsers.map(dgieaUser => ({
        user_id: dgieaUser.user_id,
        request_id: request.id,
        title: 'Nova Requisição',
        message: `Nova requisição "${request.title}" submetida por ${userProfile.full_name || userProfile.email}`,
        type: 'info'
      }))

      await supabase
        .from('notifications')
        .insert(notifications)
    }

    // Send email notification to DGIEA (implement as needed)
    // await sendEmailNotification(dgieaUsers, request)

    return new Response(
      JSON.stringify({ data: request }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})