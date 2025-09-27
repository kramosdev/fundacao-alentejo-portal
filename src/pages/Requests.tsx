import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { ModernHeader } from "@/components/ModernHeader";
import { RealTimeUpdates } from "@/components/RealTimeUpdates";
import { RequestList } from "@/components/RequestList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useRequests } from "@/hooks/useRequests";
import { FileText, Plus, TrendingUp, Clock, CheckCircle, XCircle } from "lucide-react";
import { NewRequestForm } from "@/components/forms/NewRequestForm";

export default function Requests() {
  const { user, profile, loading } = useAuth();
  const { requests } = useRequests();
  const [openNewRequest, setOpenNewRequest] = useState(false);

  // Redirect to login if not authenticated
  if (!loading && !user) {
    return <Navigate to="/login" replace />;
  }

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Filter requests based on user role
  const userRequests = requests?.filter(req => req.user_id === user?.id) || [];
  const allRequests = requests || [];
  
  // Calculate counts
  const pendingCount = requests?.filter(r => 
    r.status === 'submetido' || r.status === 'em_analise_dgiea'
  )?.length || 0;
  
  const approvedCount = requests?.filter(r => r.status === 'aprovado')?.length || 0;
  const rejectedCount = requests?.filter(r => r.status === 'rejeitado')?.length || 0;
  const processedCount = approvedCount + rejectedCount;

  return (
    <div className="min-h-screen bg-background">
      <ModernHeader />
      <RealTimeUpdates />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 max-w-7xl">
        {/* Header Section - Responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Requisições</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Gerir e acompanhar todas as requisições do sistema
            </p>
          </div>
          <Button 
            onClick={() => setOpenNewRequest(true)} 
            className="btn-primary w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Requisição
          </Button>
        </div>

        {/* Stats Cards - Responsive Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="portal-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Total</CardTitle>
              <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold">{requests?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Todas as requisições
              </p>
            </CardContent>
          </Card>

          <Card className="portal-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Pendentes</CardTitle>
              <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-warning">{pendingCount}</div>
              <p className="text-xs text-muted-foreground">
                Aguardam processamento
              </p>
            </CardContent>
          </Card>

          <Card className="portal-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Aprovadas</CardTitle>
              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-success">{approvedCount}</div>
              <p className="text-xs text-muted-foreground">
                Requisições aprovadas
              </p>
            </CardContent>
          </Card>

          <Card className="portal-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Rejeitadas</CardTitle>
              <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-destructive">{rejectedCount}</div>
              <p className="text-xs text-muted-foreground">
                Requisições rejeitadas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Requests Table - Responsive */}
        <Card className="portal-card">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <FileText className="h-5 w-5" />
              Gestão de Requisições
            </CardTitle>
            <CardDescription className="text-sm">
              Visualizar e gerir todas as requisições por status
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <Tabs defaultValue="minhas" className="w-full">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-4 h-auto">
                <TabsTrigger value="minhas" className="text-xs sm:text-sm">Minhas ({userRequests.length})</TabsTrigger>
                <TabsTrigger value="todas" className="text-xs sm:text-sm">Todas ({requests?.length || 0})</TabsTrigger>
                <TabsTrigger value="pendentes" className="text-xs sm:text-sm">Pendentes ({pendingCount})</TabsTrigger>
                <TabsTrigger value="processadas" className="text-xs sm:text-sm">Processadas ({processedCount})</TabsTrigger>
              </TabsList>

              <TabsContent value="minhas" className="space-y-4">
                {userRequests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Não tem requisições submetidas</p>
                  </div>
                ) : (
                  <RequestList userRole={profile?.role || 'colaborador'} showUserColumn={false} />
                )}
              </TabsContent>

              <TabsContent value="todas" className="space-y-4">
                {allRequests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Não há requisições no sistema</p>
                  </div>
                ) : (
                  <RequestList userRole={profile?.role || 'colaborador'} showUserColumn={true} />
                )}
              </TabsContent>

              <TabsContent value="pendentes" className="space-y-4">
                {pendingCount === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Não há requisições pendentes</p>
                  </div>
                ) : (
                  <RequestList userRole={profile?.role || 'colaborador'} showUserColumn={true} />
                )}
              </TabsContent>

              <TabsContent value="processadas" className="space-y-4">
                {processedCount === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Não há requisições processadas</p>
                  </div>
                ) : (
                  <RequestList userRole={profile?.role || 'colaborador'} showUserColumn={true} />
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* New Request Modal - Responsive */}
      <Dialog open={openNewRequest} onOpenChange={setOpenNewRequest}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
          <NewRequestForm
            onSuccess={() => setOpenNewRequest(false)}
            onCancel={() => setOpenNewRequest(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}