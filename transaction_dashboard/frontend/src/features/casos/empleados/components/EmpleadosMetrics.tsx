import React from 'react'
import { EmpleadoMetric } from '../types'
import { Card } from '../../../../components/ui/Card'

export const EmpleadosMetrics: React.FC<{ data: EmpleadoMetric[] }> = ({ data }) => {
  const totalTransactions = data.reduce((sum, d) => sum + d.totalTransactions, 0)
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <Card.Header>
          <h3 className="text-lg font-bold">Transacciones Totales</h3>
        </Card.Header>
        <Card.Body>
          <p className="text-2xl font-semibold">{totalTransactions.toLocaleString()}</p>
        </Card.Body>
      </Card>

      <Card>
        <Card.Header>
          <h3 className="text-lg font-bold">Promedio Descuento</h3>
        </Card.Header>
        <Card.Body>
          <p className="text-2xl font-semibold">{data.length ? data[0].avgDiscount : '0'}</p>
        </Card.Body>
      </Card>

      <Card>
        <Card.Header>
          <h3 className="text-lg font-bold">Total Descuentos</h3>
        </Card.Header>
        <Card.Body>
          <p className="text-2xl font-semibold">{data.reduce((s, d) => s + Number(d.totalDiscounts || 0), 0)}</p>
        </Card.Body>
      </Card>
    </div>
  )
}
