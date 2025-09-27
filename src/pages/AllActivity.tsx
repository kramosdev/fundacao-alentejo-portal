import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Header } from "@/components/Header"
import { useAuth } from "@/hooks/useAuth"
import { useRequests } from "@/hooks/useRequests"
import { supabase } from "@/lib/supabase"
import { Clock, FileText, AlertTriangle, CheckCircle, XCircle, Users, Search, Filter, ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { format } from "date-fns"
import { pt } from "date-fns/locale"

interface ActivityItem {
  id: string
  type: 'request' | 'incident' | 'user'
  title: string
  description: string
  status: string
  priority?: string
  user_name?: string
  user_email?: string
  created_at: string
}

export default function AllActivity() {
  const { user, profile } = useAuth()
  const { requests } = useRequests()
  const navigate = useNavigate()
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchAllActivities()
  }, [user, requests])

  const fetchAllActivities = async () => {
    if (!user) return

    try {
      setLoading(true)
      const allActivities: ActivityItem[] = []

      // Add requests
      requests.forEach(request => {
        allActivities.push({
          id: request.id,
          type: 'request',
          title: request.title,
          description: request.description,
          status: request.status,
          priority: request.priority,
          created_at: request.created_at
        })
      })

      // Fetch incidents
      const { data: incidents } = await supabase
        .from('incidents')
        .select('*')
        .order('created_at', { ascending: false })

      if (incidents) {
        const incidentsWithProfiles = await Promise.all(
          incidents.map(async (incident) => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, email')
              .eq('user_id', incident.user_id)
              .single()

            return {
              ...incident,
              profiles: profile
            }
          })
        )

        incidentsWithProfiles.forEach(incident => {
          allActivities.push({
            id: incident.id,
            type: 'incident',
            title: incident.title,
            description: incident.description,
            status: incident.status,
            priority: incident.priority,
            user_name: incident.profiles?.full_name || 'Utilizador',
            user_email: incident.profiles?.email || 'N/A',
            created_at: incident.created_at
          })
        })
      }

      // Fetch recent user registrations (for admins)
      if (profile?.role === 'admin' || profile?.role === 'direcao') {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20)

        if (profiles) {
          profiles.forEach(prof => {
            allActivities.push({
              id: prof.id,
              type: 'user',
              title: `Novo utilizador: ${prof.full_name}`,
              description: `Utilizador registado no sistema`,
              status: prof.is_active ? 'ativo' : 'inativo',
              user_name: prof.full_name,
              user_email: prof.email,
              created_at: prof.created_at
            })
          })
        }
      }

      // Sort by date
      allActivities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      setActivities(allActivities)
    } catch (error) {
      console.error('Error fetching activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || activity.type === typeFilter
    const matchesStatus = statusFilter === 'all' || activity.status === statusFilter
    
    return matchesSearch && matchesType && matchesStatus
  })

  const getIcon = (type: string) => {
    switch (type) {
      case 'request': return FileText
      case 'incident': return AlertTriangle
      case 'user': return Users
      default: return Clock
    }
  }

  const getStatusBadge = (status: string, type: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      // Request statuses
      'submetido': { color: 'bg-yellow-100 text-yellow-800', label: 'Submetido' },
      'em_analise_dgiea': { color: 'bg-blue-100 text-blue-800', label: 'Em Análise' },
      'enviado_direcao': { color: 'bg-purple-100 text-purple-800', label: 'Enviado à Direção' },
      'aprovado': { color: 'bg-green-100 text-green-800', label: 'Aprovado' },
      'rejeitado': { color: 'bg-red-100 text-red-800', label: 'Rejeitado' },
      
      // Incident statuses
      'reportado': { color: 'bg-yellow-100 text-yellow-800', label: 'Reportado' },
      'em_analise': { color: 'bg-blue-100 text-blue-800', label: 'Em Análise' },
      'em_resolucao': { color: 'bg-purple-100 text-purple-800', label: 'Em Resolução' },
      'resolvido': { color: 'bg-green-100 text-green-800', label: 'Resolvido' },
      'fechado': { color: 'bg-gray-100 text-gray-800', label: 'Fechado' },
      
      // User statuses
      'ativo': { color: 'bg-green-100 text-green-800', label: 'Ativo' },
      'inativo': { color: 'bg-gray-100 text-gray-800', label: 'Inativo' }
    }

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status }
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'critica': return 'border-l-red-500'
      case 'alta': return 'border-l-orange-500'
      case 'media': return 'border-l-blue-500'
      case 'baixa': return 'border-l-gray-400'
      default: return 'border-l-gray-300'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'request': return 'Requisição'
      case 'incident': return 'Incidente'
      case 'user': return 'Utilizador'
      default: return type
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard')} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Dashboard
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Toda a Atividade</h1>
          <p className="text-muted-foreground mt-2">
            Histórico completo de requisições, incidentes e atividade de utilizadores
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar atividades..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="request">Requisições</SelectItem>
                  <SelectItem value="incident">Incidentes</SelectItem>
                  <SelectItem value="user">Utilizadores</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os estados</SelectItem>
                  <SelectItem value="submetido">Submetido</SelectItem>
                  <SelectItem value="em_analise_dgiea">Em Análise</SelectItem>
                  <SelectItem value="aprovado">Aprovado</SelectItem>
                  <SelectItem value="rejeitado">Rejeitado</SelectItem>
                  <SelectItem value="reportado">Reportado</SelectItem>
                  <SelectItem value="resolvido">Resolvido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Activity List */}
        <Card>
          <CardHeader>
            <CardTitle>Atividades ({filteredActivities.length})</CardTitle>
            <CardDescription>Cronologia de toda a atividade do sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhuma atividade encontrada</p>
              </div>
            ) : (
              filteredActivities.map((activity) => {
                const Icon = getIcon(activity.type)
                return (
                  <div
                    key={`${activity.type}-${activity.id}`}
                    className={`flex items-start space-x-4 p-4 rounded-lg border-l-4 bg-muted/20 hover:bg-muted/30 transition-colors ${getPriorityColor(activity.priority)}`}
                  >
                    <div className="flex-shrink-0">
                      <div className="p-2 rounded-lg bg-background border">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground truncate">
                            {activity.title}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {getTypeLabel(activity.type)}
                          </Badge>
                        </div>
                        {getStatusBadge(activity.status, activity.type)}
                      </div>
                      
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {activity.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>
                            {format(new Date(activity.created_at), 'dd/MM/yyyy HH:mm', { locale: pt })}
                          </span>
                          {activity.user_name && (
                            <span>Por: {activity.user_name}</span>
                          )}
                          {activity.priority && (
                            <Badge variant="outline" className="text-xs">
                              {activity.priority}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}