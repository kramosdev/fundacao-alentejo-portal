import { useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, Profile, type Database } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }

      if (event === 'SIGNED_IN') {
        toast({
          title: "Login realizado com sucesso",
          description: "Bem-vindo ao Portal da Fundação Alentejo"
        })
      } else if (event === 'SIGNED_OUT') {
        toast({
          title: "Sessão terminada",
          description: "Até breve!"
        })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) throw error
      setProfile(data as Profile)
    } catch (error: any) {
      console.error('Error fetching profile:', error)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast({
          title: "Erro no login",
          description: error.message,
          variant: "destructive"
        })
        return { error }
      }

      return { data }
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message,
        variant: "destructive"
      })
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) {
        toast({
          title: "Erro no registo",
          description: error.message,
          variant: "destructive"
        })
        return { error }
      }

      if (data.user && !data.session) {
        toast({
          title: "Verifique o seu email",
          description: "Foi enviado um link de confirmação para o seu email"
        })
      }

      return { data }
    } catch (error: any) {
      toast({
        title: "Erro no registo",
        description: error.message,
        variant: "destructive"
      })
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const signInWithMicrosoft = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          scopes: 'openid profile email',
          redirectTo: `${window.location.origin}/dashboard`
        }
      })

      if (error) {
        toast({
          title: "Erro no login Microsoft",
          description: error.message,
          variant: "destructive"
        })
        return { error }
      }

      return { data }
    } catch (error: any) {
      toast({
        title: "Erro no login Microsoft",
        description: error.message,
        variant: "destructive"
      })
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        toast({
          title: "Erro ao terminar sessão",
          description: error.message,
          variant: "destructive"
        })
        return { error }
      }

      return { error: null }
    } catch (error: any) {
      toast({
        title: "Erro ao terminar sessão",
        description: error.message,
        variant: "destructive"
      })
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: 'No user logged in' }

    try {
      setLoading(true)
      // Profile update disabled until profiles table is created
      toast({
        title: "Funcionalidade em desenvolvimento",
        description: "A atualização de perfil estará disponível em breve"
      })
      return { error: 'Profiles table not created yet' }
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message,
        variant: "destructive"
      })
      return { error }
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    profile,
    session,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signInWithMicrosoft,
    signOut,
    updateProfile,
  }
}