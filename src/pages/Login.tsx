import { useState } from "react"
import { Navigate } from "react-router-dom"
import { LoginForm } from "@/components/auth/LoginForm"
import { RegisterForm } from "@/components/auth/RegisterForm"
import { useAuth } from "@/hooks/useAuth"
import heroBanner from "@/assets/hero-banner.jpg"

export default function Login() {
  const [isLogin, setIsLogin] = useState(true)
  const { user, loading } = useAuth()

  // Redirect if already logged in
  if (user && !loading) {
    return <Navigate to="/" replace />
  }

  const handleSuccess = () => {
    // Navigation will be handled by the auth state change
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {isLogin ? (
            <LoginForm onSuccess={handleSuccess} onToggleMode={toggleMode} />
          ) : (
            <RegisterForm onSuccess={handleSuccess} onToggleMode={toggleMode} />
          )}
        </div>
      </div>

      {/* Right side - Hero Image */}
      <div 
        className="hidden lg:block flex-1 relative bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(33, 41, 60, 0.7), rgba(55, 125, 255, 0.5)), url(${heroBanner})`
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white space-y-6 px-8">
            <h1 className="text-4xl font-bold mb-4">
              Portal da Fundação Alentejo
            </h1>
            <p className="text-xl text-white/90 max-w-md">
              Sistema integrado de requisições e gestão interna para uma fundação moderna e eficiente.
            </p>
            <div className="space-y-2 text-white/80">
              <p>✓ Workflow automatizado de aprovações</p>
              <p>✓ Notificações em tempo real</p>
              <p>✓ Auditoria completa de processos</p>
              <p>✓ Interface moderna e intuitiva</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}