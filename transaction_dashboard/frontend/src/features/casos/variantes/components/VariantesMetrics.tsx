// frontend/src/features/casos/variantes/components/VariantesMetrics.tsx

import React from 'react';
import type { VariantMetrics } from '../types';

interface Props {
  metrics: VariantMetrics;
}

export const VariantesMetrics: React.FC<Props> = ({ metrics }) => {
  if (!metrics) return null;

  const cards = [
    {
      title: 'Total de Productos',
      value: metrics.totalProductos,
      color: 'bg-blue-50 border-blue-200'
    },
    {
      title: 'Productos con Variantes',
      value: metrics.productosConVariantes,
      color: 'bg-purple-50 border-purple-200'
    },
    {
      title: 'Promedio Variantes/Producto',
      value: metrics.promedioVariantesPorProducto,
      color: 'bg-green-50 border-green-200'
    },
    {
      title: 'Tipo Más Común',
      value: metrics.tipoVarianteMasComun,
      color: 'bg-orange-50 border-orange-200'
    },
    {
      title: 'Cobertura de Variantes',
      value: metrics.porcentajeProductosConVariantes,
      color: 'bg-indigo-50 border-indigo-200',
      subtitle: 'del catálogo'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`${card.color} border-2 rounded-lg p-4 transition-all hover:shadow-md`}
        >
          <h3 className="text-sm font-medium text-gray-600 mb-1">
            {card.title}
          </h3>
          <p className="text-2xl font-bold text-gray-900">
            {card.value}
          </p>
          {card.subtitle && (
            <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
          )}
        </div>
      ))}
    </div>
  );
};