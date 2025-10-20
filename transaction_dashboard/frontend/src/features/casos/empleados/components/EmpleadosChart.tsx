import React from 'react'
import { EmpleadoTop } from '../types'

export const EmpleadosChart: React.FC<{ data: EmpleadoTop[] }> = ({ data }) => {
  if (!data || !data.length) return null

  const max = Math.max(...data.map((d) => d.totalTransactions))

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <h3 className="text-lg font-semibold mb-3">Top Cajeros </h3>
      <div className="space-y-3">
        {data.map((d) => (
          <div key={d.empleadoId} className="flex items-center space-x-4">
            <div className="w-32 text-sm font-medium text-gray-700">{d.nombre}</div>
            <div className="flex-1 h-6 bg-gray-100 rounded overflow-hidden">
              <div
                className="h-6 bg-blue-500"
                style={{ width: `${(d.totalTransactions / max) * 100}%` }}
              />
            </div>
            <div className="w-28 text-right text-sm text-gray-600">{d.totalTransactions.toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default EmpleadosChart
