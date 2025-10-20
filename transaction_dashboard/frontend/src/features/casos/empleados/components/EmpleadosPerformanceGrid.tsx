import React from 'react'
import { EmpleadoMetric } from '../types'
import { getEmployeeColorTailwind } from '../utils/colors'

interface PerformanceMetric {
  empleadoId: number
  nombre: string
  transaccionesPromedio: number
  eficiencia: number // sales per detail
}

export const EmpleadosPerformanceGrid: React.FC<{ data: EmpleadoMetric[] }> = ({ data }) => {
  if (!data || !data.length) return null

const performanceData: PerformanceMetric[] = data.map((emp) => ({
    empleadoId: emp.empleadoId,
    nombre: emp.nombre,
    transaccionesPromedio: Math.round(emp.totalTransactions / emp.totalDetails),
    eficiencia: parseFloat(emp.totalSalesNet || '0') / emp.totalDetails,
  }))

  const sorted = performanceData.sort((a, b) => b.eficiencia - a.eficiencia).slice(0, 6)

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Eficiencia de Empleados</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map((emp, idx) => (
          <div
            key={emp.empleadoId}
            className={`${getEmployeeColorTailwind(idx)} bg-opacity-10 rounded-lg p-4 border-l-4 ${getEmployeeColorTailwind(idx)}`}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-800">{emp.nombre}</h4>
              <span className="inline-block w-3 h-3 rounded-full bg-opacity-100"></span>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-gray-600">
                <span className="font-medium">Avg/Tx:</span> ${emp.transaccionesPromedio.toFixed(2)}
              </div>
              <div className="text-xs text-gray-600">
                <span className="font-medium">Eficiencia:</span> ${emp.eficiencia.toFixed(2)}/item
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
