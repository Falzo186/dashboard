// frontend/src/components/dashboard/HourlyDistributionChart.tsx

import React from 'react';
import { ResponsiveBar } from '@nivo/bar';

interface HourlyData {
  hour: string;
  transactions: number;
  percentage: number;
  [key: string]: string | number;
}

interface Props {
  data: HourlyData[];
}

export const HourlyDistributionChart: React.FC<Props> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <p className="text-gray-500">No hay datos horarios disponibles</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900">
          Distribución por Hora
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Transacciones por hora del día
        </p>
      </div>
      
      <div style={{ height: 300 }}>
        <ResponsiveBar
          data={data}
          keys={['transactions']}
          indexBy="hour"
          margin={{ top: 20, right: 30, bottom: 50, left: 60 }}
          padding={0.3}
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
            tickRotation: 0,
            legend: 'Hora',
            legendPosition: 'middle',
            legendOffset: 40
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Transacciones',
            legendPosition: 'middle',
            legendOffset: -50
          }}
          labelSkipWidth={12}
          labelSkipHeight={12}
          labelTextColor={{
            from: 'color',
            modifiers: [['darker', 1.6]]
          }}
          tooltip={({ value, indexValue, data }) => (
            <div className="bg-white px-3 py-2 shadow-lg rounded border">
              <strong>Hora: {indexValue}</strong>
              <br />
              Transacciones: <strong>{value.toLocaleString()}</strong>
              <br />
              Porcentaje: <strong>{data.percentage}%</strong>
            </div>
          )}
          role="application"
        />
      </div>
    </div>
  );
};