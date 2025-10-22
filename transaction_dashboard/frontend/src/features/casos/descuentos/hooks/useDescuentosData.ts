import { useQuery } from '@tanstack/react-query';

import type {
  DescuentosMetrics,
  DistribucionMensual,
  ProductoConDescuento,
  DescuentoPorCategoria,
  ImpactoMargen,
  DescuentoPorPromocion,
  AnalisisCompleto
} from '../types';
import apiClient from '@/services/api/client';
import { DESCUENTOS_CONFIG } from '../config';

export const useDescuentosMetrics = () => {
  return useQuery<DescuentosMetrics>({
    queryKey: ['descuentos', 'metrics'],
    queryFn: async () => {
      const response = await apiClient.get('/casos/descuentos/metrics');
      return response.data.data;
    },
    staleTime: DESCUENTOS_CONFIG.QUERY_STALE_TIME,
    retry: DESCUENTOS_CONFIG.QUERY_RETRY_COUNT
  });
};

export const useDistribucionMensual = () => {
  return useQuery<DistribucionMensual[]>({
    queryKey: ['descuentos', 'distribucion-mensual'],
    queryFn: async () => {
      const response = await apiClient.get('/casos/descuentos/distribucion-mensual');
      return response.data.data;
    },
    staleTime: DESCUENTOS_CONFIG.QUERY_STALE_TIME,
    retry: DESCUENTOS_CONFIG.QUERY_RETRY_COUNT
  });
};

export const useTopProductos = (limit: number = DESCUENTOS_CONFIG.TOP_PRODUCTOS_DEFAULT_LIMIT) => {
  return useQuery<ProductoConDescuento[]>({
    queryKey: ['descuentos', 'top-productos', limit],
    queryFn: async () => {
      const response = await apiClient.get(`/casos/descuentos/top-productos?limit=${limit}`);
      return response.data.data;
    },
    staleTime: DESCUENTOS_CONFIG.QUERY_STALE_TIME,
    retry: DESCUENTOS_CONFIG.QUERY_RETRY_COUNT
  });
};

export const usePorCategoria = () => {
  return useQuery<DescuentoPorCategoria[]>({
    queryKey: ['descuentos', 'por-categoria'],
    queryFn: async () => {
      const response = await apiClient.get('/casos/descuentos/por-categoria');
      return response.data.data;
    },
    staleTime: DESCUENTOS_CONFIG.QUERY_STALE_TIME,
    retry: DESCUENTOS_CONFIG.QUERY_RETRY_COUNT
  });
};

export const useImpactoMargen = () => {
  return useQuery<ImpactoMargen>({
    queryKey: ['descuentos', 'impacto-margen'],
    queryFn: async () => {
      const response = await apiClient.get('/casos/descuentos/impacto-margen');
      return response.data.data;
    },
    staleTime: DESCUENTOS_CONFIG.QUERY_STALE_TIME,
    retry: DESCUENTOS_CONFIG.QUERY_RETRY_COUNT
  });
};

export const usePorPromocion = () => {
  return useQuery<DescuentoPorPromocion[]>({
    queryKey: ['descuentos', 'por-promocion'],
    queryFn: async () => {
      const response = await apiClient.get('/casos/descuentos/por-promocion');
      return response.data.data;
    },
    staleTime: DESCUENTOS_CONFIG.QUERY_STALE_TIME,
    retry: DESCUENTOS_CONFIG.QUERY_RETRY_COUNT
  });
};

export const useAnalisisCompleto = () => {
  return useQuery<AnalisisCompleto>({
    queryKey: ['descuentos', 'analisis-completo'],
    queryFn: async () => {
      const response = await apiClient.get('/casos/descuentos/analisis-completo', {
        timeout: DESCUENTOS_CONFIG.ANALISIS_COMPLETO_TIMEOUT
      });
      return response.data.data;
    },
    staleTime: DESCUENTOS_CONFIG.QUERY_STALE_TIME,
    retry: DESCUENTOS_CONFIG.QUERY_RETRY_COUNT
  });
};