/**
 * Configuración del módulo de descuentos
 * Centraliza valores configurables para facilitar el mantenimiento
 */

export const DESCUENTOS_CONFIG = {
  // Configuración de queries
  QUERY_STALE_TIME: 5 * 60 * 1000, // 5 minutos
  QUERY_RETRY_COUNT: 2,
  ANALISIS_COMPLETO_TIMEOUT: 120000, // 2 minutos
  
  // Configuración de límites
  TOP_PRODUCTOS_DEFAULT_LIMIT: 20,
  TOP_PRODUCTOS_PAGE_LIMIT: 15,
  
  // Configuración de gráficos
  MAX_CATEGORIA_NAME_LENGTH: 20,
} as const;
