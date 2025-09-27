import { Navigate } from "react-router-dom";
import { ModernHeader } from "@/components/ModernHeader";
import { RealTimeUpdates } from "@/components/RealTimeUpdates";
import { EnhancedUserManagement } from "@/components/EnhancedUserManagement";
import { useAuth } from "@/hooks/useAuth";

export default function UserManagement() {
  const { user, profile, loading } = useAuth();

  // Redirect to login if not authenticated
  if (!loading && !user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to dashboard if not admin or direction
  if (!loading && profile && !['admin', 'direcao'].includes(profile.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ModernHeader />
      <RealTimeUpdates />
      
      <div className="container py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestão de Utilizadores</h1>
            <p className="text-muted-foreground mt-2">
              Gerir utilizadores do sistema e aprovar novos registos
            </p>
          </div>
        </div>

        <EnhancedUserManagement />
      </div>
    </div>
  );
}