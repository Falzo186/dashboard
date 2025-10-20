// backend/src/repositories/empleados.repository.ts
// Repository para Caso de Uso 9: Identificación del Cajero/Empleado

import logger from '@/utils/logger'
import { prisma } from '../config/database'

export class EmpleadosRepository {
  private prisma = prisma

  constructor() {
    logger.info('✅ EmpleadosRepository initialized')
  }

  /**
   * Devuelve métricas agregadas por empleado desde una vista materializada
   * Se asume que la vista `mv_employee_metrics` será creada en la BD
   */
  async getEmployeeMetrics() {
    const result = await this.prisma.$queryRaw<any[]>`
      SELECT 
        empleado_id,
        empleado_nombre,
        total_transacciones::bigint as total_transacciones,
        total_detalles::bigint as total_detalles,
        total_ventas_sin_descuento::text,
        total_ventas_con_descuento::text,
        total_descuentos::text,
        descuento_promedio::text
      FROM mv_employee_metrics
      ORDER BY total_transacciones DESC
    `
    return result
  }

  async getTopCashiers(limit: number = 20) {
    const result = await this.prisma.$queryRaw<any[]>`
      SELECT empleado_id, empleado_nombre, total_transacciones::bigint as total_transacciones
      FROM mv_employee_metrics
      ORDER BY total_transacciones DESC
      LIMIT ${limit}
    `
    return result
  }

  async getEmployeeHourly(employeeId: number, days: number = 30) {
    const result = await this.prisma.$queryRaw<any[]>`
      SELECT dia, hora, transacciones::bigint as transacciones, ventas_netas::text as ventas_netas
      FROM mv_employee_hourly
      WHERE empleado_id = ${employeeId}
      AND dia >= CURRENT_DATE - INTERVAL '${days} days'
      ORDER BY dia DESC, hora DESC
    `
    return result
  }

  async getTopProductsByEmployee(employeeId: number, limit: number = 20) {
    const result = await this.prisma.$queryRaw<any[]>`
      SELECT producto_id, product_name, cantidad_vendida::bigint as cantidad_vendida, total_descuento::text as total_descuento
      FROM mv_employee_top_products
      WHERE empleado_id = ${employeeId}
      ORDER BY cantidad_vendida DESC
      LIMIT ${limit}
    `
    return result
  }
}

export const empleadosRepository = new EmpleadosRepository()
