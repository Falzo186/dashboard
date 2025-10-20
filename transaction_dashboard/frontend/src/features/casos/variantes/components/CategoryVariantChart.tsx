// frontend/src/features/casos/variantes/components/CategoryVariantsChart.tsx

import React from 'react';
import { ResponsiveBar } from '@nivo/bar';
import type { CategoryAnalysis } from '../types';

interface Props {
  data: CategoryAnalysis[];
}

export const CategoryVariantsChart: React.FC<Props> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">No hay datos de categorías disponibles</p>
      </div>
    );
  }

  // Tomar top 10 categorías
  const chartData = data.slice(0, 10).map(item => ({
    categoria: item.categoria.length > 20 
      ? item.categoria.substring(0, 20) + '...' 
      : item.categoria,
    'Total Variantes': item.totalVariantes,
    'Productos': item.productosConVariantes
  }));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Variantes por Categoría (Top 10)
      </h3>
      
      <div style={{ height: 400 }}>
        <ResponsiveBar
          data={chartData}
          keys={['Total Variantes', 'Productos']}
          indexBy="categoria"
          margin={{ top: 20, right: 130, bottom: 80, left: 60 }}
          padding={0.3}
          groupMode="grouped"
          valueScale={{ type: 'linear' }}
          indexScale={{ type: 'band', round: true }}
          colors={{ scheme: 'nivo' }}
          borderColor={{
            from: 'color',
            modifiers: [['darker', 1.6]]
          }}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -45,
            legend: 'Categoría',
            legendPosition: 'middle',
            legendOffset: 70
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Cantidad',
            legendPosition: 'middle',
            legendOffset: -50
          }}
          labelSkipWidth={12}
          labelSkipHeight={12}
          labelTextColor={{
            from: 'color',
            modifiers: [['darker', 1.6]]
          }}
          legends={[
            {
              dataFrom: 'keys',
              anchor: 'bottom-right',
              direction: 'column',
              justify: false,
              translateX: 120,
              translateY: 0,
              itemsSpacing: 2,
              itemWidth: 100,
              itemHeight: 20,
              itemDirection: 'left-to-right',
              itemOpacity: 0.85,
              symbolSize: 20,
              effects: [
                {
                  on: 'hover',
                  style: {
                    itemOpacity: 1
                  }
                }
              ]
            }
          ]}
          role="application"
          ariaLabel="Gráfico de variantes por categoría"
          tooltip={({ id, value, indexValue }) => (
            <div className="bg-white px-3 py-2 shadow-lg rounded border">
              <strong>{indexValue}</strong>
              <br />
              {id}: <strong>{value}</strong>
            </div>
          )}
        />
      </div>
    </div>
  );
};