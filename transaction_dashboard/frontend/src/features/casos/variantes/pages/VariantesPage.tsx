// frontend/src/features/casos/variantes/pages/VariantesPage.tsx

import React from 'react';
import { 
  useVariantMetrics, 
  useVariantAnalysis 
} from '../hooks/useVariantesData';
import { VariantesMetrics } from '../components/VariantesMetrics';
import { CategoryVariantsChart } from '../components/CategoryVariantChart';
import { PriceVariationChart } from '../components/PriceVariationChart';
import { VariantGroupsTable } from '../components/VariantesGroupTables';

export const VariantesPage: React.FC = () => {
  const { data: metrics, isLoading: metricsLoading, isError: metricsError } = useVariantMetrics();
  const { data: analysis, isLoading: analysisLoading, isError: analysisError } = useVariantAnalysis();

  // Loading state
  if (metricsLoading || analysisLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando análisis de variantes...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (metricsError || analysisError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex items-center mb-4">
            <h3 className="text-lg font-semibold text-red-800">
              Error al cargar datos
            </h3>
          </div>
          <p className="text-red-700 mb-4">
            No se pudieron obtener los datos de variantes. Por favor, verifica que el backend esté funcionando.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // No data state
  if (!metrics || !analysis) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay datos disponibles
          </h3>
          <p className="text-gray-600">
            No se encontraron datos de variantes en el sistema
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            <span className="block text-blue-700">Caso 10:</span>
            <span className="block text-gray-900">Análisis de Variantes de Productos</span>
          </h1>
          <p className="text-gray-600">
            Identificación automática de variantes usando análisis de nombres
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Actualizar
        </button>
      </div>

      {/* Métricas Principales */}
      <VariantesMetrics metrics={metrics} />

      {/* Gráficos en Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryVariantsChart data={analysis.categoryAnalysis} />
        <PriceVariationChart data={analysis.priceVariations} />
      </div>

      {/* Tabla de Grupos de Variantes */}
      <VariantGroupsTable groups={analysis.topVariantGroups} />

      {/* Insights y Recomendaciones */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Insights Clave
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">
              Cobertura del Catálogo
            </h4>
            <p className="text-sm text-blue-700">
              El <strong>{metrics.porcentajeProductosConVariantes}</strong> de los productos 
              tienen variantes detectables, indicando alta diversidad de presentaciones.
            </p>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-semibold text-purple-900 mb-2">
              Tipo Predominante
            </h4>
            <p className="text-sm text-purple-700">
              Las variantes de <strong>{metrics.tipoVarianteMasComun}</strong> son 
              las más comunes, sugiriendo enfoque en presentaciones de tamaño.
            </p>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-2">
              Complejidad Promedio
            </h4>
            <p className="text-sm text-green-700">
              Cada producto base tiene en promedio <strong>{metrics.promedioVariantesPorProducto}</strong> variantes, 
              permitiendo opciones para diferentes necesidades.
            </p>
          </div>
        </div>
      </div>

      {/* Recomendaciones Estratégicas */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recomendaciones Estratégicas
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div>
              <h4 className="font-semibold text-gray-900">
                Optimización de Inventario
              </h4>
              <p className="text-sm text-gray-700">
                Enfocarse en las variantes más vendidas de cada producto base para 
                optimizar espacio en almacén y reducir costos de mantenimiento.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div>
              <h4 className="font-semibold text-gray-900">
                Estrategia de Precios Diferenciados
              </h4>
              <p className="text-sm text-gray-700">
                Analizar las variaciones de precio entre variantes para implementar 
                estrategias de pricing que maximicen margen sin perder competitividad.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div>
              <h4 className="font-semibold text-gray-900">
                Mejora de Sistema de Información
              </h4>
              <p className="text-sm text-gray-700">
                Implementar tabla <code className="bg-white px-2 py-1 rounded">product_variants</code> en 
                la base de datos para capturar formalmente atributos de variantes y mejorar 
                análisis futuros.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div>
              <h4 className="font-semibold text-gray-900">
                Análisis de Sustitución
              </h4>
              <p className="text-sm text-gray-700">
                Estudiar patrones de compra entre variantes del mismo producto para 
                identificar oportunidades de cross-selling y promociones cruzadas.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* KPIs Footer */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          KPIs del Caso 10
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-600">
              {metrics.porcentajeProductosConVariantes}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Productos con Variantes Identificadas
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Meta: &gt;80%
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {metrics.promedioVariantesPorProducto}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Promedio de Variantes por Producto
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Diversidad del Catálogo
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {analysis.topVariantGroups.length}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Grupos de Variantes Detectados
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Alta Complejidad
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};