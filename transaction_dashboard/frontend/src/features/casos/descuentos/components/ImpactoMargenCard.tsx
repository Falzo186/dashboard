import { ImpactoMargen } from '../types';

interface Props {
  data: ImpactoMargen;
}

export const ImpactoMargenCard = ({ data }: Props) => {
  // Validación defensiva
  if (!data) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="text-gray-500">No hay datos de impacto en margen</div>
      </div>
    );
  }

  const formatCurrency = (value: string) => {
    const num = parseFloat(value || '0');
    return `${num.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
  };

  const formatNumber = (value: string) => parseInt(value).toLocaleString();

  // Determinar color del análisis
  const getAnalisisColor = () => {
    if (data.analisis.includes('bajo')) return 'text-green-700 bg-green-50';
    if (data.analisis.includes('aceptable')) return 'text-blue-700 bg-blue-50';
    if (data.analisis.includes('moderado')) return 'text-yellow-700 bg-yellow-50';
    return 'text-red-700 bg-red-50';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow space-y-6">
      <h3 className="text-lg font-semibold">Impacto en Márgenes</h3>

      {/* Análisis Principal */}
      <div className={`p-4 rounded-lg ${getAnalisisColor()}`}>
        <h4 className="font-semibold mb-2">Análisis de Impacto</h4>
        <p className="text-sm">{data.analisis}</p>
      </div>

      {/* Métricas de Impacto */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Ingresos sin Descuento</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(data.subtotal_sin_descuento)}
          </p>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Ingresos con Descuento</p>
          <p className="text-2xl font-bold text-blue-600">
            {formatCurrency(data.subtotal_con_descuento)}
          </p>
        </div>

        <div className="border border-red-200 rounded-lg p-4 bg-red-50">
          <p className="text-sm text-red-600 mb-1">Diferencia (Descuentos)</p>
          <p className="text-2xl font-bold text-red-700">
            {formatCurrency((parseFloat(data.subtotal_sin_descuento || '0') - parseFloat(data.subtotal_con_descuento || '0')).toString())}
          </p>
        </div>

        <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
          <p className="text-sm text-purple-600 mb-1">% Reducción Margen</p>
          <p className="text-2xl font-bold text-purple-700">
            {parseFloat(data.porcentaje_reduccion).toFixed(2)}%
          </p>
          <p className="text-xs text-purple-600 mt-1">
            {formatNumber(data.detalles_afectados)} transacciones
          </p>
        </div>
      </div>

      {/* Recomendaciones */}
      {data.recomendaciones && data.recomendaciones.length > 0 && (
        <div className="border-t pt-4">
          <h4 className="font-semibold mb-3 text-gray-900">Recomendaciones</h4>
          <ul className="space-y-2">
            {data.recomendaciones.map((recomendacion, index) => (
              <li key={index} className="flex items-start">
                <span className="inline-block w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <span className="text-sm text-gray-700">{recomendacion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};