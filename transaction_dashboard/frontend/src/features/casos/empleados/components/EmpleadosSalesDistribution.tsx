import React from 'react'
import { EmpleadoMetric } from '../types'
import { getEmployeeColorTailwind } from '../utils/colors'

export const EmpleadosSalesDistribution: React.FC<{ data: EmpleadoMetric[] }> = ({ data }) => {
  if (!data || !data.length) return null

  // Calculate percentages
  const totalSales = data.reduce((sum, d) => sum + parseFloat(d.totalSalesNet || '0'), 0)
  const dataWithPercentage = data
    .map((d) => ({
      ...d,
      percentage: (parseFloat(d.totalSalesNet || '0') / totalSales) * 100,
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 10) // Top 10

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Distribución de Ventas (Top 10)</h3>
      <div className="space-y-3">
        {dataWithPercentage.map((emp, idx) => (
          <div key={emp.empleadoId} className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${getEmployeeColorTailwind(idx)}`} />
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">{emp.nombre}</span>
                <span className="text-xs font-semibold text-gray-600">{emp.percentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getEmployeeColorTailwind(idx)}`}
                  style={{ width: `${emp.percentage}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
