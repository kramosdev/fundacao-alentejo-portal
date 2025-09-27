import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { Send, Paperclip, Image, Upload, User, Clock, MessageSquare } from "lucide-react"
import { format } from "date-fns"
import { pt } from "date-fns/locale"

interface IncidentComment {
  id: string
  incident_id: string
  user_id: string
  comment: string
  is_internal: boolean
  attachments?: string[]
  created_at: string
  profiles?: {
    full_name: string
    email: string
    role: string
  } | null
}

interface IncidentTicketSystemProps {
  incidentId: string
  incidentTitle: string
  incidentStatus: string
  userRole: string
  onStatusUpdate?: (newStatus: string) => void
}

export function IncidentTicketSystem({ 
  incidentId, 
  incidentTitle, 
  incidentStatus, 
  userRole, 
  onStatusUpdate 
}: IncidentTicketSystemProps) {
  const { user, profile } = useAuth()
  const { toast } = useToast()
  const [comments, setComments] = useState<IncidentComment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  useEffect(() => {
    fetchComments()
    subscribeToComments()
  }, [incidentId])

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('incident_comments')
        .select(`
          id,
          incident_id,
          user_id,
          comment,
          is_internal,
          attachments,
          created_at
        `)
        .eq('incident_id', incidentId)
        .order('created_at', { ascending: true })

      if (error) throw error

      // Fetch user profiles separately for each comment
      const commentsWithProfiles = await Promise.all(
        (data || []).map(async (comment) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email, role')
            .eq('user_id', comment.user_id)
            .single()

          return {
            ...comment,
            profiles: profile
          }
        })
      )

      setComments(commentsWithProfiles)
    } catch (error: any) {
      console.error('Error fetching comments:', error)
    }
  }

  const subscribeToComments = () => {
    const channel = supabase
      .channel(`incident_comments_${incidentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'incident_comments',
          filter: `incident_id=eq.${incidentId}`
        },
        () => {
          fetchComments()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const handleFileUpload = async (files: File[]): Promise<string[]> => {
    if (!user) return []
    
    const uploadPromises = files.map(async (file) => {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${incidentId}/${Date.now()}.${fileExt}`
      
      const { data, error } = await supabase.storage
        .from('incident-attachments')
        .upload(fileName, file)

      if (error) throw error
      return fileName
    })

    return Promise.all(uploadPromises)
  }

  const handleSendComment = async () => {
    if (!newComment.trim() || !user) return

    try {
      setLoading(true)

      let attachments: string[] = []
      if (selectedFiles.length > 0) {
        setUploadingFile(true)
        attachments = await handleFileUpload(selectedFiles)
      }

      const { error } = await supabase
        .from('incident_comments')
        .insert({
          incident_id: incidentId,
          user_id: user.id,
          comment: newComment,
          is_internal: isInternal && (profile?.role === 'DGIEA' || profile?.role === 'admin'),
          attachments: attachments.length > 0 ? attachments : null
        })

      if (error) throw error

      setNewComment('')
      setSelectedFiles([])
      setIsInternal(false)

      toast({
        title: "Comentário enviado",
        description: "O seu comentário foi adicionado ao incidente."
      })

    } catch (error: any) {
      toast({
        title: "Erro ao enviar comentário",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
      setUploadingFile(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('incidents')
        .update({ 
          status: newStatus,
          it_user_id: profile?.role === 'DGIEA' || profile?.role === 'admin' ? user.id : null,
          resolved_at: newStatus === 'resolvido' ? new Date().toISOString() : null
        })
        .eq('id', incidentId)

      if (error) throw error

      // Add status change comment
      await supabase
        .from('incident_comments')
        .insert({
          incident_id: incidentId,
          user_id: user.id,
          comment: `Estado alterado para: ${getStatusLabel(newStatus)}`,
          is_internal: true
        })

      toast({
        title: "Estado atualizado",
        description: `Incidente marcado como ${getStatusLabel(newStatus).toLowerCase()}`
      })

      if (onStatusUpdate) {
        onStatusUpdate(newStatus)
      }

    } catch (error: any) {
      toast({
        title: "Erro ao atualizar estado",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'reportado': 'Reportado',
      'em_analise': 'Em Análise',
      'em_resolucao': 'Em Resolução',
      'resolvido': 'Resolvido',
      'fechado': 'Fechado'
    }
    return labels[status] || status
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'DGIEA': return 'bg-blue-100 text-blue-800'
      case 'direcao': return 'bg-purple-100 text-purple-800'
      default: return 'bg-green-100 text-green-800'
    }
  }

  const canManageIncident = profile?.role === 'DGIEA' || profile?.role === 'admin'

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Sistema de Tickets - {incidentTitle}
            </CardTitle>
            <CardDescription>
              Comunicação entre utilizador, DGIEA e TI
            </CardDescription>
          </div>
          
          {canManageIncident && (
            <div className="flex gap-2">
              {incidentStatus === 'reportado' && (
                <Button
                  size="sm"
                  onClick={() => handleStatusChange('em_analise')}
                >
                  Aceitar para Análise
                </Button>
              )}
              {incidentStatus === 'em_analise' && (
                <Button
                  size="sm"
                  onClick={() => handleStatusChange('em_resolucao')}
                >
                  Iniciar Resolução
                </Button>
              )}
              {incidentStatus === 'em_resolucao' && (
                <Button
                  size="sm"
                  onClick={() => handleStatusChange('resolvido')}
                >
                  Marcar como Resolvido
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Comments List */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum comentário ainda. Inicie a conversa!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className={`p-4 rounded-lg border-l-4 ${
                  comment.is_internal 
                    ? 'bg-yellow-50 border-l-yellow-400' 
                    : 'bg-blue-50 border-l-blue-400'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="font-medium">{comment.profiles?.full_name}</span>
                    <Badge className={getRoleColor(comment.profiles?.role || 'colaborador')}>
                      {comment.profiles?.role || 'colaborador'}
                    </Badge>
                    {comment.is_internal && (
                      <Badge variant="outline">Interno</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {format(new Date(comment.created_at), 'dd/MM/yyyy HH:mm', { locale: pt })}
                  </div>
                </div>
                
                <p className="text-sm whitespace-pre-wrap">{comment.comment}</p>
                
                {comment.attachments && comment.attachments.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {comment.attachments.map((attachment, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => {
                          // Download attachment
                          const { data } = supabase.storage
                            .from('incident-attachments')
                            .getPublicUrl(attachment)
                          if (data?.publicUrl) {
                            window.open(data.publicUrl, '_blank')
                          }
                        }}
                      >
                        <Paperclip className="h-3 w-3 mr-1" />
                        Anexo {index + 1}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* New Comment Form */}
        <div className="space-y-4 border-t pt-4">
          <div>
            <Label htmlFor="comment">Novo Comentário</Label>
            <Textarea
              id="comment"
              placeholder="Escreva o seu comentário..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label>Anexos</Label>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.txt"
                onChange={(e) => {
                  if (e.target.files) {
                    setSelectedFiles(Array.from(e.target.files))
                  }
                }}
                className="hidden"
                id="file-upload"
              />
              <Label htmlFor="file-upload" className="cursor-pointer">
                <Button variant="outline" size="sm" asChild>
                  <span className="flex items-center gap-2">
                    <Paperclip className="h-4 w-4" />
                    Anexar Ficheiros
                  </span>
                </Button>
              </Label>
              {selectedFiles.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  {selectedFiles.length} ficheiro(s) selecionado(s)
                </span>
              )}
            </div>
          </div>

          {/* Internal Note Toggle (for DGIEA/Admin only) */}
          {canManageIncident && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="internal"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="internal" className="text-sm">
                Comentário interno (apenas visível para DGIEA/TI)
              </Label>
            </div>
          )}

          <Button 
            onClick={handleSendComment}
            disabled={!newComment.trim() || loading || uploadingFile}
            className="w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            {uploadingFile ? 'A enviar ficheiros...' : loading ? 'A enviar...' : 'Enviar Comentário'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}