import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { Eye, EyeOff, Mail, Lock, User, Shield } from "lucide-react"

interface RegisterFormProps {
  onSuccess?: () => void
  onToggleMode?: () => void
}

export function RegisterForm({ onSuccess, onToggleMode }: RegisterFormProps) {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { signUpWithEmail, signInWithMicrosoft, loading } = useAuth()
  const { toast } = useToast()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!fullName || !email || !password || !confirmPassword) {
      return
    }

    if (password !== confirmPassword) {
      return
    }

    if (password.length < 6) {
      return
    }

    try {
      // Create pending registration record
      const { error: pendingError } = await supabase
        .from('pending_registrations')
        .insert({
          email,
          full_name: fullName,
          requested_role: 'colaborador',
          status: 'pending'
        })

      if (pendingError) throw pendingError

      toast({
        title: "Registo submetido",
        description: "O seu registo foi submetido para aprovação da Direção. Será notificado por email quando for aprovado.",
        duration: 5000
      })

      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      toast({
        title: "Erro no registo",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const handleMicrosoftLogin = async () => {
    const { error } = await signInWithMicrosoft()
    
    if (!error && onSuccess) {
      onSuccess()
    }
  }

  const isFormValid = fullName && email && password && confirmPassword && 
                     password === confirmPassword && password.length >= 6

  return (
    <Card className="w-full max-w-md mx-auto portal-card">
      <CardHeader className="text-center space-y-1">
        <div className="mx-auto w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center mb-4">
          <Shield className="w-6 h-6 text-primary-foreground" />
        </div>
        <CardTitle className="text-2xl font-bold">Criar Conta</CardTitle>
        <CardDescription>
          Registe-se para aceder ao Portal da Fundação
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Microsoft Login */}
        <Button 
          variant="outline" 
          className="w-full h-11" 
          onClick={handleMicrosoftLogin}
          disabled={loading}
        >
          <svg className="w-4 h-4 mr-2" viewBox="0 0 21 21">
            <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
            <rect x="12" y="1" width="9" height="9" fill="#00a4ef"/>
            <rect x="1" y="12" width="9" height="9" fill="#ffb900"/>
            <rect x="12" y="12" width="9" height="9" fill="#7fba00"/>
          </svg>
          Registar com Microsoft 365
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              ou registe-se com
            </span>
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nome Completo</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="fullName"
                type="text"
                placeholder="João Silva"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="email"
                type="email"
                placeholder="seu.email@fundacao-alentejo.pt"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
                minLength={6}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirme a password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 pr-10"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {password && confirmPassword && password !== confirmPassword && (
              <p className="text-sm text-destructive">As passwords não coincidem</p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full h-11" 
            variant="primary"
            disabled={loading || !isFormValid}
          >
            {loading ? "A registar..." : "Criar Conta"}
          </Button>
        </form>

        <div className="text-center">
          <Button
            variant="link"
            className="text-sm"
            onClick={onToggleMode}
          >
            Já tem conta? Entre aqui
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}