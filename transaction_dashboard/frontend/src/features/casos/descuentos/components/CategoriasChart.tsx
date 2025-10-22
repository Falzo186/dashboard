import { ResponsiveBar } from '@nivo/bar';
import type { DescuentoPorCategoria } from '../types';
import { DESCUENTOS_CONFIG } from '../config';

interface Props {
  data: DescuentoPorCategoria[];
}

export const CategoriasChart = ({ data }: Props) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Descuentos por Categoría</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">No hay datos</div>
      </div>
    );
  }

  const chartData = data.map(item => ({
    categoria: item.categoria.length > DESCUENTOS_CONFIG.MAX_CATEGORIA_NAME_LENGTH 
      ? item.categoria.substring(0, DESCUENTOS_CONFIG.MAX_CATEGORIA_NAME_LENGTH) + '...' 
      : item.categoria,
    'Detalles': parseInt(item.detalles_con_descuento),
    'Productos': parseInt(item.productos_unicos)
  }));

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Descuentos por Categoría</h3>
      <div className="h-96">
        <ResponsiveBar
          data={chartData}
          keys={['Detalles', 'Productos']}
          indexBy="categoria"
          margin={{ top: 20, right: 130, bottom: 80, left: 80 }}
          padding={0.3}
          groupMode="grouped"
          colors={{ scheme: 'nivo' }}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -45,
            legend: 'Categoría',
            legendPosition: 'middle',
            legendOffset: 60
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Cantidad',
            legendPosition: 'middle',
            legendOffset: -60,
            format: (value) => value.toLocaleString()
          }}
          labelSkipWidth={12}
          labelSkipHeight={12}
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
              symbolSize: 20
            }
          ]}
        />
      </div>
    </div>
  );
};