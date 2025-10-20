import React from 'react'
import { EmpleadoMetric } from '../types'
import { getEmployeeColorTailwind } from '../utils/colors'

export const EmpleadosDetailedTable: React.FC<{ data: EmpleadoMetric[] }> = ({ data }) => {
  if (!data || !data.length) return null

  const sorted = [...data].sort((a, b) => b.totalTransactions - a.totalTransactions)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Empleado</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Transacciones</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Detalles</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Ventas Netas</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Descuentos</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Avg Descuento</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sorted.map((emp, idx) => (
              <tr key={emp.empleadoId} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getEmployeeColorTailwind(idx)}`} />
                    <span className="font-medium text-gray-900">{emp.nombre}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {emp.totalTransactions.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {emp.totalDetails.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  ${(parseFloat(emp.totalSalesNet || '0') / 1000000).toFixed(2)}M
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                  ${(parseFloat(emp.totalDiscounts || '0') / 1000000).toFixed(2)}M
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${emp.avgDiscount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
