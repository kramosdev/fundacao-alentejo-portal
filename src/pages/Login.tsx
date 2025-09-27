import { useState } from "react";
import { Navigate } from "react-router-dom";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { useAuth } from "@/hooks/useAuth";

export default function Login() {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const { user, loading } = useAuth();

  if (user && !loading) {
    return <Navigate to="/dashboard" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 flex items-center justify-center p-4">
      {isLoginMode ? (
        <LoginForm onToggleMode={() => setIsLoginMode(false)} />
      ) : (
        <RegisterForm onToggleMode={() => setIsLoginMode(true)} />
      )}
    </div>
  );
}