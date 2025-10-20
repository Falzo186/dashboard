import { ResponsiveLine } from '@nivo/line';
import type { DistribucionMensual } from '../types';

interface Props {
  data: DistribucionMensual[];
}

export const DistribucionMensualChart = ({ data }: Props) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Distribución Mensual</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          No hay datos de distribución mensual
        </div>
      </div>
    );
  }

  const chartData = [
    {
      id: 'Con Descuento',
      color: 'hsl(217, 70%, 50%)',
      data: data.map(item => ({
        x: item.mes,
        y: parseInt(item.detalles_con_descuento)
      }))
    },
    {
      id: 'Total Detalles',
      color: 'hsl(0, 0%, 60%)',
      data: data.map(item => ({
        x: item.mes,
        y: parseInt(item.total_detalles)
      }))
    }
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Distribución Mensual de Descuentos</h3>
      <div className="h-80">
        <ResponsiveLine
          data={chartData}
          margin={{ top: 20, right: 120, bottom: 60, left: 80 }}
          xScale={{ type: 'point' }}
          yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -45,
            legend: 'Mes',
            legendOffset: 50,
            legendPosition: 'middle'
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Cantidad',
            legendOffset: -60,
            legendPosition: 'middle',
            format: (value) => value.toLocaleString()
          }}
          pointSize={8}
          pointColor={{ theme: 'background' }}
          pointBorderWidth={2}
          pointBorderColor={{ from: 'serieColor' }}
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
              symbolShape: 'circle'
            }
          ]}
        />
      </div>
    </div>
  );
};