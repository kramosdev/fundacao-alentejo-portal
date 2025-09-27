import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { QuickActions } from "@/components/QuickActions";
import { RealActivity } from "@/components/RealActivity";
import { RealStats } from "@/components/RealStats";
import { DashboardCard } from "@/components/DashboardCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useRequests } from "@/hooks/useRequests";
import { BarChart3, TrendingUp, Clock, CheckCircle } from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg";
import { NewRequestForm } from "@/components/forms/NewRequestForm";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

export default function Dashboard() {
  const { user, profile, loading } = useAuth()
  const { requests } = useRequests()
  const navigate = useNavigate()
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
      case 'report-incident':
        navigate('/incidents?new=true')
        break;
      case 'my-requests':
        navigate('/requests')
        break;
      case 'review-requests':
        navigate('/requests?tab=todas')
        break;
      case 'approve-requests':
        navigate('/requests?tab=todas')
        break;
      case 'system-admin':
        navigate('/admin')
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
      case 'audit-logs':
        navigate('/reports')
        break;
      case 'system-reports':
        navigate('/system-reports')
        break;
      case 'manage-incidents':
        navigate('/incidents')
        break;
      case 'view-all-actions':
        navigate('/quick-actions')
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


  return (
    <div className="min-h-screen bg-background">
      <Header />
      
        {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div 
          className="h-64 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(33, 41, 60, 0.85), rgba(55, 125, 255, 0.7)), url(${heroBanner})`
          }}
        >
          <div className="container h-full flex items-center justify-between">
            <div className="text-white space-y-3 animate-fade-up">
              <h1 className="text-4xl font-bold">
                Bem-vindo, {currentUser.name.split(' ')[0]}
              </h1>
              <p className="text-xl text-white/90">
                {getWelcomeMessage()}
              </p>
              <div className="text-sm text-white/80 space-y-1">
                <p>📅 Hoje: {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: pt })}</p>
                <p>🕐 {format(new Date(), 'HH:mm', { locale: pt })}</p>
              </div>
            </div>
            <div className="hidden md:block text-white/60 text-right animate-fade-up" style={{ animationDelay: '0.2s' }}>
              <div className="space-y-2">
                <div className="text-sm">Sistema de Gestão</div>
                <div className="text-2xl font-bold">FGA</div>
                <div className="text-xs">Fundação Gestão Alentejo</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8 space-y-8">
        {/* Stats Overview - Real Data */}
        <RealStats />

        {/* Quick Actions */}
        <div className="animate-slide-right">
          <QuickActions userRole={currentUser.role} onActionClick={handleActionClick} />
        </div>

        {/* Real Activity from Database */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <RealActivity />
          </div>
          
          <div className="space-y-6 animate-fade-up" style={{ animationDelay: '0.4s' }}>
            {/* Monthly Progress - Real Data */}
            <Card className="portal-card">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Progresso Mensal</CardTitle>
                <CardDescription>Objetivos e metas de {format(new Date(), 'MMMM', { locale: pt })}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Requisições Este Mês</span>
                    <span>{Math.min(requests?.length || 0, 50)}/50</span>
                  </div>
                  <Progress value={Math.min(((requests?.length || 0) / 50) * 100, 100)} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Taxa de Aprovação</span>
                    <span>{requests?.length > 0 ? Math.round((requests.filter(r => r.status === 'aprovado').length / requests.length) * 100) : 0}%</span>
                  </div>
                  <Progress value={requests?.length > 0 ? (requests.filter(r => r.status === 'aprovado').length / requests.length) * 100 : 0} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Eficiência do Sistema</span>
                    <span>{Math.round(((requests?.filter(r => r.status !== 'submetido').length || 0) / Math.max(requests?.length || 1, 1)) * 100)}%</span>
                  </div>
                  <Progress value={((requests?.filter(r => r.status !== 'submetido').length || 0) / Math.max(requests?.length || 1, 1)) * 100} className="h-2" />
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