import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/Header"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/lib/supabase"
import { Users, Database, Settings, CheckCircle, AlertCircle } from "lucide-react"
import { Navigate } from "react-router-dom"

export default function Admin() {
  const { user, profile, loading } = useAuth()
  const [isSeeding, setIsSeeding] = useState(false)
  const [seedResult, setSeedResult] = useState<any>(null)

  // Redirect if not admin
  if (!loading && (!user || profile?.role !== 'admin')) {
    return <Navigate to="/dashboard" replace />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const handleSeedUsers = async () => {
    setIsSeeding(true)
    setSeedResult(null)

    try {
      const { data, error } = await supabase.functions.invoke('seed-users')

      if (error) {
        setSeedResult({ success: false, message: error.message })
      } else {
        setSeedResult(data)
      }
    } catch (error: any) {
      setSeedResult({ success: false, message: error.message })
    } finally {
      setIsSeeding(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Administração</h1>
          <p className="text-muted-foreground mt-2">Gerir utilizadores e sistema</p>
        </div>

        <div className="grid gap-6">
          {/* Seed Users Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Utilizadores de Teste
              </CardTitle>
              <CardDescription>
                Criar utilizadores de exemplo para demonstração do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">Colaborador</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <strong>Email:</strong> colaborador@fundacao.pt<br />
                    <strong>Senha:</strong> fundacao123<br />
                    <strong>Nome:</strong> Maria Silva
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="bg-purple-100 text-purple-800">DGIEA</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <strong>Email:</strong> dgiea@fundacao.pt<br />
                    <strong>Senha:</strong> fundacao123<br />
                    <strong>Nome:</strong> João Santos
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="bg-orange-100 text-orange-800">Direção</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <strong>Email:</strong> direcao@fundacao.pt<br />
                    <strong>Senha:</strong> fundacao123<br />
                    <strong>Nome:</strong> Ana Costa
                  </p>
                </div>
              </div>

              <Button 
                onClick={handleSeedUsers} 
                disabled={isSeeding}
                className="w-full"
              >
                {isSeeding ? 'A criar utilizadores...' : 'Criar Utilizadores de Teste'}
              </Button>

              {seedResult && (
                <Alert className={seedResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                  {seedResult.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription className={seedResult.success ? 'text-green-800' : 'text-red-800'}>
                    {seedResult.message}
                    {seedResult.users && (
                      <div className="mt-2">
                        <strong>Utilizadores criados:</strong>
                        <ul className="mt-1">
                          {seedResult.users.map((user: any, index: number) => (
                            <li key={index}>• {user.email} ({user.role})</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* System Info */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Base de Dados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Estado:</span>
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      Operacional
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Tabelas:</span>
                    <span>5 configuradas</span>
                  </div>
                  <div className="flex justify-between">
                    <span>RLS:</span>
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      Ativo
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Sistema
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Versão:</span>
                    <span>1.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Autenticação:</span>
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      Ativa
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Notificações:</span>
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      Ativas
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}