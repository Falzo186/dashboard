import React from 'react'
import { EmpleadoMetric } from '../types'

export const EmpleadosTable: React.FC<{ data: EmpleadoMetric[] }> = ({ data }) => {
  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empleado</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transacciones</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detalles</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ventas Netas</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {data.map((row) => (
          <tr key={row.empleadoId}>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.nombre}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.totalTransactions.toLocaleString()}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.totalDetails.toLocaleString()}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.totalSalesNet}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
