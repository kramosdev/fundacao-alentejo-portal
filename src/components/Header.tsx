import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Bell, Menu, User, LogOut, Settings, Shield, Users, FileText, BarChart3, AlertTriangle, Zap, Activity } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useNotifications } from "@/hooks/useNotifications"

export function Header() {
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
      { name: 'Dashboard', href: '/dashboard', icon: Activity },
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
    'admin': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    'direcao': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'DGIEA': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'colaborador': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  }

  if (!user) return null

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <div className="mr-4 hidden lg:flex">
          <Link className="mr-6 flex items-center space-x-2 transition-transform hover:scale-105" to="/dashboard">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <span className="text-white font-bold text-sm">FG</span>
            </div>
            <span className="hidden font-bold xl:inline-block bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Fundação Gestão
            </span>
          </Link>
          <nav className="flex items-center gap-2 text-sm">
            {getNavigation().map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`transition-all flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-accent/50 hover:text-accent-foreground ${
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

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <div className="flex items-center space-x-2 mb-8">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                <span className="text-white font-bold text-sm">FG</span>
              </div>
              <span className="font-bold">Fundação Gestão</span>
            </div>
            <nav className="flex flex-col gap-3">
              {getNavigation().map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`transition-all flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-accent/50 ${
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

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 lg:w-auto lg:flex-none">
            <div className="lg:hidden">
              <Link className="flex items-center space-x-2" to="/dashboard">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">FG</span>
                </div>
                <span className="font-bold">FG</span>
              </Link>
            </div>
          </div>
          <nav className="flex items-center gap-2">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover:bg-accent/50">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center animate-pulse">
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
                <Button variant="ghost" className="relative h-10 w-auto px-3 hover:bg-accent/50">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                      <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/30 text-primary font-medium">
                        {profile?.full_name ? getInitials(profile.full_name) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden lg:flex lg:flex-col lg:items-start">
                      <span className="text-sm font-medium">{profile?.full_name}</span>
                      <Badge 
                        className={`text-xs ${roleColors[profile?.role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800'}`}
                      >
                        {roleLabels[profile?.role as keyof typeof roleLabels] || profile?.role}
                      </Badge>
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/30 text-primary font-medium">
                          {profile?.full_name ? getInitials(profile.full_name) : 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <p className="text-sm font-medium leading-none">{profile?.full_name}</p>
                        <p className="text-xs leading-none text-muted-foreground mt-1">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      className={`w-fit ${roleColors[profile?.role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800'}`}
                    >
                      {roleLabels[profile?.role as keyof typeof roleLabels] || profile?.role}
                    </Badge>
                    {profile?.department && (
                      <p className="text-xs text-muted-foreground">
                        {profile.department}
                      </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Perfil
                  </Link>
                </DropdownMenuItem>
                {(profile?.role === 'admin' || profile?.role === 'direcao') && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Administração
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive focus:bg-destructive/10"
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