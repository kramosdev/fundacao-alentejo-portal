import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, FileText, AlertTriangle, CheckCircle, XCircle, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ActivityItem {
  id: string;
  type: 'request' | 'incident' | 'approval' | 'user';
  title: string;
  description: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected' | 'in-progress' | 'completed';
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

interface RecentActivityProps {
  userRole: 'user' | 'DGIEA' | 'direction' | 'admin';
}

// Mock data - in real app this would come from API
const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'request',
    title: 'Requisição de Viatura',
    description: 'Pedido para viatura oficial para deslocação a Lisboa',
    timestamp: '2 horas atrás',
    status: 'pending',
    priority: 'medium'
  },
  {
    id: '2',
    type: 'incident',
    title: 'Problema de Conectividade',
    description: 'Falha na ligação à internet no piso 2',
    timestamp: '5 horas atrás',
    status: 'in-progress',
    priority: 'high'
  },
  {
    id: '3',
    type: 'approval',
    title: 'Pedido Aprovado',
    description: 'Requisição de material de escritório foi aprovada',
    timestamp: '1 dia atrás',
    status: 'approved',
    priority: 'low'
  },
  {
    id: '4',
    type: 'user',
    title: 'Novo Utilizador',
    description: 'João Silva registou-se na plataforma',
    timestamp: '2 dias atrás',
    status: 'completed',
    priority: 'low'
  }
];

export function RecentActivity({ userRole }: RecentActivityProps) {
  const navigate = useNavigate()
  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'request': return FileText;
      case 'incident': return AlertTriangle;
      case 'approval': return CheckCircle;
      case 'user': return Users;
      default: return Clock;
    }
  };

  const getStatusBadge = (status: ActivityItem['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-warning bg-warning/10">Pendente</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-success bg-success/10">Aprovado</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejeitado</Badge>;
      case 'in-progress':
        return <Badge variant="outline" className="text-accent bg-accent/10">Em Progresso</Badge>;
      case 'completed':
        return <Badge variant="outline" className="text-success bg-success/10">Concluído</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getPriorityColor = (priority: ActivityItem['priority']) => {
    switch (priority) {
      case 'critical': return 'border-l-destructive';
      case 'high': return 'border-l-warning';
      case 'medium': return 'border-l-accent';
      case 'low': return 'border-l-muted-foreground';
      default: return 'border-l-border';
    }
  };

  // Filter activities based on user role
  const getFilteredActivities = () => {
    switch (userRole) {
      case 'user':
        return mockActivities.filter(a => a.type === 'request' || a.type === 'approval');
      case 'DGIEA':
        return mockActivities.filter(a => a.type !== 'user');
      default:
        return mockActivities;
    }
  };

  const activities = getFilteredActivities();

  return (
    <Card className="portal-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Atividade Recente</CardTitle>
            <CardDescription>Últimas atualizações e eventos</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/requests')}>
            Ver Tudo
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nenhuma atividade recente</p>
          </div>
        ) : (
          activities.map((activity) => {
            const Icon = getIcon(activity.type);
            return (
              <div
                key={activity.id}
                className={`flex items-start space-x-4 p-4 rounded-lg border-l-4 bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer ${getPriorityColor(activity.priority)}`}
                onClick={() => navigate('/requests')}
              >
                <div className="flex-shrink-0">
                  <div className="p-2 rounded-lg bg-background border">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-foreground truncate">
                      {activity.title}
                    </p>
                    {getStatusBadge(activity.status)}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {activity.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activity.timestamp}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}