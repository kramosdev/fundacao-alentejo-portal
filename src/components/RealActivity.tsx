import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useRequests } from "@/hooks/useRequests";
import { Clock, FileText, CheckCircle, TrendingUp, Users, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function RealActivity() {
  const { user, profile } = useAuth()
  const { requests } = useRequests()
  const navigate = useNavigate()

  if (!user) return null

  // Get user's recent requests
  const userRequests = requests.filter(r => r.user_id === user.id).slice(0, 5)
  
  // For DGIEA/Direction, show all recent requests
  const roleRequests = profile?.role === 'DGIEA' || profile?.role === 'direcao' || profile?.role === 'admin' 
    ? requests.slice(0, 5) 
    : userRequests

  const getIcon = (type: string) => {
    switch (type) {
      case 'viatura': return FileText;
      case 'alimentacao': return AlertTriangle;
      case 'material': return CheckCircle;
      default: return Clock;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submetido':
        return <Badge variant="outline" className="text-yellow-700 bg-yellow-100">Submetido</Badge>;
      case 'em_analise_dgiea':
        return <Badge variant="outline" className="text-blue-700 bg-blue-100">Em Análise</Badge>;
      case 'enviado_direcao':
        return <Badge variant="outline" className="text-purple-700 bg-purple-100">Enviado à Direção</Badge>;
      case 'aprovado':
        return <Badge variant="outline" className="text-green-700 bg-green-100">Aprovado</Badge>;
      case 'rejeitado':
        return <Badge variant="destructive">Rejeitado</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critica': return 'border-l-red-500';
      case 'alta': return 'border-l-orange-500';
      case 'media': return 'border-l-blue-500';
      case 'baixa': return 'border-l-gray-400';
      default: return 'border-l-gray-300';
    }
  };

  return (
    <Card className="portal-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Atividade Recente</CardTitle>
            <CardDescription>
              {profile?.role === 'colaborador' ? 'As suas últimas requisições' : 'Últimas requisições no sistema'}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/all-activity')}>
            Ver Tudo
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {roleRequests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nenhuma atividade recente</p>
          </div>
        ) : (
          roleRequests.map((request) => {
            const Icon = getIcon(request.type);
            return (
              <div
                key={request.id}
                className={`flex items-start space-x-4 p-4 rounded-lg border-l-4 bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer ${getPriorityColor(request.priority)}`}
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
                      {request.title}
                    </p>
                    {getStatusBadge(request.status)}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                    {request.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {new Date(request.created_at).toLocaleDateString('pt-PT')}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {request.type}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}