// frontend/src/features/casos/inventario/hooks/useInventarioData.ts
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import apiClient from '../../../../services/api/client';
import type { InventarioAnalysisData } from '../types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// ============================================
// HOOKS SEPARADOS - CARGA PROGRESIVA
// ============================================

// Hook para métricas (se carga primero - ~5 segundos)
export const useInventarioMetrics = () => {
  return useQuery({
    queryKey: ['inventario', 'metrics'],
    queryFn: async () => {
  // ...existing code...
      const response = await apiClient.get('/casos/inventario/metrics');
  // ...existing code...
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 1,
  });
};

// Hook para movimientos por tipo (se carga segundo - ~5 segundos)
export const useMovimientosPorTipo = () => {
  return useQuery({
    queryKey: ['inventario', 'movimientos-tipo'],
    queryFn: async () => {
  // ...existing code...
      const response = await apiClient.get('/casos/inventario/movimientos-tipo');
  // ...existing code...
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

// Hook para productos más movidos (se carga tercero - ~35-50 segundos)
export const useProductosMasMovidos = () => {
  return useQuery({
    queryKey: ['inventario', 'productos-movidos'],
    queryFn: async () => {
  // ...existing code...
      const response = await apiClient.get('/casos/inventario/productos-movidos', {
        timeout: 120000 // 120 segundos
      });
  // ...existing code...
      return response.data.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutos - se cachea más tiempo
    gcTime: 15 * 60 * 1000, // 15 minutos en cache
    retry: 1,
  });
};

// ============================================
// HOOK PARA TENDENCIA (NUEVO - HABILITADO)
// ============================================
export const useInventarioTendencia = () => {
  return useQuery({
    queryKey: ['inventario', 'tendencia'],
    queryFn: async () => {
  // ...existing code...
      const response = await apiClient.get('/casos/inventario/tendencia');
  // ...existing code...
      return response.data.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 15 * 60 * 1000,
    retry: 1,
    enabled: true, // ✅ HABILITADO
  });
};

// ============================================
// HOOK PARA MOVIMIENTOS RECIENTES (NUEVO)
// ============================================
export const useMovimientosRecientes = (limit: number = 50) => {
  return useQuery({
    queryKey: ['inventario', 'movimientos-recientes', limit],
    queryFn: async () => {
  // ...existing code...
      const response = await apiClient.get(`/casos/inventario/movimientos-recientes?limit=${limit}`);
  // ...existing code...
      return response.data.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutos (datos cambian frecuentemente)
    retry: 1,
    enabled: true, // ✅ HABILITADO
  });
};

// ============================================
// HOOK PARA PRODUCTOS CRÍTICOS (ACTUALIZADO)
// ============================================
export const useProductosCriticos = (umbral: number = 20, shouldFetch: boolean = true) => {
  return useQuery({
    queryKey: ['inventario', 'criticos', umbral],
    queryFn: async () => {
  // ...existing code...
      const response = await apiClient.get(`/casos/inventario/productos/criticos?umbral=${umbral}`);
  // ...existing code...
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: shouldFetch, // ✅ Controlado por parámetro
  });
};

// ============================================
// HOOK LEGACY (mantener para compatibilidad)
// ============================================
export const useInventarioAnalysis = (): UseQueryResult<InventarioAnalysisData, Error> => {
  return useQuery({
    queryKey: ['inventario', 'analysis'],
    queryFn: async () => {
  // ...existing code...
      const response = await apiClient.get('/casos/inventario/analysis');
  // ...existing code...
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

// ============================================
// HOOK PARA REFRESCAR VISTAS MATERIALIZADAS
// ============================================
export const useRefreshVistas = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
  // ...existing code...
      const response = await apiClient.post('/casos/inventario/refresh-vistas', {}, {
        timeout: 240000 // 4 minutos de timeout
      });
  // ...existing code...
      return response.data;
    },
    onSuccess: () => {
      // Invalidar todas las queries de inventario para forzar re-fetch
      queryClient.invalidateQueries({ queryKey: ['inventario'] });
  // ...existing code...
    },
    onError: (error) => {
  // ...existing code...
    }
  });
};