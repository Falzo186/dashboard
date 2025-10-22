import { 
  useDescuentosMetrics, 
  useDistribucionMensual,
  useTopProductos,
  usePorCategoria,
  useImpactoMargen
} from '../hooks/useDescuentosData';
import { DescuentosMetricsComponent } from '../components/DescuentosMetrics';
import { DistribucionMensualChart } from '../components/DistribucionMensualChart';
import { TopProductosTable } from '../components/TopProductosTable';
import { CategoriasChart } from '../components/CategoriasChart';
import { ImpactoMargenCard } from '../components/ImpactoMargenCard';
import { DESCUENTOS_CONFIG } from '../config';

export const DescuentosPage = () => {
  // Hooks para obtener datos
  const metricsQuery = useDescuentosMetrics();
  const distribucionQuery = useDistribucionMensual();
  const topProductosQuery = useTopProductos(DESCUENTOS_CONFIG.TOP_PRODUCTOS_PAGE_LIMIT);
  const categoriasQuery = usePorCategoria();
  const impactoQuery = useImpactoMargen();

  // Estados de carga
  const isLoading = 
    metricsQuery.isLoading || 
    distribucionQuery.isLoading || 
    topProductosQuery.isLoading ||
    categoriasQuery.isLoading ||
    impactoQuery.isLoading;

  const isError = 
    metricsQuery.isError || 
    distribucionQuery.isError || 
    topProductosQuery.isError ||
    categoriasQuery.isError ||
    impactoQuery.isError;

  // Componente de carga
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500" />
        <p className="text-gray-600 font-medium">Cargando análisis de descuentos...</p>
      </div>
    );
  }

  // Componente de error
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <div className="text-red-500 text-6xl">!</div>
        <p className="text-red-600 font-medium text-lg">Error al cargar los datos</p>
        <button
          onClick={() => {
            metricsQuery.refetch();
            distribucionQuery.refetch();
            topProductosQuery.refetch();
            categoriasQuery.refetch();
            impactoQuery.refetch();
          }}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Caso 8: Descuentos y Promociones
          </h1>
          <p className="text-gray-600 mt-1">
            Análisis de estrategia promocional y su impacto en ventas y márgenes
          </p>
        </div>
        <button
          onClick={() => {
            metricsQuery.refetch();
            distribucionQuery.refetch();
            topProductosQuery.refetch();
            categoriasQuery.refetch();
            impactoQuery.refetch();
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualizar Datos
        </button>
      </div>

      {/* KPIs Section */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <h3 className="font-semibold text-blue-900">KPIs Objetivo del Caso</h3>
        <ul className="text-sm text-blue-800 mt-2 space-y-1">
          <li>ROI de estrategia promocional {'>'} 300%</li>
          <li>Incremento volumen: +20% con {'<'} 8% reducción margen</li>
          <li>% transacciones con descuento objetivo: 25-35%</li>
        </ul>
      </div>

      {/* Métricas Principales */}
      {metricsQuery.data && (
        <DescuentosMetricsComponent data={metricsQuery.data} />
      )}

      {/* Gráficos en Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución Mensual */}
        {distribucionQuery.data && (
          <DistribucionMensualChart data={distribucionQuery.data} />
        )}

        {/* Descuentos por Categoría */}
        {categoriasQuery.data && (
          <CategoriasChart data={categoriasQuery.data} />
        )}
      </div>

      {/* Impacto en Márgenes */}
      {impactoQuery.data && (
        <ImpactoMargenCard data={impactoQuery.data} />
      )}

      {/* Tabla de Top Productos */}
      {topProductosQuery.data && (
        <TopProductosTable data={topProductosQuery.data} />
      )}

      {/* Footer con Fecha */}
      <div className="text-center text-sm text-gray-500 pt-4 border-t">
        Última actualización: {new Date().toLocaleString('es-MX', { 
          dateStyle: 'full', 
          timeStyle: 'short' 
        })}
      </div>
    </div>
  );
};