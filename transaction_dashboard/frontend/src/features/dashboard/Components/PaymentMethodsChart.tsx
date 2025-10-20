// frontend/src/components/dashboard/PaymentMethodsChart.tsx

import React from 'react';
import { ResponsivePie } from '@nivo/pie';

interface PaymentMethod {
  id: string;
  label: string;
  value: number;
  percentage: string;
}

interface Props {
  data: PaymentMethod[];
}

export const PaymentMethodsChart: React.FC<Props> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <p className="text-gray-500">No hay datos de métodos de pago disponibles</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900">
          Métodos de Pago
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Distribución de formas de pago
        </p>
      </div>
      
      <div style={{ height: 300 }}>
        <ResponsivePie
          data={data}
          margin={{ top: 20, right: 80, bottom: 20, left: 80 }}
          innerRadius={0.5}
          padAngle={0.7}
          cornerRadius={3}
          activeOuterRadiusOffset={8}
          borderWidth={1}
          borderColor={{
            from: 'color',
            modifiers: [['darker', 0.2]]
          }}
          arcLinkLabelsSkipAngle={10}
          arcLinkLabelsTextColor="#333333"
          arcLinkLabelsThickness={2}
          arcLinkLabelsColor={{ from: 'color' }}
          arcLabelsSkipAngle={10}
          arcLabelsTextColor={{
            from: 'color',
            modifiers: [['darker', 2]]
          }}
          colors={{ scheme: 'nivo' }}
          tooltip={({ datum }) => (
            <div className="bg-white px-3 py-2 shadow-lg rounded border">
              <strong>{datum.label}</strong>
              <br />
              Transacciones: <strong>{datum.value.toLocaleString()}</strong>
              <br />
              Porcentaje: <strong>{datum.data.percentage}</strong>
            </div>
          )}
        />
      </div>
    </div>
  );
};