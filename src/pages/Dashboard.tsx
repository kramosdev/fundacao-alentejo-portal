import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ModernHeader } from "@/components/ModernHeader";
import { QuickActions } from "@/components/QuickActions";
import { RealActivity } from "@/components/RealActivity";
import { EnhancedDashboard } from "@/components/EnhancedDashboard";
import { RealTimeUpdates } from "@/components/RealTimeUpdates";
import { DashboardCard } from "@/components/DashboardCard";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useRequests } from "@/hooks/useRequests";
import { BarChart3, BookOpen, HelpCircle } from "lucide-react";
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
      <ModernHeader />
      <RealTimeUpdates />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="h-72 bg-gradient-to-br from-primary via-primary-hover to-accent relative">
          {/* Decorative elements */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent"></div>
          <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-10 left-20 w-20 h-20 bg-white/5 rounded-full blur-lg"></div>
          
          <div className="container h-full flex items-center justify-between relative z-10">
            <div className="text-white space-y-4 animate-fade-up max-w-2xl">
              <div className="space-y-2">
                <p className="text-sm text-white/70 font-medium uppercase tracking-wider">
                  Portal de Gestão
                </p>
                <h1 className="text-5xl font-bold leading-tight">
                  Bem-vindo, {currentUser.name.split(' ')[0]}
                </h1>
                <p className="text-xl text-white/90 leading-relaxed">
                  {getWelcomeMessage()}
                </p>
              </div>
              <div className="flex items-center gap-6 text-sm text-white/80">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                  <span>{format(new Date(), "EEEE, d 'de' MMMM", { locale: pt })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                  <span>{format(new Date(), 'HH:mm', { locale: pt })}</span>
                </div>
              </div>
            </div>
            
            <div className="hidden lg:block text-white/70 text-right animate-fade-up space-y-4" style={{ animationDelay: '0.2s' }}>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="space-y-3">
                  <div className="text-xs font-medium uppercase tracking-wider">Sistema</div>
                  <div className="text-3xl font-bold text-white">Fundação Alentejo</div>
                  <div className="text-xs text-white/70">Portal de Gestão Integrado</div>
                  <div className="w-full h-px bg-white/20 my-3"></div>
                  <div className="text-xs">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="text-green-300">Operacional</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8 space-y-8">
        {/* Enhanced Dashboard with Real Data */}
        <div className="animate-fade-up">
          <EnhancedDashboard />
        </div>

        {/* Quick Actions */}
        <div className="animate-slide-right">
          <QuickActions userRole={currentUser.role} onActionClick={handleActionClick} />
        </div>

        {/* Real Activity and Additional Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <RealActivity />
          </div>
          
          <div className="space-y-6 animate-fade-up" style={{ animationDelay: '0.4s' }}>
            {/* Resources and Help */}
            <DashboardCard
              title="Centro de Recursos"
              description="Documentação, tutoriais e FAQ"
              icon={BookOpen}
              variant="accent"
            />
            
            <DashboardCard
              title="Suporte Técnico"
              description="Obtenha ajuda e suporte"
              icon={HelpCircle}
              variant="secondary"
            />
            
            <DashboardCard
              title="Relatórios Avançados"
              description="Analytics e insights detalhados"
              icon={BarChart3}
              variant="primary"
            />
          </div>
        </div>
      </div>

      {/* New Request Modal */}
      <Dialog open={openNewRequest} onOpenChange={setOpenNewRequest}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <NewRequestForm onSuccess={() => setOpenNewRequest(false)} onCancel={() => setOpenNewRequest(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}