// frontend/src/components/dashboard/QuickAccessGrid.tsx

import React from 'react';

interface Props {
  onNavigate: (path: string) => void;
}

export const QuickAccessGrid: React.FC<Props> = ({ onNavigate }) => {
  const quickLinks = [
    {
      title: 'Patrones Horarios',
      description: 'Análisis de transacciones por hora',
      path: '/casos/horarios',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Control de Caducidad',
      description: 'Productos próximos a vencer',
      path: '/casos/caducidad',
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Gestión de Precios',
      description: 'Análisis de precios y promociones',
      path: '/casos/precios',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Identificación Clientes',
      description: 'Segmentación y análisis de clientes',
      path: '/casos/clientes',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Seguimiento Inventario',
      description: 'Control de stock y movimientos',
      path: '/casos/inventario',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Métodos de Pago',
      description: 'Análisis de formas de pago',
      path: '/casos/pagos',
      color: 'from-teal-500 to-teal-600',
      bgColor: 'bg-teal-50'
    },
    {
      title: 'Control Devoluciones',
      description: 'Productos devueltos y motivos',
      path: '/casos/devoluciones',
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50'
    },
    {
      title: 'Descuentos y Promos',
      description: 'Análisis de estrategias promocionales',
      path: '/casos/descuentos',
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Productividad Empleados',
      description: 'Análisis de desempeño del equipo',
      path: '/casos/empleados',
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      title: 'Variantes de Productos',
      description: 'Análisis de presentaciones y SKUs',
      path: '/casos/variantes',
      color: 'from-cyan-500 to-cyan-600',
      bgColor: 'bg-cyan-50'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-2xl font-bold mb-6">
        Acceso Rápido a Casos de Uso
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {quickLinks.map((link, index) => (
          <button
            key={index}
            onClick={() => onNavigate(link.path)}
            className={`${link.bgColor} rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 border-gray-200 text-left`}
          >
            <h3 className="font-bold text-gray-900 mb-1 text-sm">
              {link.title}
            </h3>
            <p className="text-xs text-gray-600">
              {link.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};