// backend/src/services/empleados.service.ts
import { SharedService } from '../shared/shared.service'
import { empleadosRepository } from '../repositories/empleados.repository'

export class EmpleadosService extends SharedService {
  constructor() {
    super()
    this.logger.info('EmpleadosService initialized')
  }

  async getMetrics() {
    try {
      const metrics = await empleadosRepository.getEmployeeMetrics()
      // Formatear como en otros servicios
      return metrics.map((m: any) => ({
        empleadoId: m.empleado_id,
        nombre: m.empleado_nombre,
        totalTransactions: Number(m.total_transacciones || 0),
        totalDetails: Number(m.total_detalles || 0),
        totalSalesNet: m.total_ventas_con_descuento,
        totalDiscounts: m.total_descuentos,
        avgDiscount: m.descuento_promedio
      }))
    } catch (error) {
      return this.handleError(error, 'getMetrics')
    }
  }

  async getTopCashiers(limit = 20) {
    try {
      const results = await empleadosRepository.getTopCashiers(limit)
      return results.map((r: any) => ({
        empleadoId: r.empleado_id,
        nombre: r.empleado_nombre,
        totalTransactions: Number(r.total_transacciones || 0)
      }))
    } catch (error) {
      return this.handleError(error, 'getTopCashiers')
    }
  }

  async getHourly(employeeId: number, days = 30) {
    try {
      const rows = await empleadosRepository.getEmployeeHourly(employeeId, days)
      return rows.map((r: any) => ({
        dia: r.dia,
        hora: r.hora,
        transacciones: Number(r.transacciones || 0),
        ventasNeta: r.ventas_netas
      }))
    } catch (error) {
      return this.handleError(error, 'getHourly')
    }
  }

  async getTopProducts(employeeId: number, limit = 20) {
    try {
      const rows = await empleadosRepository.getTopProductsByEmployee(employeeId, limit)
      return rows.map((r: any) => ({
        productId: r.producto_id,
        productName: r.product_name,
        quantity: Number(r.cantidad_vendida || 0),
        totalDiscount: r.total_descuento
      }))
    } catch (error) {
      return this.handleError(error, 'getTopProducts')
    }
  }
}

export const empleadosService = new EmpleadosService()
