import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useRequests } from "@/hooks/useRequests";
import { Clock, FileText, CheckCircle, TrendingUp, Users, AlertTriangle, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function RealStats() {
  const { user, profile } = useAuth()
  const { requests } = useRequests()
  const navigate = useNavigate()

  if (!user) return null

  const userRequests = requests.filter(r => r.user_id === user.id)
  const pendingCount = requests.filter(r => r.status === 'submetido').length
  const todayProcessed = requests.filter(r => {
    const today = new Date().toDateString()
    return new Date(r.updated_at).toDateString() === today && r.status !== 'submetido'
  }).length

  const getStatsForRole = () => {
    switch (profile?.role) {
      case 'DGIEA':
        const dgieaPending = requests.filter(r => r.status === 'submetido').length
        const dgieaToday = requests.filter(r => {
          const today = new Date().toDateString()
          return new Date(r.updated_at).toDateString() === today && r.dgiea_user_id
        }).length
        const approvalRate = requests.length > 0 ? Math.round((requests.filter(r => r.status === 'aprovado').length / requests.length) * 100) : 0
        
        return [
          { title: 'Pedidos Pendentes', value: dgieaPending.toString(), change: '+12%', icon: Clock, color: 'text-orange-600' },
          { title: 'Processados Hoje', value: dgieaToday.toString(), change: '+8%', icon: CheckCircle, color: 'text-green-600' },
          { title: 'Taxa Aprovação', value: `${approvalRate}%`, change: '+2%', icon: TrendingUp, color: 'text-blue-600' },
          { title: 'Total Requisições', value: requests.length.toString(), change: '+15%', icon: BarChart3, color: 'text-purple-600' }
        ]

      case 'direcao':
        const directionPending = requests.filter(r => r.status === 'enviado_direcao').length
        const monthlyApproved = requests.filter(r => {
          const thisMonth = new Date().getMonth()
          return new Date(r.updated_at).getMonth() === thisMonth && r.status === 'aprovado'
        }).length
        const satisfactionRate = 94 // Mock data
        
        return [
          { title: 'Aprovações Pendentes', value: directionPending.toString(), change: '-10%', icon: Clock, color: 'text-orange-600' },
          { title: 'Aprovados Este Mês', value: monthlyApproved.toString(), change: '+18%', icon: CheckCircle, color: 'text-green-600' },
          { title: 'Taxa Satisfação', value: `${satisfactionRate}%`, change: '+5%', icon: TrendingUp, color: 'text-blue-600' },
          { title: 'Total Sistema', value: requests.length.toString(), change: '+20%', icon: BarChart3, color: 'text-purple-600' }
        ]

      case 'admin':
        const totalUsers = 3 // Mock data
        const systemUptime = 99.9 // Mock data
        
        return [
          { title: 'Total Utilizadores', value: totalUsers.toString(), change: '+50%', icon: Users, color: 'text-blue-600' },
          { title: 'Requisições Ativas', value: requests.filter(r => r.status !== 'aprovado' && r.status !== 'rejeitado').length.toString(), change: '+12%', icon: Clock, color: 'text-orange-600' },
          { title: 'Sistema Uptime', value: `${systemUptime}%`, change: '0%', icon: TrendingUp, color: 'text-green-600' },
          { title: 'Total Requisições', value: requests.length.toString(), change: '+25%', icon: BarChart3, color: 'text-purple-600' }
        ]

      default: // colaborador
        const activeRequests = userRequests.filter(r => r.status !== 'aprovado' && r.status !== 'rejeitado').length
        const approvedRequests = userRequests.filter(r => r.status === 'aprovado').length
        const successRate = userRequests.length > 0 ? Math.round((approvedRequests / userRequests.length) * 100) : 0
        
        return [
          { title: 'Pedidos Ativos', value: activeRequests.toString(), change: '0%', icon: Clock, color: 'text-orange-600' },
          { title: 'Pedidos Aprovados', value: approvedRequests.toString(), change: '+25%', icon: CheckCircle, color: 'text-green-600' },
          { title: 'Taxa Sucesso', value: `${successRate}%`, change: '+3%', icon: TrendingUp, color: 'text-blue-600' },
          { title: 'Total Submetidos', value: userRequests.length.toString(), change: '+20%', icon: BarChart3, color: 'text-purple-600' }
        ]
    }
  }

  const statsCards = getStatsForRole()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsCards.map((stat, index) => (
        <Card key={stat.title} className="portal-card animate-scale-up hover:shadow-lg transition-all duration-300" style={{ animationDelay: `${index * 0.1}s` }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <p className={`text-xs ${stat.change.startsWith('+') ? 'text-green-600' : stat.change.startsWith('-') ? 'text-red-600' : 'text-muted-foreground'}`}>
              {stat.change} desde o último mês
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}