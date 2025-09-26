import { useState, useEffect } from 'react'
import { supabase, Request, RequestCategory } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

interface CreateRequestData {
  category_id: string
  title: string
  description: string
  type: 'viatura' | 'alimentacao' | 'material' | 'outro'
  priority?: 'baixa' | 'media' | 'alta' | 'critica'
  requested_date?: string
  requested_time?: string
  location?: string
  additional_info?: any
  attachments?: string[]
}

interface UpdateRequestStatusData {
  request_id: string
  new_status: 'em_analise_dgiea' | 'enviado_direcao' | 'aprovado' | 'rejeitado'
  notes?: string
  decision?: string
}

export function useRequests() {
  const [requests, setRequests] = useState<Request[]>([])
  const [categories, setCategories] = useState<RequestCategory[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchCategories()
    fetchRequests()
  }, [])

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('request_categories')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) {
        console.error('Error fetching categories:', error)
        return
      }

      setCategories(data || [])
    } catch (error) {
      console.error('Error in fetchCategories:', error)
    }
  }

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('requests')
        .select(`
          *,
          profiles!requests_user_id_fkey(full_name, email),
          request_categories(name, type),
          dgiea_user:profiles!requests_dgiea_user_id_fkey(full_name),
          direction_user:profiles!requests_direction_user_id_fkey(full_name)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching requests:', error)
        toast({
          title: "Erro ao carregar requisições",
          description: error.message,
          variant: "destructive"
        })
        return
      }

      setRequests(data || [])
    } catch (error: any) {
      console.error('Error in fetchRequests:', error)
      toast({
        title: "Erro ao carregar requisições",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const createRequest = async (requestData: CreateRequestData) => {
    try {
      setLoading(true)

      const { data, error } = await supabase.functions.invoke('create-request', {
        body: { data: requestData }
      })

      if (error) {
        toast({
          title: "Erro ao criar requisição",
          description: error.message,
          variant: "destructive"
        })
        return { error }
      }

      toast({
        title: "Requisição criada com sucesso",
        description: "A sua requisição foi submetida e está em processamento"
      })

      // Refresh requests list
      await fetchRequests()

      return { data }
    } catch (error: any) {
      toast({
        title: "Erro ao criar requisição",
        description: error.message,
        variant: "destructive"
      })
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const updateRequestStatus = async (statusData: UpdateRequestStatusData) => {
    try {
      setLoading(true)

      const { data, error } = await supabase.functions.invoke('update-request-status', {
        body: statusData
      })

      if (error) {
        toast({
          title: "Erro ao atualizar requisição",
          description: error.message,
          variant: "destructive"
        })
        return { error }
      }

      const statusMessages = {
        'em_analise_dgiea': 'Requisição movida para análise DGIEA',
        'enviado_direcao': 'Requisição enviada para aprovação da Direção',
        'aprovado': 'Requisição aprovada com sucesso',
        'rejeitado': 'Requisição rejeitada'
      }

      toast({
        title: "Status atualizado",
        description: statusMessages[statusData.new_status]
      })

      // Refresh requests list
      await fetchRequests()

      return { data }
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar requisição",
        description: error.message,
        variant: "destructive"
      })
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const getRequestsByStatus = (status: string) => {
    return requests.filter(request => request.status === status)
  }

  const getRequestsByUser = (userId: string) => {
    return requests.filter(request => request.user_id === userId)
  }

  const getRequestById = (id: string) => {
    return requests.find(request => request.id === id)
  }

  // Real-time subscription for requests
  useEffect(() => {
    const channel = supabase
      .channel('requests_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'requests'
        },
        (payload) => {
          console.log('Request change received:', payload)
          // Refresh requests when any change occurs
          fetchRequests()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return {
    requests,
    categories,
    loading,
    createRequest,
    updateRequestStatus,
    fetchRequests,
    getRequestsByStatus,
    getRequestsByUser,
    getRequestById,
  }
}