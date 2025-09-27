import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Bell, Menu, User, LogOut, Settings, Shield, Users, FileText, BarChart3, AlertTriangle, Zap, Activity, Home } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useNotifications } from "@/hooks/useNotifications"

export function ModernHeader() {
  const { user, profile, signOut } = useAuth()
  const { notifications, unreadCount, markAsRead } = useNotifications()
  const location = useLocation()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const getNavigation = () => {
    const baseNav = [
      { name: 'Dashboard', href: '/dashboard', icon: Home },
      { name: 'Requisições', href: '/requests', icon: FileText },
      { name: 'Incidentes', href: '/incidents', icon: AlertTriangle },
      { name: 'Ações Rápidas', href: '/quick-actions', icon: Zap },
      { name: 'Relatórios', href: '/reports', icon: BarChart3 }
    ]

    // Add admin/direction only pages
    if (profile?.role === 'admin' || profile?.role === 'direcao') {
      baseNav.push(
        { name: 'Gestão Utilizadores', href: '/user-management', icon: Users },
        { name: 'Visão Estratégica', href: '/strategic-dashboard', icon: BarChart3 },
        { name: 'Configurações', href: '/admin', icon: Settings }
      )
    }

    return baseNav
  }

  const isActive = (href: string) => location.pathname === href

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const roleLabels = {
    'admin': 'Administrador',
    'direcao': 'Direção',
    'DGIEA': 'DGIEA',
    'colaborador': 'Colaborador'
  }

  const roleColors = {
    'admin': 'bg-destructive/10 text-destructive border border-destructive/20',
    'direcao': 'bg-accent/10 text-accent border border-accent/20',
    'DGIEA': 'bg-primary/10 text-primary border border-primary/20',
    'colaborador': 'bg-success/10 text-success border border-success/20'
  }

  if (!user) return null

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        {/* Desktop Navigation */}
        <div className="mr-6 hidden lg:flex">
          <Link className="mr-8 flex items-center space-x-3 transition-all hover:scale-105" to="/dashboard">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center shadow-lg">
              <span className="text-primary-foreground font-bold text-lg">FA</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
                Fundação Alentejo
              </span>
              <span className="text-xs text-muted-foreground -mt-1">Portal de Gestão</span>
            </div>
          </Link>
          
          <nav className="flex items-center gap-1 text-sm">
            {getNavigation().map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`transition-all flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent/50 hover:text-accent-foreground ${
                    isActive(item.href)
                      ? 'bg-primary/10 text-primary font-medium shadow-sm border border-primary/20'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden xl:inline">{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-4 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 lg:hidden"
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <div className="flex items-center space-x-3 mb-8">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">FA</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg">Fundação Alentejo</span>
                <span className="text-xs text-muted-foreground">Portal de Gestão</span>
              </div>
            </div>
            <nav className="flex flex-col gap-2">
              {getNavigation().map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`transition-all flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent/50 ${
                      isActive(item.href)
                        ? 'bg-primary/10 text-primary font-medium shadow-sm border border-primary/20'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Mobile Logo */}
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 lg:w-auto lg:flex-none">
            <div className="lg:hidden">
              <Link className="flex items-center space-x-3" to="/dashboard">
                <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">FA</span>
                </div>
                <span className="font-bold text-lg">Fundação Alentejo</span>
              </Link>
            </div>
          </div>

          {/* Right Side Navigation */}
          <nav className="flex items-center gap-2">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover:bg-accent/50 h-10 w-10">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center animate-pulse font-medium">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                  Notificações
                  {unreadCount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {unreadCount} não lidas
                    </Badge>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      Nenhuma notificação
                    </div>
                  ) : (
                    notifications.slice(0, 5).map((notification) => (
                      <DropdownMenuItem
                        key={notification.id}
                        className="flex flex-col items-start p-4 cursor-pointer hover:bg-accent/50"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex w-full items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{notification.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                          </div>
                          {!notification.is_read && (
                            <div className="h-2 w-2 bg-primary rounded-full ml-2 mt-1 flex-shrink-0" />
                          )}
                        </div>
                      </DropdownMenuItem>
                    ))
                  )}
                </div>
                {notifications.length > 5 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-center text-primary hover:bg-primary/10">
                      Ver todas as notificações
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-12 w-auto px-3 hover:bg-accent/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 ring-2 ring-primary/20">
                      <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/30 text-primary font-medium">
                        {profile?.full_name ? getInitials(profile.full_name) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden lg:flex lg:flex-col lg:items-start lg:text-left">
                      <span className="text-sm font-medium leading-tight">{profile?.full_name}</span>
                      <Badge 
                        className={`text-xs ${roleColors[profile?.role as keyof typeof roleColors] || 'bg-muted text-muted-foreground'} mt-1`}
                      >
                        {roleLabels[profile?.role as keyof typeof roleLabels] || profile?.role}
                      </Badge>
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-72" align="end" forceMount>
                <DropdownMenuLabel className="font-normal p-4">
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/30 text-primary font-medium text-lg">
                          {profile?.full_name ? getInitials(profile.full_name) : 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <p className="text-sm font-medium leading-tight">{profile?.full_name}</p>
                        <p className="text-xs leading-tight text-muted-foreground mt-1">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        className={`${roleColors[profile?.role as keyof typeof roleColors] || 'bg-muted text-muted-foreground'} text-xs`}
                      >
                        {roleLabels[profile?.role as keyof typeof roleLabels] || profile?.role}
                      </Badge>
                      {profile?.department && (
                        <span className="text-xs text-muted-foreground">
                          {profile.department}
                        </span>
                      )}
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                    <User className="h-4 w-4" />
                    Perfil
                  </Link>
                </DropdownMenuItem>
                {(profile?.role === 'admin' || profile?.role === 'direcao') && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="flex items-center gap-2 cursor-pointer">
                      <Shield className="h-4 w-4" />
                      Administração
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Terminar Sessão
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </div>
    </header>
  )
}