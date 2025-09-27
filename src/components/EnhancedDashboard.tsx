import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  FileText, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  BarChart3,
  Calendar,
  Target
} from "lucide-react";
import { useRequests } from "@/hooks/useRequests";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { pt } from "date-fns/locale";

interface DashboardStats {
  totalRequests: number;
  totalIncidents: number;
  totalUsers: number;
  activeUsers: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  criticalIncidents: number;
  monthlyGrowth: number;
  weeklyActivity: number;
}

export function EnhancedDashboard() {
  const { requests } = useRequests();
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalRequests: 0,
    totalIncidents: 0,
    totalUsers: 0,
    activeUsers: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    criticalIncidents: 0,
    monthlyGrowth: 0,
    weeklyActivity: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Get current month dates
      const monthStart = startOfMonth(new Date());
      const monthEnd = endOfMonth(new Date());
      const weekAgo = subDays(new Date(), 7);
      
      // Fetch requests data
      const { data: requestsData } = await supabase
        .from('requests')
        .select('*');
      
      // Fetch incidents data
      const { data: incidentsData } = await supabase
        .from('incidents')
        .select('*');
      
      // Fetch users data
      const { data: usersData } = await supabase
        .from('profiles')
        .select('*');

      // Calculate stats
      const totalRequests = requestsData?.length || 0;
      const totalIncidents = incidentsData?.length || 0;
      const totalUsers = usersData?.length || 0;
      const activeUsers = usersData?.filter(u => u.is_active)?.length || 0;
      
      const pendingRequests = requestsData?.filter(r => 
        r.status === 'submetido' || r.status === 'em_analise_dgiea'
      )?.length || 0;
      
      const approvedRequests = requestsData?.filter(r => 
        r.status === 'aprovado'
      )?.length || 0;
      
      const rejectedRequests = requestsData?.filter(r => 
        r.status === 'rejeitado'
      )?.length || 0;
      
      const criticalIncidents = incidentsData?.filter(i => 
        i.priority === 'critica' && i.status !== 'resolvido'
      )?.length || 0;

      // Calculate monthly growth
      const thisMonthRequests = requestsData?.filter(r => 
        new Date(r.created_at) >= monthStart && new Date(r.created_at) <= monthEnd
      )?.length || 0;
      
      const lastMonthStart = subDays(monthStart, 30);
      const lastMonthEnd = subDays(monthEnd, 30);
      const lastMonthRequests = requestsData?.filter(r => 
        new Date(r.created_at) >= lastMonthStart && new Date(r.created_at) <= lastMonthEnd
      )?.length || 0;
      
      const monthlyGrowth = lastMonthRequests > 0 
        ? ((thisMonthRequests - lastMonthRequests) / lastMonthRequests) * 100 
        : 0;

      // Calculate weekly activity
      const weeklyActivity = requestsData?.filter(r => 
        new Date(r.created_at) >= weekAgo
      )?.length || 0;

      setStats({
        totalRequests,
        totalIncidents,
        totalUsers,
        activeUsers,
        pendingRequests,
        approvedRequests,
        rejectedRequests,
        criticalIncidents,
        monthlyGrowth,
        weeklyActivity
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    description, 
    icon: Icon, 
    trend, 
    trendValue, 
    variant = "default" 
  }: {
    title: string;
    value: string | number;
    description: string;
    icon: any;
    trend?: "up" | "down" | "neutral";
    trendValue?: string;
    variant?: "default" | "success" | "warning" | "destructive";
  }) => {
    const variantClasses = {
      default: "border-border",
      success: "border-success/20 bg-success/5",
      warning: "border-warning/20 bg-warning/5",
      destructive: "border-destructive/20 bg-destructive/5"
    };

    return (
      <Card className={`portal-card ${variantClasses[variant]}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <span>{description}</span>
            {trend && trendValue && (
              <div className={`flex items-center ${
                trend === "up" ? "text-success" : 
                trend === "down" ? "text-destructive" : 
                "text-muted-foreground"
              }`}>
                {trend === "up" ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : trend === "down" ? (
                  <TrendingDown className="h-3 w-3 mr-1" />
                ) : null}
                <span>{trendValue}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="portal-card">
            <CardHeader className="animate-pulse">
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent className="animate-pulse">
              <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Requisições"
          value={stats.totalRequests}
          description="Todas as requisições"
          icon={FileText}
          trend={stats.monthlyGrowth > 0 ? "up" : stats.monthlyGrowth < 0 ? "down" : "neutral"}
          trendValue={`${Math.abs(stats.monthlyGrowth).toFixed(1)}% vs mês anterior`}
        />
        
        <StatCard
          title="Incidentes Ativos"
          value={stats.totalIncidents}
          description="Incidentes reportados"
          icon={AlertTriangle}
          variant={stats.criticalIncidents > 0 ? "warning" : "default"}
        />
        
        <StatCard
          title="Utilizadores Ativos"
          value={stats.activeUsers}
          description={`${stats.totalUsers} total`}
          icon={Users}
          variant="success"
        />
        
        <StatCard
          title="Atividade Semanal"
          value={stats.weeklyActivity}
          description="Novas requisições esta semana"
          icon={TrendingUp}
        />
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Pendentes"
          value={stats.pendingRequests}
          description="Aguardam processamento"
          icon={Clock}
          variant="warning"
        />
        
        <StatCard
          title="Aprovadas"
          value={stats.approvedRequests}
          description="Requisições aprovadas"
          icon={CheckCircle}
          variant="success"
        />
        
        <StatCard
          title="Rejeitadas"
          value={stats.rejectedRequests}
          description="Requisições rejeitadas"
          icon={TrendingDown}
          variant="destructive"
        />
      </div>

      {/* Performance Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="portal-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Objetivos do Mês
            </CardTitle>
            <CardDescription>
              Progresso dos objetivos de {format(new Date(), 'MMMM yyyy', { locale: pt })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Meta de Requisições</span>
                <span>{stats.totalRequests}/100</span>
              </div>
              <Progress value={(stats.totalRequests / 100) * 100} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Taxa de Aprovação</span>
                <span>
                  {stats.totalRequests > 0 
                    ? Math.round((stats.approvedRequests / stats.totalRequests) * 100)
                    : 0}%
                </span>
              </div>
              <Progress 
                value={stats.totalRequests > 0 ? (stats.approvedRequests / stats.totalRequests) * 100 : 0} 
                className="h-2" 
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Eficiência de Resolução</span>
                <span>
                  {stats.totalRequests > 0 
                    ? Math.round(((stats.approvedRequests + stats.rejectedRequests) / stats.totalRequests) * 100)
                    : 0}%
                </span>
              </div>
              <Progress 
                value={stats.totalRequests > 0 ? ((stats.approvedRequests + stats.rejectedRequests) / stats.totalRequests) * 100 : 0} 
                className="h-2" 
              />
            </div>
          </CardContent>
        </Card>

        <Card className="portal-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Resumo de Atividade
            </CardTitle>
            <CardDescription>
              Visão geral da atividade do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Requisições Este Mês</span>
              <Badge variant="secondary">{stats.totalRequests}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Incidentes Críticos</span>
              <Badge variant={stats.criticalIncidents > 0 ? "destructive" : "secondary"}>
                {stats.criticalIncidents}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Crescimento Mensal</span>
              <Badge variant={stats.monthlyGrowth > 0 ? "default" : "secondary"}>
                {stats.monthlyGrowth > 0 ? "+" : ""}{stats.monthlyGrowth.toFixed(1)}%
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Utilizadores Ativos</span>
              <Badge variant="default">{stats.activeUsers}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}