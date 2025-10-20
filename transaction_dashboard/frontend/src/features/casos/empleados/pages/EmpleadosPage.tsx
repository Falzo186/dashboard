import React from 'react'
import { useEmpleadosMetrics, useTopCashiers } from '../hooks/useEmpleadosData'
import {
  EmpleadosMetrics,
  EmpleadosTable,
  EmpleadosChart,
  EmpleadosKPICards,
  EmpleadosSalesDistribution,
  EmpleadosPerformanceGrid,
  EmpleadosDetailedTable,
} from '../components'
import { Card } from '../../../../components/ui/Card'
import { Spinner } from '../../../../components/ui/Spinner'
import { Button } from '../../../../components/ui/Button'

export const EmpleadosPage: React.FC = () => {
  const { data, isLoading, isError, error } = useEmpleadosMetrics()
  const { data: topData } = useTopCashiers()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Spinner size="xl" />
          <p className="mt-4 text-gray-600">Cargando métricas por empleado...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card padding="lg">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error al cargar datos</h2>
            <p className="text-gray-600 mb-4">{error instanceof Error ? error.message : 'Error desconocido'}</p>
            <Button variant="primary" onClick={() => window.location.reload()}>
              Reintentar
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
          <span className="block text-blue-700">Caso 9:</span>
          <span className="block text-gray-900">Identificación de Cajeros / Empleados</span>
        </h1>
        <p className="text-gray-600">Análisis completo de métricas, rankings y desempeño por empleado</p>
      </div>

      {/* KPI Cards */}
      <EmpleadosKPICards data={data} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EmpleadosChart data={topData || []} />
        <EmpleadosSalesDistribution data={data} />
      </div>

      {/* Performance Grid */}
      <EmpleadosPerformanceGrid data={data} />

      {/* Detailed Table */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Detalle Completo de Empleados</h2>
        <EmpleadosDetailedTable data={data} />
      </div>
    </div>
  )
}
