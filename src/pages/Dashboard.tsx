import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { QuickActions } from "@/components/QuickActions";
import { RecentActivity } from "@/components/RecentActivity";
import { DashboardCard } from "@/components/DashboardCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { BarChart3, TrendingUp, Clock, CheckCircle } from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg";
import { NewRequestForm } from "@/components/forms/NewRequestForm";

export default function Dashboard() {
  const { user, profile, loading } = useAuth()
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [openNewRequest, setOpenNewRequest] = useState(false)

  // Redirect to login if not authenticated
  if (!loading && !user) {
    return <Navigate to="/login" replace />
  }

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Map database roles to component roles
  const mapRole = (dbRole: 'colaborador' | 'DGIEA' | 'direcao' | 'admin'): 'user' | 'DGIEA' | 'direction' | 'admin' => {
    switch (dbRole) {
      case 'colaborador': return 'user';
      case 'direcao': return 'direction';
      default: return dbRole;
    }
  };

  // Use profile data if available, otherwise fallback
  const currentUser = profile ? {
    name: profile.full_name,
    email: profile.email,
    role: mapRole(profile.role),
    avatar: profile.avatar_url
  } : {
    name: user?.email?.split('@')[0] || "Utilizador",
    email: user?.email || "",
    role: 'user' as const
  }

  const handleActionClick = (action: string) => {
    console.log('Action clicked:', action);
    // Handle navigation based on action
    switch (action) {
      case 'new-request':
        setOpenNewRequest(true)
        break;
        break;
      case 'report-incident':
        // Navigate to incident report form
        break;
      case 'my-requests':
        // Navigate to user requests page
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  const getWelcomeMessage = () => {
    switch (currentUser.role) {
      case 'DGIEA':
        return 'Gerir e processar pedidos da Fundação';
      case 'direction':
        return 'Supervisionar e aprovar decisões estratégicas';
      case 'admin':
        return 'Administrar o sistema e utilizadores';
      default:
        return 'Bem-vindo ao portal de serviços da Fundação';
    }
  };

  const getStatsCards = () => {
    switch (currentUser.role) {
      case 'DGIEA':
        return [
          { title: 'Pedidos Pendentes', value: '8', change: '+12%', icon: Clock },
          { title: 'Processados Hoje', value: '24', change: '+8%', icon: CheckCircle },
          { title: 'Taxa Aprovação', value: '89%', change: '+2%', icon: TrendingUp },
          { title: 'Tempo Médio', value: '2.4d', change: '-15%', icon: BarChart3 }
        ];
      case 'direction':
        return [
          { title: 'Aprovações Pendentes', value: '5', change: '-10%', icon: Clock },
          { title: 'Aprovados Este Mês', value: '156', change: '+18%', icon: CheckCircle },
          { title: 'Orçamento Utilizado', value: '67%', change: '+5%', icon: TrendingUp },
          { title: 'Satisfação', value: '4.8', change: '+0.2', icon: BarChart3 }
        ];
      default:
        return [
          { title: 'Pedidos Ativos', value: '2', change: '0%', icon: Clock },
          { title: 'Pedidos Aprovados', value: '15', change: '+25%', icon: CheckCircle },
          { title: 'Taxa Sucesso', value: '94%', change: '+3%', icon: TrendingUp },
          { title: 'Tempo Resposta', value: '1.8d', change: '-20%', icon: BarChart3 }
        ];
    }
  };

  const statsCards = getStatsCards();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div 
          className="h-48 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(33, 41, 60, 0.8), rgba(55, 125, 255, 0.6)), url(${heroBanner})`
          }}
        >
          <div className="container h-full flex items-center">
            <div className="text-white space-y-2 animate-fade-up">
              <h1 className="text-3xl font-bold">
                Bem-vindo, {currentUser.name.split(' ')[0]}
              </h1>
              <p className="text-lg text-white/90">
                {getWelcomeMessage()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8 space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => (
            <Card key={stat.title} className="portal-card animate-scale-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <p className={`text-xs ${stat.change.startsWith('+') ? 'text-success' : stat.change.startsWith('-') ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {stat.change} desde o último mês
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="animate-slide-right">
          <QuickActions userRole={currentUser.role} onActionClick={handleActionClick} />
        </div>

        {/* Recent Activity and Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <RecentActivity userRole={currentUser.role} />
          </div>
          
          <div className="space-y-6 animate-fade-up" style={{ animationDelay: '0.4s' }}>
            {/* Monthly Progress */}
            <Card className="portal-card">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Progresso Mensal</CardTitle>
                <CardDescription>Objetivos e metas de {new Date().toLocaleDateString('pt-PT', { month: 'long' })}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Pedidos Processados</span>
                    <span>78/100</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Satisfação Utilizadores</span>
                    <span>94%</span>
                  </div>
                  <Progress value={94} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Tempo Resposta</span>
                    <span>85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <DashboardCard
              title="Centro de Ajuda"
              description="Documentação e suporte técnico"
              icon={BarChart3}
              variant="accent"
            />
          </div>
        </div>
      </div>

      {/* New Request Modal */}
      <Dialog open={openNewRequest} onOpenChange={setOpenNewRequest}>
        <DialogContent className="max-w-2xl">
          <NewRequestForm onSuccess={() => setOpenNewRequest(false)} onCancel={() => setOpenNewRequest(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}