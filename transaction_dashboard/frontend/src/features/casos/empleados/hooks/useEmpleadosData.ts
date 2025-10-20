import { useQuery, UseQueryResult } from '@tanstack/react-query'
import apiClient from '../../../../services/api/client'
import { ApiResponse } from '../../../shared/types'
import { EmpleadoMetric, EmpleadoTop, EmployeeHourly } from '../types'

const EMPLEADOS_BASE = '/casos/empleados'

export const useEmpleadosMetrics = (): UseQueryResult<EmpleadoMetric[], Error> => {
  return useQuery({
    queryKey: ['casos', 'empleados', 'metrics'],
    queryFn: async (): Promise<EmpleadoMetric[]> => {
      const response = await apiClient.get<ApiResponse<EmpleadoMetric[]>>(
        `${EMPLEADOS_BASE}/metrics`
      )
      if (!response.data.success) throw new Error('Failed to fetch empleados metrics')
      return response.data.data
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  })
}

export const useTopCashiers = (): UseQueryResult<EmpleadoTop[], Error> => {
  return useQuery({
    queryKey: ['casos', 'empleados', 'top'],
    queryFn: async (): Promise<EmpleadoTop[]> => {
      const response = await apiClient.get<ApiResponse<EmpleadoTop[]>>(`${EMPLEADOS_BASE}/top`)
      if (!response.data.success) throw new Error('Failed to fetch top cashiers')
      return response.data.data
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

export const useEmployeeHourly = (employeeId: number, days = 30) => {
  return useQuery({
    queryKey: ['casos', 'empleados', 'hourly', employeeId],
    queryFn: async (): Promise<EmployeeHourly[]> => {
      const response = await apiClient.get<ApiResponse<EmployeeHourly[]>>(
        `${EMPLEADOS_BASE}/${employeeId}/hourly?days=${days}`
      )
      if (!response.data.success) throw new Error('Failed to fetch employee hourly')
      return response.data.data
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}
