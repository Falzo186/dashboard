import { useQuery, UseQueryResult } from '@tanstack/react-query'
import apiClient from '../../../../services/api/client'

export interface TopProduct {
  producto_id: string
  product_name: string
  categories?: string
  ventas_totales?: string
}

export const useTopProducts = (limit = 20): UseQueryResult<TopProduct[], Error> => {
  return useQuery({
    queryKey: ['recomendaciones', 'top-products', limit],
    queryFn: async (): Promise<TopProduct[]> => {
      const resp = await apiClient.get(`/casos/descuentos/top-productos?limit=${limit}`)
      if (!resp.data) throw new Error('No data')
      if (resp.data.success && resp.data.data) return resp.data.data
      return resp.data
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1
  })
}

export default useTopProducts
