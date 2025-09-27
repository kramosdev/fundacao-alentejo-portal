import { Button } from "@/components/ui/button";
import { DashboardCard } from "./DashboardCard";
import { Plus, AlertTriangle, FileText, Clock, Users, BarChart3 } from "lucide-react";

interface QuickActionsProps {
  userRole: 'user' | 'DGIEA' | 'direction' | 'admin';
  onActionClick: (action: string) => void;
}

export function QuickActions({ userRole, onActionClick }: QuickActionsProps) {
  const getUserActions = () => {
    switch (userRole) {
      case 'DGIEA':
        return [
          {
            id: 'review-requests',
            title: 'Pedidos Pendentes',
            description: 'Rever e processar pedidos submetidos',
            icon: FileText,
            variant: 'primary' as const,
            count: '3 novos'
          },
          {
            id: 'manage-incidents',
            title: 'Gerir Incidentes',
            description: 'Acompanhar incidentes reportados',
            icon: AlertTriangle,
            variant: 'accent' as const,
            count: '1 crítico'
          },
          {
            id: 'user-management',
            title: 'Gestão de Utilizadores',
            description: 'Administrar contas e permissões',
            icon: Users,
            variant: 'secondary' as const
          }
        ];
      
      case 'direction':
        return [
          {
            id: 'approve-requests',
            title: 'Aprovar Pedidos',
            description: 'Decisões finais sobre pedidos',
            icon: FileText,
            variant: 'primary' as const,
            count: '2 aguardam'
          },
          {
            id: 'reports',
            title: 'Relatórios',
            description: 'Análises e estatísticas',
            icon: BarChart3,
            variant: 'accent' as const
          },
          {
            id: 'strategic-overview',
            title: 'Visão Estratégica',
            description: 'Dashboard executivo',
            icon: BarChart3,
            variant: 'secondary' as const
          }
        ];
      
      case 'admin':
        return [
          {
            id: 'system-admin',
            title: 'Administração',
            description: 'Configurações do sistema',
            icon: Users,
            variant: 'primary' as const
          },
          {
            id: 'audit-logs',
            title: 'Logs de Auditoria',
            description: 'Registo de atividades',
            icon: FileText,
            variant: 'accent' as const
          },
          {
            id: 'system-reports',
            title: 'Relatórios Sistema',
            description: 'Performance e utilização',
            icon: BarChart3,
            variant: 'secondary' as const
          }
        ];
      
      default: // user
        return [
          {
            id: 'new-request',
            title: 'Nova Requisição',
            description: 'Submeter novo pedido à fundação',
            icon: Plus,
            variant: 'primary' as const
          },
          {
            id: 'report-incident',
            title: 'Reportar Incidente',
            description: 'Comunicar problema ou incidente',
            icon: AlertTriangle,
            variant: 'accent' as const
          },
          {
            id: 'my-requests',
            title: 'Os Meus Pedidos',
            description: 'Consultar estado dos seus pedidos',
            icon: Clock,
            variant: 'secondary' as const,
            count: '1 ativo'
          }
        ];
    }
  };

  const actions = getUserActions();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-foreground">Ações Rápidas</h2>
        <Button variant="outline" size="sm" onClick={() => onActionClick('view-all-actions')}>
          Ver Todas
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {actions.map((action) => (
          <DashboardCard
            key={action.id}
            title={action.title}
            description={action.description}
            icon={action.icon}
            variant={action.variant}
            onClick={() => onActionClick(action.id)}
            className="transition-all duration-300 hover:scale-105"
          >
            {action.count && (
              <div className="flex items-center justify-between pt-4">
                <span className="text-sm text-muted-foreground">{action.count}</span>
                <Button variant="ghost" size="sm" className="h-8 px-3" onClick={() => onActionClick(action.id)}>
                  Ver →
                </Button>
              </div>
            )}
          </DashboardCard>
        ))}
      </div>
    </div>
  );
}