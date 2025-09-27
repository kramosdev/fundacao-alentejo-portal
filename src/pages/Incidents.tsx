import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useAuth } from "@/hooks/useAuth"
import { Header } from "@/components/Header"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { AlertTriangle, Plus, Search, Filter, Monitor, Wifi, HardDrive, Shield } from "lucide-react"
import { format } from "date-fns"
import { pt } from "date-fns/locale"

interface Incident {
  id: string
  user_id: string
  title: string
  description: string
  category: 'hardware' | 'software' | 'network' | 'security' | 'other'
  priority: 'baixa' | 'media' | 'alta' | 'critica'
  status: 'reportado' | 'em_analise' | 'em_resolucao' | 'resolvido' | 'fechado'
  location?: string
  it_notes?: string
  resolved_at?: string
  created_at: string
  profiles?: {
    full_name: string
    email: string
  }
}

const categoryLabels = {
  'hardware': 'Hardware',
  'software': 'Software',
  'network': 'Rede',
  'security': 'Segurança',
  'other': 'Outro'
}

const categoryIcons = {
  'hardware': Monitor,
  'software': HardDrive,
  'network': Wifi,
  'security': Shield,
  'other': AlertTriangle
}

const statusLabels = {
  'reportado': 'Reportado',
  'em_analise': 'Em Análise',
  'em_resolucao': 'Em Resolução',
  'resolvido': 'Resolvido',
  'fechado': 'Fechado'
}

const statusColors = {
  'reportado': 'bg-yellow-100 text-yellow-800',
  'em_analise': 'bg-blue-100 text-blue-800',
  'em_resolucao': 'bg-purple-100 text-purple-800',
  'resolvido': 'bg-green-100 text-green-800',
  'fechado': 'bg-gray-100 text-gray-800'
}

const priorityColors = {
  'baixa': 'bg-blue-100 text-blue-800',
  'media': 'bg-yellow-100 text-yellow-800',
  'alta': 'bg-orange-100 text-orange-800',
  'critica': 'bg-red-100 text-red-800'
}

export default function Incidents() {
  const { user, profile, loading } = useAuth()
  const { toast } = useToast()
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [filteredIncidents, setFilteredIncidents] = useState<Incident[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [showNewIncident, setShowNewIncident] = useState(false)
  const [newIncident, setNewIncident] = useState({
    title: '',
    description: '',
    category: 'other' as const,
    priority: 'media' as const,
    location: ''
  })

  useEffect(() => {
    fetchIncidents()
  }, [])

  useEffect(() => {
    let filtered = incidents
    
    if (searchTerm) {
      filtered = filtered.filter(incident => 
        incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(incident => incident.status === statusFilter)
    }
    
    setFilteredIncidents(filtered)
  }, [incidents, searchTerm, statusFilter])

  const fetchIncidents = async () => {
    try {
      setIsLoading(true)
      
      // Create incidents table if it doesn't exist (this would be done via migration in real app)
      await supabase.rpc('create_incidents_table').catch(() => {
        // Table might already exist, ignore error
      })

      const { data, error } = await supabase
        .from('incidents')
        .select(`
          *,
          profiles!incidents_user_id_fkey(full_name, email)
        `)
        .order('created_at', { ascending: false })

      if (error && !error.message.includes('relation "incidents" does not exist')) {
        throw error
      }
      
      setIncidents(data || [])
    } catch (error: any) {
      console.error('Error fetching incidents:', error)
      // Don't show error toast if table doesn't exist yet
      if (!error.message.includes('relation "incidents" does not exist')) {
        toast({
          title: "Erro ao carregar incidentes",
          description: error.message,
          variant: "destructive"
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateIncident = async () => {
    if (!user || !newIncident.title || !newIncident.description) return

    try {
      const { error } = await supabase
        .from('incidents')
        .insert({
          user_id: user.id,
          title: newIncident.title,
          description: newIncident.description,
          category: newIncident.category,
          priority: newIncident.priority,
          location: newIncident.location,
          status: 'reportado'
        })

      if (error) throw error

      toast({
        title: "Incidente reportado",
        description: "O incidente foi reportado e encaminhado para o departamento de TI."
      })

      setShowNewIncident(false)
      setNewIncident({
        title: '',
        description: '',
        category: 'other',
        priority: 'media',
        location: ''
      })
      fetchIncidents()
    } catch (error: any) {
      toast({
        title: "Erro ao reportar incidente",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  if (loading || isLoading) {
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
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <AlertTriangle className="h-8 w-8" />
            Gestão de Incidentes
          </h1>
          <p className="text-muted-foreground mt-2">Reportar e acompanhar incidentes técnicos</p>
        </div>

        {/* Action Bar */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar incidentes..."
                className="pl-8 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Estados</SelectItem>
                <SelectItem value="reportado">Reportado</SelectItem>
                <SelectItem value="em_analise">Em Análise</SelectItem>
                <SelectItem value="em_resolucao">Em Resolução</SelectItem>
                <SelectItem value="resolvido">Resolvido</SelectItem>
                <SelectItem value="fechado">Fechado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Dialog open={showNewIncident} onOpenChange={setShowNewIncident}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Reportar Incidente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Reportar Novo Incidente</DialogTitle>
                <DialogDescription>
                  Descreva o problema técnico que está a experienciar
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria</Label>
                    <Select value={newIncident.category} onValueChange={(value) => setNewIncident({...newIncident, category: value as any})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hardware">Hardware</SelectItem>
                        <SelectItem value="software">Software</SelectItem>
                        <SelectItem value="network">Rede</SelectItem>
                        <SelectItem value="security">Segurança</SelectItem>
                        <SelectItem value="other">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="priority">Prioridade</Label>
                    <Select value={newIncident.priority} onValueChange={(value) => setNewIncident({...newIncident, priority: value as any})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baixa">Baixa</SelectItem>
                        <SelectItem value="media">Média</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="critica">Crítica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="title">Título do Incidente</Label>
                  <Input
                    id="title"
                    value={newIncident.title}
                    onChange={(e) => setNewIncident({...newIncident, title: e.target.value})}
                    placeholder="Descreva brevemente o problema"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição Detalhada</Label>
                  <Textarea
                    id="description"
                    value={newIncident.description}
                    onChange={(e) => setNewIncident({...newIncident, description: e.target.value})}
                    placeholder="Forneça todos os detalhes sobre o problema, incluindo mensagens de erro, quando aconteceu, etc."
                    className="min-h-[100px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Localização</Label>
                  <Input
                    id="location"
                    value={newIncident.location}
                    onChange={(e) => setNewIncident({...newIncident, location: e.target.value})}
                    placeholder="Onde está localizado o equipamento/problema"
                  />
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowNewIncident(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateIncident}>
                    Reportar Incidente
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Incidents Table */}
        <Card>
          <CardHeader>
            <CardTitle>Incidentes ({filteredIncidents.length})</CardTitle>
            <CardDescription>Lista de todos os incidentes reportados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Incidente</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Reportado por</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIncidents.map((incident) => {
                    const CategoryIcon = categoryIcons[incident.category]
                    return (
                      <TableRow key={incident.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{incident.title}</p>
                            <p className="text-sm text-muted-foreground">{incident.location}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <CategoryIcon className="h-4 w-4" />
                            {categoryLabels[incident.category]}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={priorityColors[incident.priority]}>
                            {incident.priority.charAt(0).toUpperCase() + incident.priority.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[incident.status]}>
                            {statusLabels[incident.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{incident.profiles?.full_name}</p>
                            <p className="text-sm text-muted-foreground">{incident.profiles?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(new Date(incident.created_at), 'dd/MM/yyyy HH:mm', { locale: pt })}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
              
              {filteredIncidents.length === 0 && (
                <div className="p-8 text-center">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum incidente encontrado</p>
                  <Button className="mt-4" onClick={() => setShowNewIncident(true)}>
                    Reportar Primeiro Incidente
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}