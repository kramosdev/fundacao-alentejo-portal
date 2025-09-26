import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/hooks/useAuth"
import { Eye, EyeOff, Mail, Lock, Shield } from "lucide-react"

interface LoginFormProps {
  onSuccess?: () => void
  onToggleMode?: () => void
}

export function LoginForm({ onSuccess, onToggleMode }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const { signInWithEmail, signInWithMicrosoft, loading } = useAuth()

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      return
    }

    const { error } = await signInWithEmail(email, password)
    
    if (!error && onSuccess) {
      onSuccess()
    }
  }

  const handleMicrosoftLogin = async () => {
    const { error } = await signInWithMicrosoft()
    
    if (!error && onSuccess) {
      onSuccess()
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto portal-card">
      <CardHeader className="text-center space-y-1">
        <div className="mx-auto w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center mb-4">
          <Shield className="w-6 h-6 text-primary-foreground" />
        </div>
        <CardTitle className="text-2xl font-bold">Portal da Fundação</CardTitle>
        <CardDescription>
          Entre na sua conta para aceder aos serviços
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
          Entrar com Microsoft 365
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              ou continue com
            </span>
          </div>
        </div>

        {/* Email Login Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
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
                placeholder="Digite a sua password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
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

          <Button 
            type="submit" 
            className="w-full h-11" 
            variant="primary"
            disabled={loading || !email || !password}
          >
            {loading ? "A entrar..." : "Entrar"}
          </Button>
        </form>

        <div className="text-center">
          <Button
            variant="link"
            className="text-sm"
            onClick={onToggleMode}
          >
            Não tem conta? Registe-se aqui
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}