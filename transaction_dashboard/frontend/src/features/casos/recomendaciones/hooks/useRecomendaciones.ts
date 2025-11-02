import { useQuery, UseQueryResult } from '@tanstack/react-query'
import apiClient from '../../../../services/api/client'

export interface ComboRow {
  productAId: number
  productAName: string | null
  productBId: number
  productBName: string | null
  pairCount: number
  support: number
  confidenceAtoB: number
  confidenceBtoA: number
}

export const useTopCombos = (days = 90, limit = 10): UseQueryResult<ComboRow[], Error> => {
  return useQuery({
    queryKey: ['recomendaciones', 'top-combos', days, limit],
    queryFn: async (): Promise<ComboRow[]> => {
      const resp = await apiClient.get(`/casos/recomendaciones/canasta/top-combos?days=${days}&limit=${limit}`)
      if (!resp.data) throw new Error('No data')
      if (resp.data.success && resp.data.data) return resp.data.data
      return resp.data
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1
  })
}

export default useTopCombos
