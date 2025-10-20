// frontend/src/pages/DashboardHomePage.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboardAnalytics } from '../hooks/useDashboardAnalythics';
import { DashboardMetrics } from '../Components/DashboardMetrics';
import { SalesOverTimeChart } from '../Components/SalesOverTImeChart';
import { HourlyDistributionChart } from '../Components/HourlyDistributionChart';
import { PaymentMethodsChart } from '../Components/PaymentMethodsChart';
import { QuickAccessGrid } from '../Components/QuickAccessGrid';
import { TopProductsChart } from '../Components/TopProducts';


export const DashboardHomePage: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useDashboardAnalytics();

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-indigo-600 mx-auto mb-6"></div>
          <p className="text-xl text-gray-700 font-medium">Cargando analíticas...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-pink-100">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md border-2 border-red-200">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-red-900 mb-2">Error de Conexión</h3>
            <p className="text-red-700 mb-4">
              No se pudo conectar con el backend. Verifica que el servidor esté corriendo.
            </p>
            <code className="text-sm bg-red-50 px-3 py-1 rounded">
              http://localhost:3001
            </code>
          </div>
          <button
            onClick={() => refetch()}
            className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition font-medium"
          >
            Reintentar Conexión
          </button>
        </div>
      </div>
    );
  }

  // No data state
  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            No hay datos disponibles
          </h3>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Dashboard de Análisis
              </h1>
              <p className="text-xl text-indigo-100">
                Vista general del negocio con datos en tiempo real
              </p>
            </div>
            <button
              onClick={() => refetch()}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 rounded-xl transition font-medium"
            >
              Actualizar
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8 space-y-8">
        
        {/* Métricas Principales */}
        <DashboardMetrics metrics={data.metrics} />

        {/* Gráficos Principales - Grid 2x2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Ventas en el Tiempo */}
          <div className="lg:col-span-2">
            <SalesOverTimeChart data={data.salesOverTime} />
          </div>

          {/* Distribución Horaria */}
          <HourlyDistributionChart data={data.hourlyDistribution} />

          {/* Métodos de Pago */}
          <PaymentMethodsChart data={data.paymentMethods} />

          {/* Top Productos */}
          <div className="lg:col-span-2">
            <TopProductsChart data={data.topProducts} />
          </div>
        </div>

        {/* Accesos Rápidos */}
        <QuickAccessGrid onNavigate={(path) => navigate(path)} />

        {/* Alertas e Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Alerta Crítica */}
          {data.alerts?.critical && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <div>
                  <h3 className="font-bold text-red-900 mb-2">Alerta Crítica</h3>
                  <p className="text-sm text-red-700">{data.alerts.critical}</p>
                </div>
              </div>
            </div>
          )}

          {/* Oportunidad */}
          {data.alerts?.opportunity && (
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <div>
                  <h3 className="font-bold text-green-900 mb-2">Oportunidad</h3>
                  <p className="text-sm text-green-700">{data.alerts.opportunity}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tendencia */}
          {data.alerts?.trend && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <div>
                  <h3 className="font-bold text-blue-900 mb-2">Tendencia</h3>
                  <p className="text-sm text-blue-700">{data.alerts.trend}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};