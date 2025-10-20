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
  roi_potencial: string;
  estado_programa: string;
  objetivo_cumplimiento: string;
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
  analisis: string;
  recomendaciones: string[];
}

export interface DescuentoPorPromocion {
  promo_id: string;
  usos: string;
  total_descuentos: string;
  descuento_promedio: string;
  productos_afectados: string;
}

export interface ResumenEjecutivo {
  porcentaje_actual: string;
  objetivo: string;
  cumplimiento: string;
  inversion_descuentos: string;
  reduccion_margen: string;
  estado: string;
  roi_estimado: string;
}

export interface AnalisisCompleto {
  metricas_generales: DescuentosMetrics;
  distribucion_mensual: DistribucionMensual[];
  top_productos: ProductoConDescuento[];
  por_categoria: DescuentoPorCategoria[];
  impacto_margen: ImpactoMargen;
  por_promocion: DescuentoPorPromocion[];
  fecha_analisis: string;
  resumen_ejecutivo: ResumenEjecutivo;
}