// frontend/src/components/dashboard/CasosProgress.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';

interface CasoStatus {
  id: number;
  name: string;
  status: 'completed' | 'active' | 'error' | 'pending';
  icon: string;
  path: string;
  roi?: string;
  completion: number;
}

interface Props {
  casos: CasoStatus[];
}

export const CasosProgress: React.FC<Props> = ({ casos }) => {
  const navigate = useNavigate();

  const getStatusBadge = (status: string) => {
    const badges = {
      completed: { bg: 'bg-green-100', text: 'text-green-800', label: '✓ Completo' },
      active: { bg: 'bg-blue-100', text: 'text-blue-800', label: '⚡ Activo' },
      error: { bg: 'bg-red-100', text: 'text-red-800', label: '⚠ Error' },
      pending: { bg: 'bg-gray-100', text: 'text-gray-800', label: '⏸ Pendiente' }
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  const completedCount = casos.filter(c => c.status === 'completed').length;
  const totalCasos = casos.length;
  const overallProgress = (completedCount / totalCasos) * 100;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-6">
        <h2 className="text-2xl font-bold mb-2">
          Progreso de Casos de Uso
        </h2>
        <p className="text-indigo-100">
          {completedCount} de {totalCasos} casos completados
        </p>
        
        {/* Barra de progreso general */}
        <div className="mt-4 bg-white/20 rounded-full h-3 overflow-hidden">
          <div
            className="bg-white h-full transition-all duration-500 rounded-full"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
        <p className="text-sm text-indigo-100 mt-2 text-right">
          {overallProgress.toFixed(0)}% completado
        </p>
      </div>

      {/* Lista de casos */}
      <div className="p-6 space-y-3">
        {casos.map((caso) => {
          const badge = getStatusBadge(caso.status);
          
          return (
            <div
              key={caso.id}
              onClick={() => navigate(caso.path)}
              className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-all hover:shadow-md border border-gray-200"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="text-3xl">{caso.icon}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{caso.name}</h3>
                  {caso.roi && (
                    <p className="text-sm text-gray-600">ROI: {caso.roi}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Barra de progreso individual */}
                <div className="w-24 bg-gray-200 rounded-full h-2 hidden md:block">
                  <div
                    className={`h-full rounded-full transition-all ${
                      caso.status === 'completed' ? 'bg-green-500' :
                      caso.status === 'active' ? 'bg-blue-500' :
                      caso.status === 'error' ? 'bg-red-500' : 'bg-gray-400'
                    }`}
                    style={{ width: `${caso.completion}%` }}
                  />
                </div>

                {/* Badge de estado */}
                <span className={`${badge.bg} ${badge.text} px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap`}>
                  {badge.label}
                </span>

                {/* Flecha */}
                <span className="text-gray-400 text-xl">→</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};