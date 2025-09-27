import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/useAuth"
import { useRequests } from "@/hooks/useRequests"
import { NewRequestForm } from "@/components/forms/NewRequestForm"
import { Header } from "@/components/Header"
import { Plus, Search, Filter, Clock, CheckCircle2, AlertCircle, XCircle, FileText } from "lucide-react"
import { format } from "date-fns"

const statusColors = {
  'submetido': 'bg-blue-100 text-blue-800 border-blue-200',
  'em_analise_dgiea': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'enviado_direcao': 'bg-purple-100 text-purple-800 border-purple-200',
  'aprovado': 'bg-green-100 text-green-800 border-green-200',
  'rejeitado': 'bg-red-100 text-red-800 border-red-200'
}

const statusLabels = {
  'submetido': 'Submetido',
  'em_analise_dgiea': 'Em Análise DGIEA',
  'enviado_direcao': 'Enviado à Direção',
  'aprovado': 'Aprovado',
  'rejeitado': 'Rejeitado'
}

const statusIcons = {
  'submetido': Clock,
  'em_analise_dgiea': FileText,
  'enviado_direcao': AlertCircle,
  'aprovado': CheckCircle2,
  'rejeitado': XCircle
}

const priorityColors = {
  'baixa': 'bg-gray-100 text-gray-800',
  'media': 'bg-blue-100 text-blue-800',
  'alta': 'bg-orange-100 text-orange-800',
  'critica': 'bg-red-100 text-red-800'
}

export default function Requests() {
  const { user, profile } = useAuth()
  const { requests, loading, createRequest, updateRequestStatus } = useRequests()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [selectedTab, setSelectedTab] = useState('minhas')
  const [openNewRequest, setOpenNewRequest] = useState(false)

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter
    const matchesType = typeFilter === 'all' || request.type === typeFilter
    
    // Filter by tab
    if (selectedTab === 'minhas') {
      return request.user_id === user?.id && matchesSearch && matchesStatus && matchesType
    } else if (selectedTab === 'todas' && (profile?.role === 'DGIEA' || profile?.role === 'direcao' || profile?.role === 'admin')) {
      return matchesSearch && matchesStatus && matchesType
    }
    
    return false
  })

  const handleStatusUpdate = async (requestId: string, newStatus: 'submetido' | 'em_analise_dgiea' | 'enviado_direcao' | 'aprovado' | 'rejeitado', notes?: string) => {
    try {
      await updateRequestStatus({
        request_id: requestId,
        new_status: newStatus,
        notes
      })
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
        <Header />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Requisições</h1>
            <p className="text-muted-foreground mt-2">Gerir e acompanhar requisições</p>
          </div>
          
          <Dialog open={openNewRequest} onOpenChange={setOpenNewRequest}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nova Requisição
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <NewRequestForm 
                onSuccess={() => setOpenNewRequest(false)} 
                onCancel={() => setOpenNewRequest(false)} 
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar requisições..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="submetido">Submetido</SelectItem>
                  <SelectItem value="em_analise_dgiea">Em Análise</SelectItem>
                  <SelectItem value="enviado_direcao">Enviado à Direção</SelectItem>
                  <SelectItem value="aprovado">Aprovado</SelectItem>
                  <SelectItem value="rejeitado">Rejeitado</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="viatura">Viatura</SelectItem>
                  <SelectItem value="alimentacao">Alimentação</SelectItem>
                  <SelectItem value="material">Material</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="minhas">Minhas Requisições</TabsTrigger>
            {(profile?.role === 'DGIEA' || profile?.role === 'direcao' || profile?.role === 'admin') && (
              <TabsTrigger value="todas">Todas as Requisições</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="minhas" className="space-y-4">
            {filteredRequests.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma requisição encontrada</h3>
                  <p className="text-muted-foreground mb-4">Ainda não tem requisições ou não encontramos resultados para os filtros aplicados.</p>
                  <Button onClick={() => setOpenNewRequest(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Nova Requisição
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredRequests.map((request) => {
                  const StatusIcon = statusIcons[request.status as keyof typeof statusIcons]
                  
                  return (
                    <Card key={request.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <CardTitle className="text-lg">{request.title}</CardTitle>
                            <CardDescription>{request.description}</CardDescription>
                          </div>
                          <div className="flex gap-2">
                            <Badge className={statusColors[request.status as keyof typeof statusColors]}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusLabels[request.status as keyof typeof statusLabels]}
                            </Badge>
                            <Badge className={priorityColors[request.priority as keyof typeof priorityColors]}>
                              {request.priority}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-muted-foreground">Tipo:</span>
                            <p className="capitalize">{request.type}</p>
                          </div>
                          <div>
                            <span className="font-medium text-muted-foreground">Prioridade:</span>
                            <p className="capitalize">{request.priority}</p>
                          </div>
                          <div>
                            <span className="font-medium text-muted-foreground">Data:</span>
                            <p>{format(new Date(request.created_at), 'dd/MM/yyyy')}</p>
                          </div>
                          <div>
                            <span className="font-medium text-muted-foreground">Localização:</span>
                            <p>{request.location || 'N/A'}</p>
                          </div>
                        </div>

                        {request.dgiea_notes && (
                          <div className="mt-4 p-3 bg-muted rounded-lg">
                            <span className="font-medium text-sm">Notas DGIEA:</span>
                            <p className="text-sm mt-1">{request.dgiea_notes}</p>
                          </div>
                        )}

                        {request.direction_decision && (
                          <div className="mt-4 p-3 bg-muted rounded-lg">
                            <span className="font-medium text-sm">Decisão da Direção:</span>
                            <p className="text-sm mt-1">{request.direction_decision}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="todas" className="space-y-4">
            {filteredRequests.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma requisição encontrada</h3>
                  <p className="text-muted-foreground">Não encontramos resultados para os filtros aplicados.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredRequests.map((request) => {
                  const StatusIcon = statusIcons[request.status as keyof typeof statusIcons]
                  
                  return (
                    <Card key={request.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <CardTitle className="text-lg">{request.title}</CardTitle>
                            <CardDescription>{request.description}</CardDescription>
                          </div>
                          <div className="flex gap-2">
                            <Badge className={statusColors[request.status as keyof typeof statusColors]}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusLabels[request.status as keyof typeof statusLabels]}
                            </Badge>
                            <Badge className={priorityColors[request.priority as keyof typeof priorityColors]}>
                              {request.priority}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                          <div>
                            <span className="font-medium text-muted-foreground">Tipo:</span>
                            <p className="capitalize">{request.type}</p>
                          </div>
                          <div>
                            <span className="font-medium text-muted-foreground">Prioridade:</span>
                            <p className="capitalize">{request.priority}</p>
                          </div>
                          <div>
                            <span className="font-medium text-muted-foreground">Data:</span>
                            <p>{format(new Date(request.created_at), 'dd/MM/yyyy')}</p>
                          </div>
                          <div>
                            <span className="font-medium text-muted-foreground">Localização:</span>
                            <p>{request.location || 'N/A'}</p>
                          </div>
                        </div>

                        {/* Action buttons for DGIEA and Direction */}
                        {profile?.role === 'DGIEA' && request.status === 'submetido' && (
                          <div className="flex gap-2 mt-4">
                            <Button 
                              size="sm" 
                              onClick={() => handleStatusUpdate(request.id, 'em_analise_dgiea', 'Em análise pela DGIEA')}
                            >
                              Aceitar para Análise
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleStatusUpdate(request.id, 'enviado_direcao', 'Enviado à direção para decisão')}
                            >
                              Enviar à Direção
                            </Button>
                          </div>
                        )}

                        {(profile?.role === 'direcao' || profile?.role === 'admin') && 
                         (request.status === 'enviado_direcao' || request.status === 'em_analise_dgiea') && (
                          <div className="flex gap-2 mt-4">
                            <Button 
                              size="sm"
                              onClick={() => handleStatusUpdate(request.id, 'aprovado', 'Requisição aprovada pela direção')}
                            >
                              Aprovar
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleStatusUpdate(request.id, 'rejeitado', 'Requisição rejeitada pela direção')}
                            >
                              Rejeitar
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}