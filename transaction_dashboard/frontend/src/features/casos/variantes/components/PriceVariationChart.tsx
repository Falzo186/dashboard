// frontend/src/features/casos/variantes/components/PriceVariationChart.tsx

import React from 'react';
import type { PriceVariation } from '../types';

interface Props {
  data: PriceVariation[];
}

export const PriceVariationChart: React.FC<Props> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">No hay datos de precios disponibles</p>
      </div>
    );
  }

  // Agrupar por producto base (top 5)
  const productBases = Array.from(new Set(data.map(d => d.baseName))).slice(0, 5);
  
  // Crear tabla de comparación en lugar de scatter plot
  const tableData = data
    .filter(d => productBases.includes(d.baseName))
    .sort((a, b) => parseFloat(b.variacionPrecio) - parseFloat(a.variacionPrecio));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Variación de Precios entre Variantes
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        Top 5 productos con mayor diferencia de precios
      </p>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Producto Base</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Variante</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Precio Promedio</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Variación</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((item, idx) => (
              <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-800">{item.baseName}</td>
                <td className="px-4 py-3 text-gray-600">{item.variantValue}</td>
                <td className="px-4 py-3 text-right text-gray-800">${item.precioPromedio}</td>
                <td className="px-4 py-3 text-right">
                  <span
                    className={`font-semibold ${
                      parseFloat(item.variacionPrecio) > 0
                        ? 'text-red-600'
                        : parseFloat(item.variacionPrecio) < 0
                          ? 'text-green-600'
                          : 'text-gray-600'
                    }`}
                  >
                    {item.variacionPrecio}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};