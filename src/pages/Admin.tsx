import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/useAuth"
import { Header } from "@/components/Header"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { Settings, Users, Shield, Building, FileText, Activity, Plus, Edit, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { pt } from "date-fns/locale"

interface SystemSetting {
  id: string
  key: string
  value: any
  description: string
  category: string
  is_public: boolean
  updated_at: string
}

interface Department {
  id: string
  name: string
  description: string
  is_active: boolean
  created_at: string
}

interface AuditLog {
  id: string
  user_id: string
  action: string
  table_name: string
  record_id: string
  old_values: any
  new_values: any
  created_at: string
  profiles?: {
    full_name: string
    email: string
  }
}

interface PendingRegistration {
  id: string
  email: string
  full_name: string
  requested_role: string
  status: string
  created_at: string
}

export default function Admin() {
  const { user, profile, loading } = useAuth()
  const { toast } = useToast()
  const [settings, setSettings] = useState<SystemSetting[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [pendingRegistrations, setPendingRegistrations] = useState<PendingRegistration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showNewSetting, setShowNewSetting] = useState(false)
  const [showNewDepartment, setShowNewDepartment] = useState(false)
  const [newSetting, setNewSetting] = useState({
    key: '',
    value: '',
    description: '',
    category: 'general',
    is_public: false
  })
  const [newDepartment, setNewDepartment] = useState({
    name: '',
    description: ''
  })

  useEffect(() => {
    if (profile?.role === 'admin' || profile?.role === 'direcao') {
      fetchData()
    }
  }, [profile])

  const fetchData = async () => {
    setIsLoading(true)
    await Promise.all([
      fetchSettings(),
      fetchDepartments(), 
      fetchAuditLogs(),
      fetchPendingRegistrations()
    ])
    setIsLoading(false)
  }

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('category', { ascending: true })

      if (error) throw error
      setSettings(data || [])
    } catch (error: any) {
      toast({
        title: "Erro ao carregar configurações",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name')

      if (error) throw error
      setDepartments(data || [])
    } catch (error: any) {
      toast({
        title: "Erro ao carregar departamentos",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const fetchAuditLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setAuditLogs(data || [])
    } catch (error: any) {
      toast({
        title: "Erro ao carregar logs de auditoria",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const fetchPendingRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from('pending_registrations')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPendingRegistrations(data || [])
    } catch (error: any) {
      toast({
        title: "Erro ao carregar registos pendentes",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const handleCreateSetting = async () => {
    if (!newSetting.key || !newSetting.value) return

    try {
      let value: any = newSetting.value
      try {
        value = JSON.parse(newSetting.value)
      } catch {
        // Keep as string if not valid JSON
        value = `"${newSetting.value}"`
      }

      const { error } = await supabase
        .from('system_settings')
        .insert({
          ...newSetting,
          value,
          updated_by: user?.id
        })

      if (error) throw error

      toast({
        title: "Configuração criada",
        description: "A configuração foi criada com sucesso."
      })

      setShowNewSetting(false)
      setNewSetting({
        key: '',
        value: '',
        description: '',
        category: 'general',
        is_public: false
      })
      fetchSettings()
    } catch (error: any) {
      toast({
        title: "Erro ao criar configuração",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const handleCreateDepartment = async () => {
    if (!newDepartment.name) return

    try {
      const { error } = await supabase
        .from('departments')
        .insert(newDepartment)

      if (error) throw error

      toast({
        title: "Departamento criado",
        description: "O departamento foi criado com sucesso."
      })

      setShowNewDepartment(false)
      setNewDepartment({
        name: '',
        description: ''
      })
      fetchDepartments()
    } catch (error: any) {
      toast({
        title: "Erro ao criar departamento",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const handleApproveRegistration = async (id: string, approved: boolean) => {
    try {
      const { error } = await supabase
        .from('pending_registrations')
        .update({
          status: approved ? 'approved' : 'rejected',
          approved_by: user?.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error

      toast({
        title: approved ? "Registo aprovado" : "Registo rejeitado",
        description: approved 
          ? "O utilizador pode agora aceder ao sistema."
          : "O registo foi rejeitado."
      })

      fetchPendingRegistrations()
    } catch (error: any) {
      toast({
        title: "Erro ao processar registo",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const updateSetting = async (id: string, updates: Partial<SystemSetting>) => {
    try {
      const { error } = await supabase
        .from('system_settings')
        .update({
          ...updates,
          updated_by: user?.id
        })
        .eq('id', id)

      if (error) throw error
      
      toast({
        title: "Configuração atualizada",
        description: "A configuração foi atualizada com sucesso."
      })
      
      fetchSettings()
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar configuração",
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

  if (profile?.role !== 'admin' && profile?.role !== 'direcao') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Acesso restrito a administradores</p>
          </div>
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
            <Settings className="h-8 w-8" />
            Administração do Sistema
          </h1>
          <p className="text-muted-foreground mt-2">Gerir configurações, utilizadores e sistema</p>
        </div>

        <Tabs defaultValue="settings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configurações
            </TabsTrigger>
            <TabsTrigger value="departments" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Departamentos
            </TabsTrigger>
            <TabsTrigger value="registrations" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Registos Pendentes
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Logs de Auditoria
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Sistema
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Configurações do Sistema</CardTitle>
                  <CardDescription>Gerir todas as configurações do sistema</CardDescription>
                </div>
                <Dialog open={showNewSetting} onOpenChange={setShowNewSetting}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Nova Configuração
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Nova Configuração</DialogTitle>
                      <DialogDescription>
                        Adicionar uma nova configuração do sistema
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="key">Chave</Label>
                          <Input
                            id="key"
                            value={newSetting.key}
                            onChange={(e) => setNewSetting({...newSetting, key: e.target.value})}
                            placeholder="setting_key"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category">Categoria</Label>
                          <Select value={newSetting.category} onValueChange={(value) => setNewSetting({...newSetting, category: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="general">Geral</SelectItem>
                              <SelectItem value="requests">Requisições</SelectItem>
                              <SelectItem value="incidents">Incidentes</SelectItem>
                              <SelectItem value="files">Ficheiros</SelectItem>
                              <SelectItem value="security">Segurança</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="value">Valor</Label>
                        <Input
                          id="value"
                          value={newSetting.value}
                          onChange={(e) => setNewSetting({...newSetting, value: e.target.value})}
                          placeholder="Valor da configuração"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea
                          id="description"
                          value={newSetting.description}
                          onChange={(e) => setNewSetting({...newSetting, description: e.target.value})}
                          placeholder="Descrição da configuração"
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="is_public"
                          checked={newSetting.is_public}
                          onCheckedChange={(checked) => setNewSetting({...newSetting, is_public: checked})}
                        />
                        <Label htmlFor="is_public">Pública (visível para todos)</Label>
                      </div>
                      
                      <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => setShowNewSetting(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleCreateSetting}>
                          Criar Configuração
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Chave</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Público</TableHead>
                        <TableHead>Última Atualização</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {settings.map((setting) => (
                        <TableRow key={setting.id}>
                          <TableCell className="font-medium">{setting.key}</TableCell>
                          <TableCell>
                            <div className="max-w-xs truncate">
                              {typeof setting.value === 'string' ? setting.value : JSON.stringify(setting.value)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{setting.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={setting.is_public ? "default" : "secondary"}>
                              {setting.is_public ? "Sim" : "Não"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {format(new Date(setting.updated_at), 'dd/MM/yyyy HH:mm', { locale: pt })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="departments">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Gestão de Departamentos</CardTitle>
                  <CardDescription>Gerir departamentos da organização</CardDescription>
                </div>
                <Dialog open={showNewDepartment} onOpenChange={setShowNewDepartment}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Novo Departamento
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Novo Departamento</DialogTitle>
                      <DialogDescription>
                        Adicionar um novo departamento
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome</Label>
                        <Input
                          id="name"
                          value={newDepartment.name}
                          onChange={(e) => setNewDepartment({...newDepartment, name: e.target.value})}
                          placeholder="Nome do departamento"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea
                          id="description"
                          value={newDepartment.description}
                          onChange={(e) => setNewDepartment({...newDepartment, description: e.target.value})}
                          placeholder="Descrição do departamento"
                        />
                      </div>
                      
                      <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => setShowNewDepartment(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleCreateDepartment}>
                          Criar Departamento
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Criado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {departments.map((department) => (
                        <TableRow key={department.id}>
                          <TableCell className="font-medium">{department.name}</TableCell>
                          <TableCell>{department.description}</TableCell>
                          <TableCell>
                            <Badge variant={department.is_active ? "default" : "secondary"}>
                              {department.is_active ? "Ativo" : "Inativo"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {format(new Date(department.created_at), 'dd/MM/yyyy', { locale: pt })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="registrations">
            <Card>
              <CardHeader>
                <CardTitle>Registos Pendentes de Aprovação</CardTitle>
                <CardDescription>Aprovar ou rejeitar novos registos de utilizadores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Cargo Solicitado</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingRegistrations.map((registration) => (
                        <TableRow key={registration.id}>
                          <TableCell className="font-medium">{registration.full_name}</TableCell>
                          <TableCell>{registration.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{registration.requested_role}</Badge>
                          </TableCell>
                          <TableCell>
                            {format(new Date(registration.created_at), 'dd/MM/yyyy HH:mm', { locale: pt })}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleApproveRegistration(registration.id, true)}
                              >
                                Aprovar
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleApproveRegistration(registration.id, false)}
                              >
                                Rejeitar
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {pendingRegistrations.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            Nenhum registo pendente
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit">
            <Card>
              <CardHeader>
                <CardTitle>Logs de Auditoria</CardTitle>
                <CardDescription>Histórico de ações no sistema (últimas 50 entradas)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Utilizador</TableHead>
                        <TableHead>Ação</TableHead>
                        <TableHead>Tabela</TableHead>
                        <TableHead>Data</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{log.profiles?.full_name || 'Sistema'}</p>
                              <p className="text-sm text-muted-foreground">{log.profiles?.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{log.action}</Badge>
                          </TableCell>
                          <TableCell>{log.table_name}</TableCell>
                          <TableCell>
                            {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: pt })}
                          </TableCell>
                        </TableRow>
                      ))}
                      {auditLogs.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                            Nenhum log de auditoria encontrado
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Informações do Sistema</CardTitle>
                  <CardDescription>Estado atual do sistema</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Versão:</span>
                    <Badge>1.0.0</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Ambiente:</span>
                    <Badge variant="outline">Produção</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Base de dados:</span>
                    <Badge variant="default">Supabase</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Estatísticas</CardTitle>
                  <CardDescription>Resumo da utilização</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Utilizadores:</span>
                    <span className="font-medium">{settings.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Departamentos Ativos:</span>
                    <span className="font-medium">{departments.filter(d => d.is_active).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Configurações:</span>
                    <span className="font-medium">{settings.length}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
