// backend/src/repositories/descuentos.repository.ts
// ✅ Repository para descuentos - USA vista materializada mv_descuentos_base

import { prisma } from '../config/database';
import type {
  DescuentosMetrics,
  DistribucionMensual,
  ProductoConDescuento,
  DescuentoPorCategoria,
  ImpactoMargen,
  DescuentoPorPromocion
} from './descuentos.types';

export class DescuentosRepository {
  protected prisma = prisma;

  async getMetrics(): Promise<DescuentosMetrics> {
    const result = await this.prisma.$queryRaw<DescuentosMetrics[]>`
      WITH metricas AS (
        SELECT 
          COUNT(*)::text as total_detalles,
          COUNT(DISTINCT transaction_id)::text as total_transacciones,
          COUNT(*) FILTER (WHERE tiene_descuento = true)::text as detalles_con_descuento,
          COUNT(DISTINCT transaction_id) FILTER (WHERE tiene_descuento = true)::text as transacciones_con_descuento,
          ROUND(
            COUNT(*) FILTER (WHERE tiene_descuento = true)::numeric / 
            NULLIF(COUNT(*)::numeric, 0) * 100, 
            2
          )::text as porcentaje_detalles_descuento,
          COALESCE(SUM(descuento_monto), 0)::text as total_descuentos_otorgados,
          COALESCE(ROUND(AVG(descuento_monto) FILTER (WHERE tiene_descuento = true), 2), 0)::text as descuento_promedio,
          COALESCE(SUM(precio_unitario * cantidad), 0)::text as total_ventas_sin_descuento,
          COALESCE(SUM(precio_unitario * cantidad - descuento_monto), 0)::text as total_ventas_con_descuento
        FROM mv_descuentos_base
      )
      SELECT 
        total_detalles,
        total_transacciones,
        detalles_con_descuento,
        transacciones_con_descuento,
        porcentaje_detalles_descuento,
        ROUND(
          transacciones_con_descuento::numeric / 
          NULLIF(total_transacciones::numeric, 0) * 100, 
          2
        )::text as porcentaje_transacciones_descuento,
        total_descuentos_otorgados,
        descuento_promedio,
        total_descuentos_otorgados as ahorro_total_clientes,
        total_ventas_sin_descuento,
        total_ventas_con_descuento
      FROM metricas
    `;

    return result[0] || this.getEmptyMetrics();
  }

  async getDistribucionMensual(): Promise<DistribucionMensual[]> {
    return await this.prisma.$queryRaw<DistribucionMensual[]>`
      WITH mensual AS (
        SELECT 
          DATE_TRUNC('month', fecha_hora) as mes_date,
          COUNT(id)::text as total_detalles,
          COUNT(id) FILTER (WHERE tiene_descuento = true)::text as detalles_con_descuento,
          COALESCE(SUM(descuento_monto), 0)::text as total_descuentos,
          ROUND(
            COUNT(id) FILTER (WHERE tiene_descuento = true)::numeric / 
            NULLIF(COUNT(id)::numeric, 0) * 100, 
            2
          )::text as porcentaje_con_descuento,
          COUNT(DISTINCT transaction_id)::text as transacciones_unicas
        FROM mv_descuentos_base
        GROUP BY DATE_TRUNC('month', fecha_hora)
      )
      SELECT 
        TO_CHAR(mes_date, 'YYYY-MM') as mes,
        TO_CHAR(mes_date, 'YYYY') as año,
        total_detalles,
        detalles_con_descuento,
        total_descuentos,
        porcentaje_con_descuento,
        transacciones_unicas
      FROM mensual
      ORDER BY mes_date DESC
      LIMIT 24
    `;
  }

  async getTopProductos(limit: number = 20): Promise<ProductoConDescuento[]> {
    return await this.prisma.$queryRaw<ProductoConDescuento[]>`
      WITH top_productos AS (
        SELECT 
          producto_id,
          COUNT(*) FILTER (WHERE tiene_descuento = true) as veces_con_descuento,
          COALESCE(ROUND(AVG(descuento_monto) FILTER (WHERE tiene_descuento = true), 2), 0) as descuento_promedio,
          COALESCE(SUM(descuento_monto), 0) as descuento_total,
          COUNT(*) as ventas_totales,
          SUM(cantidad) as cantidad_vendida
        FROM mv_descuentos_base
        GROUP BY producto_id
        HAVING COUNT(*) FILTER (WHERE tiene_descuento = true) > 0
        ORDER BY SUM(descuento_monto) DESC
        LIMIT ${limit}
      )
      SELECT 
        tp.producto_id::text,
        p.product_name,
        COALESCE(p.categories, 'Sin categoría') as categories,
        tp.veces_con_descuento::text,
        tp.descuento_promedio::text,
        tp.descuento_total::text,
        tp.ventas_totales::text,
        tp.cantidad_vendida::text
      FROM top_productos tp
      INNER JOIN products p ON tp.producto_id = p.id
    `;
  }

  async getPorCategoria(): Promise<DescuentoPorCategoria[]> {
    return await this.prisma.$queryRaw<DescuentoPorCategoria[]>`
      WITH productos_con_descuento AS (
        SELECT 
          producto_id,
          COUNT(*) FILTER (WHERE tiene_descuento = true) as detalles_con_descuento,
          COALESCE(ROUND(AVG(descuento_monto) FILTER (WHERE tiene_descuento = true), 2), 0) as descuento_promedio,
          COALESCE(SUM(descuento_monto), 0) as total_descuentos,
          COUNT(*) as total_detalles
        FROM mv_descuentos_base
        GROUP BY producto_id
        HAVING COUNT(*) FILTER (WHERE tiene_descuento = true) > 0
      )
      SELECT 
        COALESCE(p.categories, 'Sin categoría') as categoria,
        COUNT(DISTINCT pcd.producto_id)::text as productos_unicos,
        SUM(pcd.detalles_con_descuento)::text as detalles_con_descuento,
        COALESCE(ROUND(AVG(pcd.descuento_promedio), 2), 0)::text as descuento_promedio,
        SUM(pcd.total_descuentos)::text as total_descuentos,
        ROUND(
          SUM(pcd.detalles_con_descuento)::numeric / 
          NULLIF(SUM(pcd.total_detalles)::numeric, 0) * 100, 
          2
        )::text as porcentaje_detalles
      FROM productos_con_descuento pcd
      INNER JOIN products p ON pcd.producto_id = p.id
      GROUP BY p.categories
      ORDER BY SUM(pcd.total_descuentos) DESC
      LIMIT 15
    `;
  }

  async getImpactoMargen(): Promise<ImpactoMargen> {
    const result = await this.prisma.$queryRaw<ImpactoMargen[]>`
      SELECT 
        COALESCE(SUM(precio_unitario * cantidad), 0)::text as subtotal_sin_descuento,
        COALESCE(SUM(precio_unitario * cantidad - descuento_monto), 0)::text as subtotal_con_descuento,
        COALESCE(SUM(descuento_monto), 0)::text as total_descuentos,
        ROUND(
          COALESCE(SUM(descuento_monto), 0)::numeric / 
          NULLIF(SUM(precio_unitario * cantidad)::numeric, 0) * 100, 
          2
        )::text as porcentaje_reduccion,
        COUNT(*) FILTER (WHERE tiene_descuento = true)::text as detalles_afectados,
        COUNT(DISTINCT promo_id) FILTER (WHERE promo_id IS NOT NULL)::text as promociones_aplicadas
      FROM mv_descuentos_base
    `;

    return result[0] || this.getEmptyImpacto();
  }

  async getPorPromocion(): Promise<DescuentoPorPromocion[]> {
    return await this.prisma.$queryRaw<DescuentoPorPromocion[]>`
      SELECT 
        promo_id::text,
        COUNT(*)::text as usos,
        COALESCE(SUM(descuento_monto), 0)::text as total_descuentos,
        COALESCE(ROUND(AVG(descuento_monto), 2), 0)::text as descuento_promedio,
        COUNT(DISTINCT producto_id)::text as productos_afectados
      FROM mv_descuentos_base
      WHERE promo_id IS NOT NULL AND tiene_descuento = true
      GROUP BY promo_id
      ORDER BY SUM(descuento_monto) DESC
      LIMIT 20
    `;
  }

  private getEmptyMetrics(): DescuentosMetrics {
    return {
      total_detalles: '0',
      total_transacciones: '0',
      detalles_con_descuento: '0',
      transacciones_con_descuento: '0',
      porcentaje_detalles_descuento: '0',
      porcentaje_transacciones_descuento: '0',
      total_descuentos_otorgados: '0',
      descuento_promedio: '0',
      ahorro_total_clientes: '0',
      total_ventas_sin_descuento: '0',
      total_ventas_con_descuento: '0'
    };
  }

  private getEmptyImpacto(): ImpactoMargen {
    return {
      subtotal_sin_descuento: '0',
      subtotal_con_descuento: '0',
      total_descuentos: '0',
      porcentaje_reduccion: '0',
      detalles_afectados: '0',
      promociones_aplicadas: '0'
    };
  }
}

export const descuentosRepository = new DescuentosRepository();