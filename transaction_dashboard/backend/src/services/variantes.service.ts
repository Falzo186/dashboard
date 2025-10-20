// backend/src/services/variantes.service.ts

import { variantesRepository } from '../repositories/variantes.repository';

interface VariantMetrics {
  totalProductos: string;
  productosConVariantes: string;
  promedioVariantesPorProducto: string;
  tipoVarianteMasComun: string;
  porcentajeProductosConVariantes: string;
}

interface VariantAnalysisData {
  metrics: VariantMetrics;
  topVariantGroups: any[];
  categoryAnalysis: any[];
  priceVariations: any[];
}

export class VariantesService {
  /**
   * Obtiene análisis completo de variantes
   */
  async getVariantAnalysis(): Promise<VariantAnalysisData> {
    try {
      const [metrics, topVariantGroups, categoryAnalysis, priceVariations] = await Promise.all([
        variantesRepository.getVariantMetrics(),
        variantesRepository.analyzeVariantGroups(),
        variantesRepository.getVariantsByCategory(),
        variantesRepository.getVariantPriceAnalysis()
      ]);

      return {
        metrics: this.formatMetrics(metrics),
        topVariantGroups: this.formatVariantGroups(topVariantGroups),
        categoryAnalysis: this.formatCategoryAnalysis(categoryAnalysis),
        priceVariations: this.formatPriceVariations(priceVariations)
      };
    } catch (error) {
      console.error('Error en getVariantAnalysis:', error);
      throw new Error('Error al obtener análisis de variantes');
    }
  }

  /**
   * Obtiene solo las métricas de variantes
   */
  async getMetrics(): Promise<VariantMetrics> {
    try {
      const metrics = await variantesRepository.getVariantMetrics();
      return this.formatMetrics(metrics);
    } catch (error) {
      console.error('Error en getMetrics:', error);
      throw new Error('Error al obtener métricas de variantes');
    }
  }

  /**
   * Obtiene detección de variantes de productos
   */
  async getVariantDetection() {
    try {
      const variants = await variantesRepository.detectVariants();
      return this.formatVariantDetection(variants);
    } catch (error) {
      console.error('Error en getVariantDetection:', error);
      throw new Error('Error al detectar variantes');
    }
  }

  /**
   * Obtiene grupos de variantes
   */
  async getVariantGroups() {
    try {
      const groups = await variantesRepository.analyzeVariantGroups();
      return this.formatVariantGroups(groups);
    } catch (error) {
      console.error('Error en getVariantGroups:', error);
      throw new Error('Error al obtener grupos de variantes');
    }
  }

  /**
   * Obtiene análisis por categoría
   */
  async getCategoryAnalysis() {
    try {
      const analysis = await variantesRepository.getVariantsByCategory();
      return this.formatCategoryAnalysis(analysis);
    } catch (error) {
      console.error('Error en getCategoryAnalysis:', error);
      throw new Error('Error al obtener análisis por categoría');
    }
  }

  /**
   * Obtiene análisis de precios entre variantes
   */
  async getPriceAnalysis() {
    try {
      const analysis = await variantesRepository.getVariantPriceAnalysis();
      return this.formatPriceVariations(analysis);
    } catch (error) {
      console.error('Error en getPriceAnalysis:', error);
      throw new Error('Error al obtener análisis de precios');
    }
  }

  /**
   * Test de conexión
   */
  async testConnection() {
    return await variantesRepository.testConnection();
  }

  // ==================== MÉTODOS PRIVADOS DE FORMATEO ====================

  private formatMetrics(metrics: any): VariantMetrics {
    return {
      totalProductos: this.formatNumber(metrics.totalProductos),
      productosConVariantes: this.formatNumber(metrics.productosConVariantes),
      promedioVariantesPorProducto: metrics.promedioVariantesPorProducto,
      tipoVarianteMasComun: metrics.tipoVarianteMasComun,
      porcentajeProductosConVariantes: `${metrics.porcentajeProductosConVariantes}%`
    };
  }

  private formatVariantDetection(variants: any[]) {
    return variants.map(v => ({
      productId: v.product_id,
      productName: v.product_name,
      categoria: v.categoria || 'Sin categoría',
      baseName: v.base_name,
      variantType: this.translateVariantType(v.variant_type),
      variantValue: v.variant_value || 'Estándar',
      totalVendido: this.formatNumber(v.total_vendido),
      numTransacciones: this.formatNumber(v.num_transacciones)
    }));
  }

  private formatVariantGroups(groups: any[]) {
    return groups.map(g => ({
      baseName: g.base_name,
      categoria: g.categoria || 'Sin categoría',
      totalVariantes: parseInt(g.total_variantes),
      variantes: g.variantes,
      totalVentas: this.formatCurrency(g.total_ventas),
      productoMasVendido: g.producto_mas_vendido,
      varianteMasVendida: g.variante_mas_vendida
    }));
  }

  private formatCategoryAnalysis(analysis: any[]) {
    return analysis.map(a => ({
      categoria: a.categoria,
      productosConVariantes: parseInt(a.productos_con_variantes),
      totalVariantes: parseInt(a.total_variantes),
      promedioVariantes: parseFloat(a.promedio_variantes_por_producto)
    }));
  }

  private formatPriceVariations(variations: any[]) {
    return variations.map(v => ({
      baseName: v.base_name,
      variantValue: v.variant_value,
      precioPromedio: this.formatCurrency(v.precio_promedio),
      variacionPrecio: `${v.variacion_precio}%`
    }));
  }

  private translateVariantType(type: string | null): string {
    const translations: Record<string, string> = {
      'volumen': 'Volumen',
      'peso': 'Peso',
      'peso_imperial': 'Peso (Imperial)',
      'cantidad': 'Cantidad',
      'tamaño': 'Tamaño',
      'color': 'Color',
      'sabor': 'Sabor'
    };
    return type ? translations[type] || type : 'Sin variante';
  }

  private formatNumber(value: string | number): string {
    const num = typeof value === 'string' ? parseInt(value) : value;
    return num.toLocaleString('es-MX');
  }

  private formatCurrency(value: string | number): string {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  }
}

export const variantesService = new VariantesService();