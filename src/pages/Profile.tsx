import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/useAuth"
import { Header } from "@/components/Header"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { User, Mail, Phone, Building, Shield, Calendar, Save } from "lucide-react"
import { format } from "date-fns"
import { pt } from "date-fns/locale"

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

export default function Profile() {
  const { user, profile, loading, updateProfile } = useAuth()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    department: '',
    avatar_url: ''
  })
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        department: profile.department || '',
        avatar_url: profile.avatar_url || ''
      })
    }
  }, [profile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          department: formData.department,
          avatar_url: formData.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user?.id)

      if (error) throw error

      toast({
        title: "Perfil atualizado",
        description: "As suas informações foram atualizadas com sucesso.",
      })

      // Refresh profile data
      window.location.reload()
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao atualizar o perfil.",
        variant: "destructive"
      })
    } finally {
      setIsUpdating(false)
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
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Perfil</h1>
          <p className="text-muted-foreground mt-2">Gerir as suas informações pessoais</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Summary */}
          <Card className="md:col-span-1">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                    {profile?.full_name ? getInitials(profile.full_name) : 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-xl">{profile?.full_name}</CardTitle>
              <CardDescription>{profile?.email}</CardDescription>
              <Badge className={roleColors[profile?.role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800'}>
                <Shield className="h-3 w-3 mr-1" />
                {roleLabels[profile?.role as keyof typeof roleLabels] || profile?.role}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span>{profile?.department || 'Departamento não definido'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{profile?.phone || 'Telefone não definido'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Membro desde {profile?.created_at ? format(new Date(profile.created_at), 'dd/MM/yyyy', { locale: pt }) : 'Data não disponível'}</span>
              </div>
            </CardContent>
          </Card>

          {/* Edit Profile Form */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Editar Perfil
              </CardTitle>
              <CardDescription>
                Atualize as suas informações pessoais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Nome Completo</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                      placeholder="Introduza o seu nome completo"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      O email não pode ser alterado
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="Introduza o seu telefone"
                    />
                  </div>

                   <div className="space-y-2">
                     <Label htmlFor="department">Departamento</Label>
                     <Input
                       id="department"
                       value={formData.department}
                       disabled
                       className="bg-muted"
                       placeholder="Definido pelo administrador"
                     />
                     <p className="text-xs text-muted-foreground">
                       O departamento é definido pelo administrador do sistema
                     </p>
                   </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="avatar_url">URL do Avatar</Label>
                  <Input
                    id="avatar_url"
                    type="url"
                    value={formData.avatar_url}
                    onChange={(e) => setFormData({...formData, avatar_url: e.target.value})}
                    placeholder="https://exemplo.com/avatar.jpg"
                  />
                  <p className="text-xs text-muted-foreground">
                    URL opcional para a sua foto de perfil
                  </p>
                </div>

                <div className="flex justify-end gap-4 pt-6">
                  <Button 
                    type="submit" 
                    disabled={isUpdating}
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {isUpdating ? 'A guardar...' : 'Guardar Alterações'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Account Information */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Informações da Conta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-sm font-medium">ID do Utilizador</Label>
                <p className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded">
                  {user?.id}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Estado da Conta</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-green-100 text-green-800">
                    {profile?.is_active ? 'Ativa' : 'Inativa'}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Data de Criação</Label>
                <p className="text-sm text-muted-foreground">
                  {profile?.created_at ? format(new Date(profile.created_at), 'dd \'de\' MMMM \'de\' yyyy', { locale: pt }) : 'Data não disponível'}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Última Atualização</Label>
                <p className="text-sm text-muted-foreground">
                  {profile?.updated_at ? format(new Date(profile.updated_at), 'dd \'de\' MMMM \'de\' yyyy', { locale: pt }) : 'Data não disponível'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}