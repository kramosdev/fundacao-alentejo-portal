import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/hooks/useAuth"
import { useRequests } from "@/hooks/useRequests"
import { Header } from "@/components/Header"
import { BarChart3, TrendingUp, TrendingDown, Clock, CheckCircle, Users, FileText, AlertTriangle } from "lucide-react"
import { format, subDays, startOfDay, endOfDay } from "date-fns"
import { pt } from "date-fns/locale"

export default function StrategicDashboard() {
  const { user, profile, loading } = useAuth()
  const { requests } = useRequests()
  const [timeframe, setTimeframe] = useState('30d')

  // Calculate metrics based on requests data
  const getMetrics = () => {
    const now = new Date()
    const daysBack = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90
    const fromDate = startOfDay(subDays(now, daysBack))
    
    const filteredRequests = requests.filter(r => new Date(r.created_at) >= fromDate)
    
    const approved = filteredRequests.filter(r => r.status === 'aprovado').length
    const total = filteredRequests.length
    const pending = filteredRequests.filter(r => !['aprovado', 'rejeitado'].includes(r.status)).length
    const avgProcessingTime = 2.5 // Mock data
    
    return {
      totalRequests: total,
      approvedRequests: approved,
      approvalRate: total > 0 ? Math.round((approved / total) * 100) : 0,
      pendingRequests: pending,
      avgProcessingTime,
      growth: 15 // Mock growth percentage
    }
  }

  const metrics = getMetrics()

  if (loading) {
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
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Visão Estratégica
          </h1>
          <p className="text-muted-foreground mt-2">
            Dashboard executivo com métricas e indicadores chave de performance
          </p>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="portal-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Requisições</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalRequests}</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 text-green-600" />
                +{metrics.growth}% vs mês anterior
              </div>
            </CardContent>
          </Card>

          <Card className="portal-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Aprovação</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.approvalRate}%</div>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${metrics.approvalRate}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="portal-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.avgProcessingTime}d</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingDown className="h-3 w-3 text-green-600" />
                -12% vs mês anterior
              </div>
            </CardContent>
          </Card>

          <Card className="portal-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.pendingRequests}</div>
              <Badge 
                className={metrics.pendingRequests <= 5 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
              >
                {metrics.pendingRequests <= 5 ? 'Sob Controlo' : 'Atenção Necessária'}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          <Card className="portal-card">
            <CardHeader>
              <CardTitle>Eficiência Operacional</CardTitle>
              <CardDescription>Indicadores chave de performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Produtividade da Equipa</span>
                  <span className="text-sm">87%</span>
                </div>
                <Progress value={87} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Satisfação dos Utilizadores</span>
                  <span className="text-sm">92%</span>
                </div>
                <Progress value={92} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Conformidade com SLA</span>
                  <span className="text-sm">95%</span>
                </div>
                <Progress value={95} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="portal-card">
            <CardHeader>
              <CardTitle>Análise de Tendências</CardTitle>
              <CardDescription>Evolução nos últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">Volume de Requisições</p>
                    <p className="text-sm text-muted-foreground">Crescimento consistente</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
                
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">Tempo de Resposta</p>
                    <p className="text-sm text-muted-foreground">Melhoria de 25%</p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-green-600" />
                </div>
                
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">Aprovações Automáticas</p>
                    <p className="text-sm text-muted-foreground">45% das requisições</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Department Performance */}
        <Card className="portal-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Performance por Departamento
            </CardTitle>
            <CardDescription>Análise comparativa da atividade departamental</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">DGIEA</div>
                <div className="text-sm text-muted-foreground">Processamento</div>
                <div className="mt-2">
                  <div className="text-lg font-semibold">124</div>
                  <div className="text-xs">Requisições processadas</div>
                </div>
                <Progress value={85} className="h-2 mt-2" />
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600">Direção</div>
                <div className="text-sm text-muted-foreground">Aprovação</div>
                <div className="mt-2">
                  <div className="text-lg font-semibold">78</div>
                  <div className="text-xs">Decisões tomadas</div>
                </div>
                <Progress value={92} className="h-2 mt-2" />
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">Utilizadores</div>
                <div className="text-sm text-muted-foreground">Submissões</div>
                <div className="mt-2">
                  <div className="text-lg font-semibold">156</div>
                  <div className="text-xs">Novas requisições</div>
                </div>
                <Progress value={78} className="h-2 mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Strategic Insights */}
        <Card className="portal-card">
          <CardHeader>
            <CardTitle>Insights Estratégicos</CardTitle>
            <CardDescription>Recomendações baseadas em dados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="font-medium text-green-600">Oportunidades</h4>
                <div className="space-y-2 text-sm">
                  <div className="p-2 bg-green-50 border border-green-200 rounded">
                    • Automatizar aprovações de baixo risco (economia de 30% no tempo)
                  </div>
                  <div className="p-2 bg-green-50 border border-green-200 rounded">
                    • Implementar templates para requisições frequentes
                  </div>
                  <div className="p-2 bg-green-50 border border-green-200 rounded">
                    • Expandir sistema para outros departamentos
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-yellow-600">Áreas de Atenção</h4>
                <div className="space-y-2 text-sm">
                  <div className="p-2 bg-yellow-50 border border-yellow-200 rounded">
                    • Picos de volume nas sextas-feiras (+40%)
                  </div>
                  <div className="p-2 bg-yellow-50 border border-yellow-200 rounded">
                    • Requisições de material levam mais tempo a processar
                  </div>
                  <div className="p-2 bg-yellow-50 border border-yellow-200 rounded">
                    • 15% das requisições precisam de clarificação adicional
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}