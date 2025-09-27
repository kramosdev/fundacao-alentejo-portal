import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/useAuth"
import { Header } from "@/components/Header"
import { supabase } from "@/lib/supabase"
import { BarChart3, TrendingUp, Clock, CheckCircle, XCircle, AlertTriangle, Users, FileText, Download } from "lucide-react"
import { Navigate } from 'react-router-dom'
import { format, subDays, startOfDay, endOfDay } from "date-fns"
import { pt } from "date-fns/locale"

interface Statistics {
  totalRequests: number
  approvedRequests: number
  rejectedRequests: number
  pendingRequests: number
  averageProcessingTime: number
  requestsByType: Record<string, number>
  requestsByPriority: Record<string, number>
  userActivity: Record<string, number>
}

export default function Reports() {
  const { user, profile, loading } = useAuth()
  const [statistics, setStatistics] = useState<Statistics>({
    totalRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    pendingRequests: 0,
    averageProcessingTime: 0,
    requestsByType: {},
    requestsByPriority: {},
    userActivity: {}
  })
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30')

  // Redirect if not authorized
  if (!loading && (!profile || !['DGIEA', 'direcao', 'admin'].includes(profile.role))) {
    return <Navigate to="/dashboard" replace />
  }

  useEffect(() => {
    fetchStatistics()
  }, [dateRange])

  const fetchStatistics = async () => {
    try {
      setIsLoading(true)
      const daysBack = parseInt(dateRange)
      const fromDate = startOfDay(subDays(new Date(), daysBack))
      const toDate = endOfDay(new Date())

      // Fetch requests data
      const { data: requests, error } = await supabase
        .from('requests')
        .select('*')
        .gte('created_at', fromDate.toISOString())
        .lte('created_at', toDate.toISOString())

      if (error) throw error

      // Calculate statistics
      const stats: Statistics = {
        totalRequests: requests?.length || 0,
        approvedRequests: requests?.filter(r => r.status === 'aprovado').length || 0,
        rejectedRequests: requests?.filter(r => r.status === 'rejeitado').length || 0,
        pendingRequests: requests?.filter(r => !['aprovado', 'rejeitado'].includes(r.status)).length || 0,
        averageProcessingTime: 0,
        requestsByType: {},
        requestsByPriority: {},
        userActivity: {}
      }

      // Group by type
      requests?.forEach(request => {
        stats.requestsByType[request.type] = (stats.requestsByType[request.type] || 0) + 1
        stats.requestsByPriority[request.priority] = (stats.requestsByPriority[request.priority] || 0) + 1
      })

      // Calculate average processing time for completed requests
      const completedRequests = requests?.filter(r => 
        ['aprovado', 'rejeitado'].includes(r.status) && 
        (r.direction_processed_at || r.dgiea_processed_at)
      ) || []

      if (completedRequests.length > 0) {
        const totalTime = completedRequests.reduce((sum, request) => {
          const processedAt = request.direction_processed_at || request.dgiea_processed_at
          const createdAt = new Date(request.created_at)
          const processedDate = new Date(processedAt)
          return sum + (processedDate.getTime() - createdAt.getTime())
        }, 0)
        
        stats.averageProcessingTime = Math.round(totalTime / completedRequests.length / (1000 * 60 * 60 * 24))
      }

      setStatistics(stats)
    } catch (error: any) {
      console.error('Error fetching statistics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getApprovalRate = () => {
    const total = statistics.approvedRequests + statistics.rejectedRequests
    return total > 0 ? Math.round((statistics.approvedRequests / total) * 100) : 0
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      'baixa': 'bg-blue-500',
      'media': 'bg-yellow-500',
      'alta': 'bg-orange-500',
      'critica': 'bg-red-500'
    }
    return colors[priority as keyof typeof colors] || 'bg-gray-500'
  }

  const getTypeLabel = (type: string) => {
    const labels = {
      'viatura': 'Viatura',
      'alimentacao': 'Alimentação',
      'material': 'Material',
      'outro': 'Outro'
    }
    return labels[type as keyof typeof labels] || type
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <BarChart3 className="h-8 w-8" />
                Relatórios e Análises
              </h1>
              <p className="text-muted-foreground mt-2">Análise detalhada das requisições e atividade do sistema</p>
            </div>
            
            <div className="flex items-center gap-4">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Últimos 7 dias</SelectItem>
                  <SelectItem value="30">Últimos 30 dias</SelectItem>
                  <SelectItem value="90">Últimos 90 dias</SelectItem>
                  <SelectItem value="365">Último ano</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Requisições</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalRequests}</div>
              <p className="text-xs text-muted-foreground">
                Nos últimos {dateRange} dias
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Aprovação</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getApprovalRate()}%</div>
              <p className="text-xs text-muted-foreground">
                {statistics.approvedRequests} aprovadas de {statistics.approvedRequests + statistics.rejectedRequests}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.averageProcessingTime}d</div>
              <p className="text-xs text-muted-foreground">
                Tempo de processamento
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.pendingRequests}</div>
              <p className="text-xs text-muted-foreground">
                Aguardam processamento
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          {/* Requests by Status */}
          <Card>
            <CardHeader>
              <CardTitle>Estado das Requisições</CardTitle>
              <CardDescription>Distribuição por estado atual</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Aprovadas
                  </span>
                  <span>{statistics.approvedRequests}</span>
                </div>
                <Progress 
                  value={statistics.totalRequests > 0 ? (statistics.approvedRequests / statistics.totalRequests) * 100 : 0} 
                  className="h-2"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    Rejeitadas
                  </span>
                  <span>{statistics.rejectedRequests}</span>
                </div>
                <Progress 
                  value={statistics.totalRequests > 0 ? (statistics.rejectedRequests / statistics.totalRequests) * 100 : 0} 
                  className="h-2"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    Pendentes
                  </span>
                  <span>{statistics.pendingRequests}</span>
                </div>
                <Progress 
                  value={statistics.totalRequests > 0 ? (statistics.pendingRequests / statistics.totalRequests) * 100 : 0} 
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Requests by Type */}
          <Card>
            <CardHeader>
              <CardTitle>Requisições por Tipo</CardTitle>
              <CardDescription>Distribuição por categoria</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(statistics.requestsByType).map(([type, count]) => (
                  <div key={type} className="flex justify-between items-center">
                    <span className="text-sm font-medium">{getTypeLabel(type)}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{count}</span>
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ 
                            width: statistics.totalRequests > 0 ? `${(count / statistics.totalRequests) * 100}%` : '0%' 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Requests by Priority */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Distribuição por Prioridade</CardTitle>
            <CardDescription>Análise das prioridades das requisições</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              {Object.entries(statistics.requestsByPriority).map(([priority, count]) => (
                <div key={priority} className="text-center">
                  <div className={`w-12 h-12 rounded-full ${getPriorityColor(priority)} mx-auto mb-2 flex items-center justify-center text-white font-bold`}>
                    {count}
                  </div>
                  <div className="text-sm font-medium capitalize">{priority}</div>
                  <div className="text-xs text-muted-foreground">
                    {statistics.totalRequests > 0 ? Math.round((count / statistics.totalRequests) * 100) : 0}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Insights de Performance
            </CardTitle>
            <CardDescription>Análise do desempenho do sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <h4 className="font-medium">Eficiência do Processo</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Taxa de Aprovação</span>
                    <Badge className={getApprovalRate() >= 80 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {getApprovalRate()}%
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Tempo Médio de Resposta</span>
                    <Badge className={statistics.averageProcessingTime <= 3 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {statistics.averageProcessingTime} dias
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Requisições Pendentes</span>
                    <Badge className={statistics.pendingRequests <= 5 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {statistics.pendingRequests}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Recomendações</h4>
                <div className="space-y-2 text-sm">
                  {getApprovalRate() < 70 && (
                    <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
                      • Baixa taxa de aprovação - rever critérios de avaliação
                    </div>
                  )}
                  {statistics.averageProcessingTime > 7 && (
                    <div className="p-2 bg-orange-50 border border-orange-200 rounded text-orange-800">
                      • Tempo de processamento elevado - otimizar fluxo de trabalho
                    </div>
                  )}
                  {statistics.pendingRequests > 10 && (
                    <div className="p-2 bg-red-50 border border-red-200 rounded text-red-800">
                      • Muitas requisições pendentes - aumentar capacidade de processamento
                    </div>
                  )}
                  {getApprovalRate() >= 70 && statistics.averageProcessingTime <= 7 && statistics.pendingRequests <= 10 && (
                    <div className="p-2 bg-green-50 border border-green-200 rounded text-green-800">
                      • Sistema a funcionar de forma eficiente! 🎉
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}