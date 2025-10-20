// frontend/src/features/casos/variantes/hooks/useVariantesData.ts

import { useQuery } from '@tanstack/react-query';
import type { 
  VariantMetrics, 
  VariantAnalysisData,
  VariantGroup,
  CategoryAnalysis,
  PriceVariation 
} from '../types';

const API_BASE = 'http://localhost:3001/api/v1/casos/variantes';

/**
 * Hook para obtener métricas generales de variantes
 */
export const useVariantMetrics = () => {
  return useQuery<VariantMetrics>({
    queryKey: ['variantes', 'metrics'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/metrics`);
      if (!response.ok) {
        throw new Error('Error al obtener métricas de variantes');
      }
      const json = await response.json();
      return json.data || json;
    },
    staleTime: 5 * 60 * 1000,
    retry: 2
  });
};

/**
 * Hook para obtener análisis completo de variantes
 */
export const useVariantAnalysis = () => {
  return useQuery<VariantAnalysisData>({
    queryKey: ['variantes', 'analysis'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/analysis`);
      if (!response.ok) {
        throw new Error('Error al obtener análisis de variantes');
      }
      const json = await response.json();
      return json.data || json;
    },
    staleTime: 5 * 60 * 1000,
    retry: 2
  });
};

/**
 * Hook para obtener grupos de variantes
 */
export const useVariantGroups = () => {
  return useQuery<VariantGroup[]>({
    queryKey: ['variantes', 'groups'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/groups`);
      if (!response.ok) {
        throw new Error('Error al obtener grupos de variantes');
      }
      const json = await response.json();
      return json.data || json;
    },
    staleTime: 5 * 60 * 1000,
    retry: 2
  });
};

/**
 * Hook para obtener análisis por categoría
 */
export const useCategoryAnalysis = () => {
  return useQuery<CategoryAnalysis[]>({
    queryKey: ['variantes', 'categories'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/categories`);
      if (!response.ok) {
        throw new Error('Error al obtener análisis por categoría');
      }
      const json = await response.json();
      return json.data || json;
    },
    staleTime: 5 * 60 * 1000,
    retry: 2
  });
};

/**
 * Hook para obtener análisis de precios
 */
export const usePriceAnalysis = () => {
  return useQuery<PriceVariation[]>({
    queryKey: ['variantes', 'prices'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/prices`);
      if (!response.ok) {
        throw new Error('Error al obtener análisis de precios');
      }
      const json = await response.json();
      return json.data || json;
    },
    staleTime: 5 * 60 * 1000,
    retry: 2
  });
};