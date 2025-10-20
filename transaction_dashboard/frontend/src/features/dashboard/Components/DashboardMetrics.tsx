// frontend/src/components/dashboard/DashboardMetrics.tsx

import React from 'react';

interface MetricsData {
  totalTransactions: string;
  totalRevenue: string;
  uniqueCustomers: string;
  averageTicket: string;
  growthRate: string;
  roiIdentified: string;
}

interface Props {
  metrics: MetricsData;
}

export const DashboardMetrics: React.FC<Props> = ({ metrics }) => {
  const cards = [
    {
      title: 'Transacciones Totales',
      value: metrics.totalTransactions,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-900'
    },
    {
      title: 'Ingresos Totales',
      value: metrics.totalRevenue,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-900'
    },
    {
      title: 'Clientes Únicos',
      value: metrics.uniqueCustomers,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-900'
    },
    {
      title: 'Ticket Promedio',
      value: metrics.averageTicket,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-900'
    },
    {
      title: 'Tasa de Crecimiento',
      value: metrics.growthRate,
      color: 'from-teal-500 to-teal-600',
      bgColor: 'bg-teal-50',
      textColor: 'text-teal-900'
    },
    {
      title: 'ROI Identificado',
      value: metrics.roiIdentified,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-900'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`${card.bgColor} rounded-xl shadow-sm border-2 border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`bg-gradient-to-r ${card.color} text-white px-3 py-1 rounded-full text-xs font-bold`}>
              LIVE
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            {card.title}
          </h3>
          <p className={`text-3xl font-bold ${card.textColor}`}>
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
};