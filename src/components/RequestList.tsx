import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useRequests } from "@/hooks/useRequests"
import { useAuth } from "@/hooks/useAuth"
import { Request } from "@/lib/supabase"
import { format } from "date-fns"
import { pt } from "date-fns/locale"
import { 
  Search, 
  Filter, 
  Eye, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  FileText,
  Calendar,
  MapPin,
  User
} from "lucide-react"

interface RequestListProps {
  userRole: 'colaborador' | 'DGIEA' | 'direcao' | 'admin'
  showUserColumn?: boolean
}

export function RequestList({ userRole, showUserColumn = true }: RequestListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)

  const { requests, loading, updateRequestStatus } = useRequests()
  const { user, profile } = useAuth()

  // Filter requests based on user role
  const getFilteredRequests = () => {
    let filteredRequests = requests

    // Role-based filtering
    if (userRole === 'colaborador' && user) {
      filteredRequests = requests.filter(req => req.user_id === user.id)
    }

    // Search filter
    if (searchTerm) {
      filteredRequests = filteredRequests.filter(req =>
        req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filteredRequests = filteredRequests.filter(req => req.status === statusFilter)
    }

    // Type filter
    if (typeFilter !== "all") {
      filteredRequests = filteredRequests.filter(req => req.type === typeFilter)
    }

    return filteredRequests.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'submetido': { 
        label: 'Submetido', 
        variant: 'outline' as const, 
        icon: Clock,
        className: 'text-warning bg-warning/10 border-warning/20'
      },
      'em_analise_dgiea': { 
        label: 'Em Análise DGIEA', 
        variant: 'outline' as const, 
        icon: AlertTriangle,
        className: 'text-accent bg-accent/10 border-accent/20'
      },
      'enviado_direcao': { 
        label: 'Enviado Direção', 
        variant: 'outline' as const, 
        icon: FileText,
        className: 'text-primary bg-primary/10 border-primary/20'
      },
      'aprovado': { 
        label: 'Aprovado', 
        variant: 'outline' as const, 
        icon: CheckCircle,
        className: 'text-success bg-success/10 border-success/20'
      },
      'rejeitado': { 
        label: 'Rejeitado', 
        variant: 'destructive' as const, 
        icon: XCircle,
        className: 'text-destructive bg-destructive/10 border-destructive/20'
      }
    }

    const config = statusConfig[status as keyof typeof statusConfig]
    if (!config) return <Badge variant="outline">Desconhecido</Badge>

    const Icon = config.icon
    return (
      <Badge variant={config.variant} className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      'baixa': { label: 'Baixa', className: 'bg-muted text-muted-foreground' },
      'media': { label: 'Média', className: 'bg-accent/10 text-accent' },
      'alta': { label: 'Alta', className: 'bg-warning/10 text-warning' },
      'critica': { label: 'Crítica', className: 'bg-destructive/10 text-destructive' }
    }

    const config = priorityConfig[priority as keyof typeof priorityConfig]
    return (
      <Badge variant="outline" className={config?.className}>
        {config?.label || priority}
      </Badge>
    )
  }

  const canUpdateStatus = (request: Request) => {
    if (userRole === 'admin') return true
    if (userRole === 'DGIEA' && ['submetido', 'em_analise_dgiea'].includes(request.status)) return true
    if (userRole === 'direcao' && request.status === 'enviado_direcao') return true
    return false
  }

  const handleStatusUpdate = async (requestId: string, newStatus: string, notes?: string) => {
    await updateRequestStatus({
      request_id: requestId,
      new_status: newStatus as any,
      notes
    })
  }

  const filteredRequests = getFilteredRequests()

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="portal-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Pesquisar requisições..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Estados</SelectItem>
                <SelectItem value="submetido">Submetido</SelectItem>
                <SelectItem value="em_analise_dgiea">Em Análise DGIEA</SelectItem>
                <SelectItem value="enviado_direcao">Enviado Direção</SelectItem>
                <SelectItem value="aprovado">Aprovado</SelectItem>
                <SelectItem value="rejeitado">Rejeitado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="viatura">Viatura</SelectItem>
                <SelectItem value="alimentacao">Alimentação</SelectItem>
                <SelectItem value="material">Material</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center text-sm text-muted-foreground">
              Total: {filteredRequests.length} requisições
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">A carregar requisições...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <Card className="portal-card">
            <CardContent className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Nenhuma requisição encontrada</p>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                  ? "Tente ajustar os filtros de pesquisa"
                  : "Ainda não existem requisições submetidas"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request) => (
            <Card key={request.id} className="portal-card-interactive">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{request.title}</h3>
                      {getStatusBadge(request.status)}
                      {getPriorityBadge(request.priority)}
                    </div>
                    
                    <p className="text-muted-foreground mb-3 line-clamp-2">
                      {request.description}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {showUserColumn && (
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{(request as any).profiles?.full_name || 'Utilizador'}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{format(new Date(request.created_at), "dd/MM/yyyy", { locale: pt })}</span>
                      </div>

                      {request.requested_date && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {format(new Date(request.requested_date), "dd/MM/yyyy", { locale: pt })}
                            {request.requested_time && ` às ${request.requested_time}`}
                          </span>
                        </div>
                      )}

                      {request.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate">{request.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedRequest(request)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Detalhes da Requisição</DialogTitle>
                        </DialogHeader>
                        {selectedRequest && (
                          <RequestDetails 
                            request={selectedRequest} 
                            canUpdate={canUpdateStatus(selectedRequest)}
                            onStatusUpdate={handleStatusUpdate}
                          />
                        )}
                      </DialogContent>
                    </Dialog>

                    {canUpdateStatus(request) && (
                      <QuickActionButtons 
                        request={request} 
                        userRole={userRole}
                        onStatusUpdate={handleStatusUpdate}
                      />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

// Component for request details dialog
function RequestDetails({ 
  request, 
  canUpdate, 
  onStatusUpdate 
}: { 
  request: Request
  canUpdate: boolean
  onStatusUpdate: (id: string, status: string, notes?: string) => void
}) {
  // Implementation for detailed view with status update capabilities
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Estado</Label>
          <div className="mt-1">{/* Status badge */}</div>
        </div>
        <div>
          <Label>Prioridade</Label>
          <div className="mt-1">{/* Priority badge */}</div>
        </div>
      </div>
      
      <Separator />
      
      <div>
        <Label>Descrição</Label>
        <p className="mt-1 text-sm">{request.description}</p>
      </div>
      
      {/* Additional details and status update form if canUpdate */}
    </div>
  )
}

// Component for quick action buttons
function QuickActionButtons({ 
  request, 
  userRole, 
  onStatusUpdate 
}: { 
  request: Request
  userRole: string
  onStatusUpdate: (id: string, status: string, notes?: string) => void
}) {
  // Implementation for quick status update buttons
  return (
    <div className="flex gap-1">
      {/* Role-specific action buttons */}
    </div>
  )
}