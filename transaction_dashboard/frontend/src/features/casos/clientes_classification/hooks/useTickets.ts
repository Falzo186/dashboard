import { useQuery } from '@tanstack/react-query'
import apiClient from '../../../../services/api/client'

export interface TicketRow {
  id: number
  fecha_hora: string
  total: number
  metodo_pago?: string
  store_id?: number
}

export const useTickets = (limit = 100) => {
  return useQuery({
    queryKey: ['clientes','tickets', limit],
    queryFn: async () => {
      const resp = await apiClient.get(`/casos/clientes/tickets?limit=${limit}`)
      if (resp.data && resp.data.success) return resp.data.data as TicketRow[]
      return resp.data
    },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false
  })
}

export default useTickets
