import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, AlertTriangle, CheckCircle, Users, TrendingUp } from "lucide-react"
import { useRealStats } from "@/hooks/useRealStats"

export function RealStats() {
  const { stats, loading } = useRealStats()

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted animate-pulse rounded w-24" />
              <div className="h-4 w-4 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted animate-pulse rounded mb-2" />
              <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const statCards = [
    {
      title: "Total Requisições",
      value: stats.totalRequests,
      description: `${stats.pendingRequests} pendentes`,
      icon: FileText,
      color: "text-blue-600"
    },
    {
      title: "Taxa Aprovação",
      value: `${stats.approvalRate}%`,
      description: `${stats.approvedRequests} aprovadas`,
      icon: CheckCircle,
      color: "text-green-600"
    },
    {
      title: "Incidentes Ativos",
      value: stats.openIncidents,
      description: `${stats.resolvedIncidents} resolvidos`,
      icon: AlertTriangle,
      color: "text-orange-600"
    },
    {
      title: "Utilizadores",
      value: stats.totalUsers,
      description: `${stats.activeUsers} ativos`,
      icon: Users,
      color: "text-purple-600"
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-2">{stat.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}