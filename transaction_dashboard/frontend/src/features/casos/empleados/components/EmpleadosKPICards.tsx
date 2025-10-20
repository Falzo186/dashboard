import React from 'react'
import { EmpleadoMetric } from '../types'
import { Card } from '../../../../components/ui/Card'

interface KPICardProps {
  label: string
  value: string | number
  icon?: string
  color?: string
}

const KPICard: React.FC<KPICardProps> = ({ label, value, icon, color = 'blue' }) => {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200',
    red: 'bg-red-50 border-red-200',
    green: 'bg-green-50 border-green-200',
    purple: 'bg-purple-50 border-purple-200',
    amber: 'bg-amber-50 border-amber-200',
    pink: 'bg-pink-50 border-pink-200',
  }

  const textColorClasses: Record<string, string> = {
    blue: 'text-blue-700',
    red: 'text-red-700',
    green: 'text-green-700',
    purple: 'text-purple-700',
    amber: 'text-amber-700',
    pink: 'text-pink-700',
  }

  return (
    <div className={`${colorClasses[color]} border rounded-lg p-4 flex items-center justify-between`}>
      <div>
        <p className="text-sm text-gray-600 mb-1">{label}</p>
        <p className={`text-2xl font-bold ${textColorClasses[color]}`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
      </div>
      {icon && <div className="text-4xl">{icon}</div>}
    </div>
  )
}

export const EmpleadosKPICards: React.FC<{ data: EmpleadoMetric[] }> = ({ data }) => {
  if (!data || !data.length) return null

  const totalTransactions = data.reduce((sum, d) => sum + d.totalTransactions, 0)
  const totalDetails = data.reduce((sum, d) => sum + d.totalDetails, 0)
  const totalSalesNet = data.reduce((sum, d) => sum + parseFloat(d.totalSalesNet || '0'), 0)
  const totalDiscounts = data.reduce((sum, d) => sum + parseFloat(d.totalDiscounts || '0'), 0)
  const avgDiscount = data.length ? (totalDiscounts / totalDetails).toFixed(2) : '0'
  const employeeCount = data.length

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <KPICard label="Total Transacciones" value={totalTransactions.toLocaleString()} color="blue" />
      <KPICard label="Total Detalles" value={totalDetails.toLocaleString()} color="green" />
      <KPICard
        label="Total Ventas Netas"
        value={`$${(totalSalesNet / 1000000).toFixed(2)}M`}
        color="purple"
      />
      <KPICard label="Total Descuentos" value={`$${(totalDiscounts / 1000000).toFixed(2)}M`} color="amber" />
      <KPICard label="Descuento Promedio" value={`$${avgDiscount}`} color="red" />
      <KPICard label="Empleados Activos" value={employeeCount} color="pink" />
    </div>
  )
}
