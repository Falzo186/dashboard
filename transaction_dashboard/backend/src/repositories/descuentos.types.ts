// backend/src/repositories/descuentos.types.ts
// ✅ Tipos para el caso de uso de Descuentos

export interface DescuentosMetrics {
  total_detalles: string;
  total_transacciones: string;
  detalles_con_descuento: string;
  transacciones_con_descuento: string;
  porcentaje_detalles_descuento: string;
  porcentaje_transacciones_descuento: string;
  total_descuentos_otorgados: string;
  descuento_promedio: string;
  ahorro_total_clientes: string;
  total_ventas_sin_descuento: string;
  total_ventas_con_descuento: string;
}

export interface DistribucionMensual {
  mes: string;
  año: string;
  total_detalles: string;
  detalles_con_descuento: string;
  total_descuentos: string;
  porcentaje_con_descuento: string;
  transacciones_unicas: string;
}

export interface ProductoConDescuento {
  producto_id: string;
  product_name: string;
  categories: string;
  veces_con_descuento: string;
  descuento_promedio: string;
  descuento_total: string;
  ventas_totales: string;
  cantidad_vendida: string;
}

export interface DescuentoPorCategoria {
  categoria: string;
  productos_unicos: string;
  detalles_con_descuento: string;
  descuento_promedio: string;
  total_descuentos: string;
  porcentaje_detalles: string;
}

export interface ImpactoMargen {
  subtotal_sin_descuento: string;
  subtotal_con_descuento: string;
  total_descuentos: string;
  porcentaje_reduccion: string;
  detalles_afectados: string;
  promociones_aplicadas: string;
}

export interface DescuentoPorPromocion {
  promo_id: string;
  usos: string;
  total_descuentos: string;
  descuento_promedio: string;
  productos_afectados: string;
}