import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/useAuth"
import { Header } from "@/components/Header"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { Users, UserPlus, Edit, Shield, Ban, Trash2, Search, Filter } from "lucide-react"
import { Navigate } from 'react-router-dom'

interface User {
  id: string
  user_id: string
  full_name: string
  email: string
  role: 'colaborador' | 'DGIEA' | 'direcao' | 'admin'
  department?: string
  phone?: string
  is_active: boolean
  created_at: string
}

const roleLabels = {
  'colaborador': 'Colaborador',
  'DGIEA': 'DGIEA',
  'direcao': 'Direção',
  'admin': 'Administrador'
}

const roleColors = {
  'colaborador': 'bg-blue-100 text-blue-800',
  'DGIEA': 'bg-purple-100 text-purple-800',
  'direcao': 'bg-orange-100 text-orange-800',
  'admin': 'bg-red-100 text-red-800'
}

export default function UserManagement() {
  const { user, profile, loading } = useAuth()
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editForm, setEditForm] = useState({
    full_name: '',
    role: '',
    department: '',
    phone: ''
  })

  // Check if user is admin or direction
  if (!loading && (!profile || !['admin', 'direcao'].includes(profile.role))) {
    return <Navigate to="/dashboard" replace />
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    let filtered = users
    
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter)
    }
    
    setFilteredUsers(filtered)
  }, [users, searchTerm, roleFilter])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers((data || []) as User[])
    } catch (error: any) {
      toast({
        title: "Erro ao carregar utilizadores",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setEditForm({
      full_name: user.full_name,
      role: user.role,
      department: user.department || '',
      phone: user.phone || ''
    })
  }

  const handleUpdateUser = async () => {
    if (!editingUser) return

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editForm.full_name,
          role: editForm.role,
          department: editForm.department,
          phone: editForm.phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingUser.id)

      if (error) throw error

      toast({
        title: "Utilizador atualizado",
        description: "As informações do utilizador foram atualizadas com sucesso."
      })

      setEditingUser(null)
      fetchUsers()
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar utilizador",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !currentStatus })
        .eq('id', userId)

      if (error) throw error

      toast({
        title: currentStatus ? "Utilizador desativado" : "Utilizador ativado",
        description: `O utilizador foi ${currentStatus ? 'desativado' : 'ativado'} com sucesso.`
      })

      fetchUsers()
    } catch (error: any) {
      toast({
        title: "Erro ao alterar estado do utilizador",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading || loading) {
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
            <Users className="h-8 w-8" />
            Gestão de Utilizadores
          </h1>
          <p className="text-muted-foreground mt-2">Gerir utilizadores, cargos e permissões do sistema</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="search">Pesquisar</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Nome ou email..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Filtrar por Cargo</Label>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Cargos</SelectItem>
                    <SelectItem value="colaborador">Colaborador</SelectItem>
                    <SelectItem value="DGIEA">DGIEA</SelectItem>
                    <SelectItem value="direcao">Direção</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button variant="outline" onClick={fetchUsers} className="w-full">
                  Atualizar Lista
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Utilizadores ({filteredUsers.length})</CardTitle>
              <CardDescription>Lista de todos os utilizadores do sistema</CardDescription>
            </div>
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              Novo Utilizador
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilizador</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {getInitials(user.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.full_name}</p>
                          <p className="text-sm text-muted-foreground">{user.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge className={roleColors[user.role]}>
                          {roleLabels[user.role]}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.department || '-'}</TableCell>
                      <TableCell>
                        <Badge className={user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {user.is_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                            className={user.is_active ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}
                          >
                            {user.is_active ? <Ban className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredUsers.length === 0 && (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">Nenhum utilizador encontrado</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Edit User Dialog */}
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Utilizador</DialogTitle>
              <DialogDescription>
                Altere as informações do utilizador selecionado
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome Completo</Label>
                <Input
                  id="edit-name"
                  value={editForm.full_name}
                  onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-role">Cargo</Label>
                <Select value={editForm.role} onValueChange={(value) => setEditForm({...editForm, role: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="colaborador">Colaborador</SelectItem>
                    <SelectItem value="DGIEA">DGIEA</SelectItem>
                    <SelectItem value="direcao">Direção</SelectItem>
                    {profile?.role === 'admin' && (
                      <SelectItem value="admin">Administrador</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-department">Departamento</Label>
                <Select value={editForm.department} onValueChange={(value) => setEditForm({...editForm, department: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DGIEA">DGIEA</SelectItem>
                    <SelectItem value="Direção">Direção</SelectItem>
                    <SelectItem value="Recursos Humanos">Recursos Humanos</SelectItem>
                    <SelectItem value="Financeiro">Financeiro</SelectItem>
                    <SelectItem value="Tecnologias">Tecnologias</SelectItem>
                    <SelectItem value="Operações">Operações</SelectItem>
                    <SelectItem value="Segurança">Segurança</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Telefone</Label>
                <Input
                  id="edit-phone"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setEditingUser(null)}>
                  Cancelar
                </Button>
                <Button onClick={handleUpdateUser}>
                  Guardar Alterações
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}