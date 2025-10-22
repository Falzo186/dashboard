import type { DescuentosMetrics } from '../types';

interface Props {
  data: DescuentosMetrics;
}

export const DescuentosMetricsComponent = ({ data }: Props) => {
  if (!data) {
    return <div className="text-gray-500">Sin datos disponibles</div>;
  }

  const formatNumber = (value: string) => {
    const num = parseInt(value);
    return num.toLocaleString('es-MX');
  };

  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    return `$${num.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPercentage = (value: string) => {
    return `${parseFloat(value).toFixed(2)}%`;
  };

  const getEstadoColor = () => {
    if (data.estado_programa.includes('CRÍTICO')) return 'text-red-600 bg-red-50 border-red-200';
    if (data.estado_programa.includes('BAJO')) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (data.estado_programa.includes('REGULAR')) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (data.estado_programa.includes('ÓPTIMO')) return 'text-green-600 bg-green-50 border-green-200';
    if (data.estado_programa.includes('ALTO')) return 'text-purple-600 bg-purple-50 border-purple-200';
    return 'text-blue-600 bg-blue-50 border-blue-200';
  };

  return (
    <div className="space-y-6">
      {/* Banner de Estado */}
      <div className={`p-6 rounded-lg border-2 ${getEstadoColor()}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-sm font-medium uppercase tracking-wide mb-2">
              Estado del Programa de Descuentos
            </h3>
            <p className="text-2xl font-bold mb-2">{data.estado_programa}</p>
            <p className="text-sm">{data.objetivo_cumplimiento}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium mb-1">ROI Potencial</p>
            <p className="text-xs">{data.roi_potencial}</p>
          </div>
        </div>
        
        <div className="border-t pt-4 mt-4">
          <p className="text-xs font-semibold mb-2">KPIs Objetivo del Caso:</p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>ROI {'>'} 300%</div>
            <div>Volumen +20%</div>
            <div>Meta: 25-35%</div>
          </div>
        </div>
      </div>

      {/* Métricas de Transacciones */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Métricas de Transacciones</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
            <h4 className="text-sm font-medium text-gray-600 mb-2">Total Transacciones</h4>
            <p className="text-3xl font-bold text-gray-900">{formatNumber(data.total_transacciones)}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
            <h4 className="text-sm font-medium text-gray-600 mb-2">Con Descuento</h4>
            <p className="text-3xl font-bold text-green-600">{formatNumber(data.transacciones_con_descuento)}</p>
            <p className="text-sm text-gray-500 mt-1">{formatPercentage(data.porcentaje_transacciones_descuento)}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
            <h4 className="text-sm font-medium text-gray-600 mb-2">Total Descuentos</h4>
            <p className="text-3xl font-bold text-purple-600">{formatCurrency(data.total_descuentos_otorgados)}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-indigo-500">
            <h4 className="text-sm font-medium text-gray-600 mb-2">Descuento Promedio</h4>
            <p className="text-3xl font-bold text-indigo-600">{formatCurrency(data.descuento_promedio)}</p>
          </div>
        </div>
      </div>

      {/* Métricas de Productos */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Métricas de Productos</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg shadow">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Total Detalles</h4>
            <p className="text-2xl font-bold text-blue-700">{formatNumber(data.total_detalles)}</p>
            <p className="text-xs text-blue-600 mt-1">Líneas de productos vendidos</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg shadow">
            <h4 className="text-sm font-medium text-green-900 mb-2">Con Descuento</h4>
            <p className="text-2xl font-bold text-green-700">{formatNumber(data.detalles_con_descuento)}</p>
            <p className="text-xs text-green-600 mt-1">{formatPercentage(data.porcentaje_detalles_descuento)} del total</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg shadow">
            <h4 className="text-sm font-medium text-purple-900 mb-2">Ahorro Clientes</h4>
            <p className="text-2xl font-bold text-purple-700">{formatCurrency(data.ahorro_total_clientes)}</p>
            <p className="text-xs text-purple-600 mt-1">Valor generado</p>
          </div>
        </div>
      </div>

      {/* Comparativa Ventas */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Impacto en Ventas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h4 className="text-sm font-medium text-gray-600 mb-2">Ventas sin Descuento</h4>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.total_ventas_sin_descuento)}</p>
            <p className="text-xs text-gray-500 mt-1">Subtotal productos</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-green-200">
            <h4 className="text-sm font-medium text-green-600 mb-2">Ventas con Descuento</h4>
            <p className="text-2xl font-bold text-green-700">{formatCurrency(data.total_ventas_con_descuento)}</p>
            <p className="text-xs text-green-600 mt-1">Total cobrado</p>
          </div>
        </div>
      </div>

      {/* Estadísticas Resumen */}
      <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 p-6 rounded-lg border border-indigo-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Estadísticas Clave</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-3xl font-bold text-indigo-600">{formatPercentage(data.porcentaje_transacciones_descuento)}</p>
            <p className="text-xs text-gray-600 mt-1">Transacciones</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-purple-600">{formatPercentage(data.porcentaje_detalles_descuento)}</p>
            <p className="text-xs text-gray-600 mt-1">Productos</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-pink-600">{formatCurrency(data.descuento_promedio)}</p>
            <p className="text-xs text-gray-600 mt-1">Promedio</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-red-600">{formatCurrency(data.total_descuentos_otorgados)}</p>
            <p className="text-xs text-gray-600 mt-1">Total</p>
          </div>
        </div>
      </div>
    </div>
  );
};
