// frontend/src/components/dashboard/TopProductsChart.tsx

import React from 'react';
import { ResponsiveBar } from '@nivo/bar';

interface TopProduct {
  product: string;
  sales: number;
  quantity: number;
}

interface Props {
  data: TopProduct[];
}

export const TopProductsChart: React.FC<Props> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <p className="text-gray-500">No hay datos de productos disponibles</p>
      </div>
    );
  }

  // Truncar nombres largos
  const chartData = data.map(d => ({
    ...d,
    product: d.product.length > 30 ? d.product.substring(0, 30) + '...' : d.product
  }));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900">
          Top 10 Productos Más Vendidos
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Productos con mayor volumen de ventas
        </p>
      </div>
      
      <div style={{ height: 400 }}>
        <ResponsiveBar
          data={chartData}
          keys={['sales']}
          indexBy="product"
          margin={{ top: 20, right: 130, bottom: 100, left: 80 }}
          padding={0.3}
          layout="horizontal"
          valueScale={{ type: 'linear' }}
          indexScale={{ type: 'band', round: true }}
          colors={{ scheme: 'category10' }}
          borderColor={{
            from: 'color',
            modifiers: [['darker', 1.6]]
          }}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Ventas ($)',
            legendPosition: 'middle',
            legendOffset: 40,
            format: ' >-,.0f'
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: '',
            legendPosition: 'middle',
            legendOffset: 0
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
          tooltip={({ id, value, indexValue, data }) => (
            <div className="bg-white px-3 py-2 shadow-lg rounded border">
              <strong>{indexValue}</strong>
              <br />
              Ventas: <strong>${value.toLocaleString()}</strong>
              <br />
              Cantidad: <strong>{data.quantity.toLocaleString()} unidades</strong>
            </div>
          )}
          role="application"
        />
      </div>
    </div>
  );
};