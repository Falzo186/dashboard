// frontend/src/components/dashboard/SalesOverTimeChart.tsx

import React from 'react';
import { ResponsiveLine } from '@nivo/line';

interface SalesDataPoint {
  date: string;
  sales: number;
  transactions: number;
}

interface Props {
  data: SalesDataPoint[];
}

export const SalesOverTimeChart: React.FC<Props> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <p className="text-gray-500">No hay datos de ventas disponibles</p>
      </div>
    );
  }

  // Transformar datos para Nivo
  const chartData = [
    {
      id: 'Ventas',
      data: data.map(d => ({
        x: d.date,
        y: d.sales
      }))
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            Ventas en el Tiempo
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Tendencia de ventas por período
          </p>
        </div>
      </div>
      
      <div style={{ height: 350 }}>
        <ResponsiveLine
          data={chartData}
          margin={{ top: 20, right: 120, bottom: 60, left: 80 }}
          xScale={{ type: 'point' }}
          yScale={{
            type: 'linear',
            min: 'auto',
            max: 'auto',
            stacked: false,
            reverse: false
          }}
          yFormat=" >-,.0f"
          curve="catmullRom"
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -45,
            legend: 'Fecha',
            legendOffset: 50,
            legendPosition: 'middle'
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Ventas ($)',
            legendOffset: -70,
            legendPosition: 'middle',
            format: ' >-,.0f'
          }}
          pointSize={8}
          pointColor={{ theme: 'background' }}
          pointBorderWidth={2}
          pointBorderColor={{ from: 'serieColor' }}
          pointLabelYOffset={-12}
          enableArea={true}
          areaOpacity={0.15}
          useMesh={true}
          legends={[
            {
              anchor: 'bottom-right',
              direction: 'column',
              justify: false,
              translateX: 100,
              translateY: 0,
              itemsSpacing: 0,
              itemDirection: 'left-to-right',
              itemWidth: 80,
              itemHeight: 20,
              itemOpacity: 0.75,
              symbolSize: 12,
              symbolShape: 'circle',
              symbolBorderColor: 'rgba(0, 0, 0, .5)',
              effects: [
                {
                  on: 'hover',
                  style: {
                    itemBackground: 'rgba(0, 0, 0, .03)',
                    itemOpacity: 1
                  }
                }
              ]
            }
          ]}
          colors={{ scheme: 'category10' }}
          tooltip={({ point }) => (
            <div className="bg-white px-3 py-2 shadow-lg rounded border">
              <strong>{point.data.xFormatted}</strong>
              <br />
              Ventas: <strong>${Number(point.data.y).toLocaleString()}</strong>
            </div>
          )}
        />
      </div>
    </div>
  );
};