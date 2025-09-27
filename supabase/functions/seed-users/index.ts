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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    console.log('Starting user seeding process...')

    // Test users data
    const testUsers = [
      {
        email: 'colaborador@fundacao.pt',
        password: 'fundacao123',
        full_name: 'Maria Silva',
        role: 'colaborador',
        department: 'Recursos Humanos',
        phone: '+351 913 456 789'
      },
      {
        email: 'dgiea@fundacao.pt',
        password: 'fundacao123',
        full_name: 'João Santos',
        role: 'DGIEA',
        department: 'DGIEA',
        phone: '+351 913 456 790'
      },
      {
        email: 'direcao@fundacao.pt',
        password: 'fundacao123',
        full_name: 'Ana Costa',
        role: 'direcao',
        department: 'Direção',
        phone: '+351 913 456 791'
      }
    ]

    console.log('Creating test users...')
    const createdUsers = []

    for (const userData of testUsers) {
      console.log(`Creating user: ${userData.email}`)
      
      // Check if user already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', userData.email)
        .single()

      if (existingProfile) {
        console.log(`User ${userData.email} already exists, skipping...`)
        continue
      }

      // Create user
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          full_name: userData.full_name
        }
      })

      if (authError) {
        console.error(`Failed to create auth user ${userData.email}:`, authError)
        continue
      }

      if (!authUser.user) {
        console.error(`No user returned for ${userData.email}`)
        continue
      }

      console.log(`Auth user created: ${authUser.user.id}`)

      // Update the profile with additional data
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          role: userData.role,
          department: userData.department,
          phone: userData.phone
        })
        .eq('user_id', authUser.user.id)

      if (profileError) {
        console.error(`Failed to update profile for ${userData.email}:`, profileError)
      } else {
        console.log(`Profile updated for: ${userData.email}`)
        createdUsers.push({
          email: userData.email,
          role: userData.role,
          id: authUser.user.id
        })
      }
    }

    // Create some sample requests for demonstration
    console.log('Creating sample requests...')
    
    // Get the colaborador user
    const colaboradorUser = createdUsers.find(u => u.role === 'colaborador')
    if (colaboradorUser) {
      // Get a category to use
      const { data: category } = await supabase
        .from('request_categories')
        .select('id')
        .eq('type', 'material')
        .single()

      if (category) {
        const sampleRequests = [
          {
            user_id: colaboradorUser.id,
            category_id: category.id,
            title: 'Requisição de Material de Escritório',
            description: 'Necessito de material de escritório básico: canetas, papel A4, agrafes e clips.',
            type: 'material',
            priority: 'media',
            status: 'submetido'
          },
          {
            user_id: colaboradorUser.id,
            category_id: category.id,
            title: 'Equipamento Informático',
            description: 'Solicitação de um novo monitor para melhorar a produtividade no trabalho.',
            type: 'material',
            priority: 'alta',
            status: 'em_analise_dgiea'
          }
        ]

        for (const request of sampleRequests) {
          const { error: requestError } = await supabase
            .from('requests')
            .insert(request)

          if (requestError) {
            console.error('Failed to create sample request:', requestError)
          } else {
            console.log('Sample request created:', request.title)
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Created ${createdUsers.length} test users successfully`,
        users: createdUsers.map(u => ({ email: u.email, role: u.role }))
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Error in seed-users function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})