import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/useAuth"
import { Header } from "@/components/Header"
import { DashboardCard } from "@/components/DashboardCard"
import { useNavigate } from 'react-router-dom'
import { 
  FileText, 
  AlertTriangle, 
  Eye, 
  CheckSquare, 
  Shield, 
  Users, 
  BarChart3, 
  Settings, 
  Search,
  Filter,
  ArrowLeft
} from "lucide-react"

const getAllActions = (userRole: 'user' | 'DGIEA' | 'direction' | 'admin') => {
  const baseActions = [
    {
      id: 'new-request',
      title: 'Nova Requisição',
      description: 'Submeter uma nova requisição',
      icon: FileText,
      category: 'requisitions',
      roles: ['user', 'DGIEA', 'direction', 'admin']
    },
    {
      id: 'report-incident',
      title: 'Reportar Incidente',
      description: 'Reportar problema técnico',
      icon: AlertTriangle,
      category: 'incidents',
      roles: ['user', 'DGIEA', 'direction', 'admin']
    },
    {
      id: 'my-requests',
      title: 'Minhas Requisições',
      description: 'Ver as suas requisições',
      icon: Eye,
      category: 'requisitions',
      roles: ['user', 'DGIEA', 'direction', 'admin']
    }
  ]

  const dgieaActions = [
    {
      id: 'review-requests',
      title: 'Analisar Requisições',
      description: 'Rever requisições pendentes',
      icon: CheckSquare,
      category: 'management',
      roles: ['DGIEA', 'admin']
    },
    {
      id: 'manage-incidents',
      title: 'Gerir Incidentes',
      description: 'Gerir incidentes técnicos',
      icon: AlertTriangle,
      category: 'management',
      roles: ['DGIEA', 'admin']
    }
  ]

  const directionActions = [
    {
      id: 'approve-requests',
      title: 'Aprovar Requisições',
      description: 'Aprovar ou rejeitar requisições',
      icon: Shield,
      category: 'management',
      roles: ['direction', 'admin']
    },
    {
      id: 'user-management',
      title: 'Gestão de Utilizadores',
      description: 'Gerir utilizadores e cargos',
      icon: Users,
      category: 'administration',
      roles: ['direction', 'admin']
    },
    {
      id: 'reports',
      title: 'Relatórios',
      description: 'Ver relatórios e estatísticas',
      icon: BarChart3,
      category: 'reports',
      roles: ['direction', 'admin']
    },
    {
      id: 'strategic-overview',
      title: 'Visão Estratégica',
      description: 'Dashboard executivo',
      icon: BarChart3,
      category: 'reports',
      roles: ['direction', 'admin']
    }
  ]

  const adminActions = [
    {
      id: 'system-admin',
      title: 'Administração do Sistema',
      description: 'Configurações do sistema',
      icon: Settings,
      category: 'administration',
      roles: ['admin']
    },
    {
      id: 'audit-logs',
      title: 'Logs de Auditoria',
      description: 'Ver logs do sistema',
      icon: Shield,
      category: 'administration',
      roles: ['admin']
    },
    {
      id: 'system-reports',
      title: 'Relatórios do Sistema',
      description: 'Relatórios técnicos',
      icon: BarChart3,
      category: 'reports',
      roles: ['admin']
    }
  ]

  return [...baseActions, ...dgieaActions, ...directionActions, ...adminActions]
    .filter(action => action.roles.includes(userRole))
}

const categories = {
  requisitions: { name: 'Requisições', color: 'bg-blue-100 text-blue-800' },
  incidents: { name: 'Incidentes', color: 'bg-red-100 text-red-800' },
  management: { name: 'Gestão', color: 'bg-purple-100 text-purple-800' },
  administration: { name: 'Administração', color: 'bg-orange-100 text-orange-800' },
  reports: { name: 'Relatórios', color: 'bg-green-100 text-green-800' }
}

export default function QuickActionsHub() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const mapRole = (dbRole: 'colaborador' | 'DGIEA' | 'direcao' | 'admin'): 'user' | 'DGIEA' | 'direction' | 'admin' => {
    switch (dbRole) {
      case 'colaborador': return 'user';
      case 'direcao': return 'direction';
      default: return dbRole;
    }
  };

  const userRole = profile ? mapRole(profile.role) : 'user'
  const allActions = getAllActions(userRole)

  const filteredActions = allActions.filter(action => {
    const matchesSearch = action.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         action.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || action.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleActionClick = (actionId: string) => {
    switch (actionId) {
      case 'new-request':
        navigate('/requests?new=true')
        break;
      case 'report-incident':
        navigate('/incidents?new=true')
        break;
      case 'my-requests':
        navigate('/requests')
        break;
      case 'review-requests':
        navigate('/requests?tab=todas')
        break;
      case 'manage-incidents':
        navigate('/incidents')
        break;
      case 'approve-requests':
        navigate('/requests?tab=todas')
        break;
      case 'user-management':
        navigate('/user-management')
        break;
      case 'reports':
        navigate('/reports')
        break;
      case 'strategic-overview':
        navigate('/strategic-dashboard')
        break;
      case 'system-admin':
        navigate('/admin')
        break;
      case 'audit-logs':
        navigate('/audit-logs')
        break;
      case 'system-reports':
        navigate('/system-reports')
        break;
      default:
        console.log('Unknown action:', actionId);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" onClick={() => navigate('/dashboard')} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Dashboard
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Todas as Ações Rápidas</h1>
          <p className="text-muted-foreground mt-2">Acesso rápido a todas as funcionalidades disponíveis</p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Pesquisar</label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Pesquisar ações..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Categoria</label>
                <div className="flex flex-wrap gap-2">
                  <Badge 
                    variant={selectedCategory === 'all' ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory('all')}
                  >
                    Todas
                  </Badge>
                  {Object.entries(categories).map(([key, category]) => (
                    <Badge 
                      key={key}
                      variant={selectedCategory === key ? 'default' : 'outline'}
                      className={`cursor-pointer ${selectedCategory === key ? category.color : ''}`}
                      onClick={() => setSelectedCategory(key)}
                    >
                      {category.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredActions.map((action) => (
            <DashboardCard
              key={action.id}
              title={action.title}
              description={action.description}
              icon={action.icon}
              variant="default"
              onClick={() => handleActionClick(action.id)}
              className="h-full"
            />
          ))}
        </div>

        {filteredActions.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma ação encontrada</h3>
              <p className="text-muted-foreground">
                Tente ajustar os filtros ou termos de pesquisa
              </p>
            </CardContent>
          </Card>
        )}

        {/* Statistics */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Estatísticas de Uso</CardTitle>
            <CardDescription>Resumo das suas atividades</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">12</div>
                <div className="text-sm text-muted-foreground">Requisições Este Mês</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">3</div>
                <div className="text-sm text-muted-foreground">Incidentes Reportados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">89%</div>
                <div className="text-sm text-muted-foreground">Taxa de Aprovação</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">2.3d</div>
                <div className="text-sm text-muted-foreground">Tempo Médio de Resposta</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}