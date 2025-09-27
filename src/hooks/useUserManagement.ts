import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'

interface UserProfile {
  id: string
  user_id: string
  email: string
  full_name: string
  role: string
  department?: string
  phone?: string
  avatar_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface UserRole {
  id: string
  user_id: string
  role: string
  is_active: boolean
  assigned_at: string
  assigned_by?: string
}

export function useUserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [userRoles, setUserRoles] = useState<UserRole[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchUsers()
    fetchUserRoles()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers((data || []) as UserProfile[])
    } catch (error: any) {
      console.error('Error fetching users:', error)
      toast({
        title: "Erro ao carregar utilizadores",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchUserRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('assigned_at', { ascending: false })

      if (error) throw error
      setUserRoles((data || []) as UserRole[])
    } catch (error: any) {
      console.error('Error fetching user roles:', error)
    }
  }

  const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', userId)

      if (error) throw error

      toast({
        title: "Perfil atualizado",
        description: "As informações do utilizador foram atualizadas com sucesso."
      })

      await fetchUsers()
      return { success: true }
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message,
        variant: "destructive"
      })
      return { error }
    }
  }

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: isActive })
        .eq('user_id', userId)

      if (error) throw error

      toast({
        title: isActive ? "Utilizador ativado" : "Utilizador desativado",
        description: `O utilizador foi ${isActive ? 'ativado' : 'desativado'} com sucesso.`
      })

      await fetchUsers()
      return { success: true }
    } catch (error: any) {
      toast({
        title: "Erro ao alterar estado",
        description: error.message,
        variant: "destructive"
      })
      return { error }
    }
  }

  const assignRole = async (userId: string, role: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: role,
          is_active: true
        })

      if (error) throw error

      toast({
        title: "Cargo atribuído",
        description: `O cargo ${role} foi atribuído ao utilizador.`
      })

      await fetchUserRoles()
      return { success: true }
    } catch (error: any) {
      toast({
        title: "Erro ao atribuir cargo",
        description: error.message,
        variant: "destructive"
      })
      return { error }
    }
  }

  const removeRole = async (roleId: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ is_active: false })
        .eq('id', roleId)

      if (error) throw error

      toast({
        title: "Cargo removido",
        description: "O cargo foi removido do utilizador."
      })

      await fetchUserRoles()
      return { success: true }
    } catch (error: any) {
      toast({
        title: "Erro ao remover cargo",
        description: error.message,
        variant: "destructive"
      })
      return { error }
    }
  }

  const getUserRoles = (userId: string) => {
    return userRoles.filter(role => role.user_id === userId && role.is_active)
  }

  return {
    users,
    userRoles,
    loading,
    fetchUsers,
    fetchUserRoles,
    updateUserProfile,
    toggleUserStatus,
    assignRole,
    removeRole,
    getUserRoles
  }
}