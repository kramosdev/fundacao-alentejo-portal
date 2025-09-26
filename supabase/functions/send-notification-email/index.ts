import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// This function would integrate with your email service (SendGrid, Resend, etc.)
// For now, it's a placeholder that logs the email that would be sent

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

    const { to_email, subject, html_content, request_id } = await req.json()

    // Here you would integrate with your email service
    // Example with Resend:
    /*
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'))
    
    const { data, error } = await resend.emails.send({
      from: 'noreply@fundacao-alentejo.pt',
      to: to_email,
      subject: subject,
      html: html_content,
    })
    */

    // For demonstration, we'll just log the email details
    console.log('Email would be sent:', {
      to: to_email,
      subject: subject,
      request_id: request_id,
      timestamp: new Date().toISOString()
    })

    // Create email log entry
    const { error: logError } = await supabase
      .from('email_logs')
      .insert({
        to_email,
        subject,
        request_id,
        status: 'sent', // or 'failed' based on actual email service response
        sent_at: new Date().toISOString()
      })

    if (logError) {
      console.error('Failed to log email:', logError)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email notification processed',
        // In production, return the actual email service response
        email_id: `demo-${Date.now()}`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Email notification error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Email templates
export function getEmailTemplate(type: string, data: any): string {
  const baseTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; }
        .header { background: #213654; color: white; padding: 20px; border-radius: 8px 8px 0 0; margin: -30px -30px 20px -30px; }
        .status { padding: 10px; border-radius: 4px; margin: 15px 0; }
        .status.approved { background: #d4edda; color: #155724; }
        .status.rejected { background: #f8d7da; color: #721c24; }
        .status.pending { background: #d1ecf1; color: #0c5460; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Portal da Fundação Alentejo</h1>
        </div>
        ${getTemplateContent(type, data)}
        <div class="footer">
          <p>Esta é uma mensagem automática do Portal da Fundação Alentejo.</p>
          <p>Para mais informações, aceda ao portal em <a href="https://portal.fundacao-alentejo.pt">portal.fundacao-alentejo.pt</a></p>
        </div>
      </div>
    </body>
    </html>
  `
  return baseTemplate
}

function getTemplateContent(type: string, data: any): string {
  switch (type) {
    case 'request_created':
      return `
        <h2>Requisição Submetida com Sucesso</h2>
        <p>Caro(a) ${data.user_name},</p>
        <p>A sua requisição foi submetida com sucesso e está agora em processamento.</p>
        <div class="status pending">
          <strong>Estado:</strong> Submetido
        </div>
        <h3>Detalhes da Requisição:</h3>
        <ul>
          <li><strong>Título:</strong> ${data.title}</li>
          <li><strong>Tipo:</strong> ${data.type}</li>
          <li><strong>Data de submissão:</strong> ${data.created_at}</li>
        </ul>
        <p>Receberá uma notificação assim que houver atualizações sobre o estado da sua requisição.</p>
      `
    
    case 'request_approved':
      return `
        <h2>Requisição Aprovada</h2>
        <p>Caro(a) ${data.user_name},</p>
        <p>Temos o prazer de informar que a sua requisição foi aprovada.</p>
        <div class="status approved">
          <strong>Estado:</strong> Aprovado
        </div>
        <h3>Detalhes da Requisição:</h3>
        <ul>
          <li><strong>Título:</strong> ${data.title}</li>
          <li><strong>Aprovado por:</strong> ${data.approved_by}</li>
          <li><strong>Data de aprovação:</strong> ${data.approved_at}</li>
        </ul>
        ${data.notes ? `<p><strong>Observações:</strong> ${data.notes}</p>` : ''}
      `
    
    case 'request_rejected':
      return `
        <h2>Requisição Rejeitada</h2>
        <p>Caro(a) ${data.user_name},</p>
        <p>Lamentamos informar que a sua requisição foi rejeitada.</p>
        <div class="status rejected">
          <strong>Estado:</strong> Rejeitado
        </div>
        <h3>Detalhes da Requisição:</h3>
        <ul>
          <li><strong>Título:</strong> ${data.title}</li>
          <li><strong>Rejeitado por:</strong> ${data.rejected_by}</li>
          <li><strong>Data de rejeição:</strong> ${data.rejected_at}</li>
        </ul>
        ${data.reason ? `<p><strong>Motivo:</strong> ${data.reason}</p>` : ''}
        <p>Pode submeter uma nova requisição a qualquer momento através do portal.</p>
      `
    
    default:
      return `
        <h2>Atualização da Requisição</h2>
        <p>A sua requisição "${data.title}" foi atualizada.</p>
        <p>Aceda ao portal para ver os detalhes completos.</p>
      `
  }
}