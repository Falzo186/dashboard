// backend/src/services/descuentos.service.ts
// ✅ Service para lógica de negocio de descuentos

import { descuentosRepository } from '../repositories/descuentos.repository';
import type {
  DescuentosMetrics,
  DistribucionMensual,
  ProductoConDescuento,
  DescuentoPorCategoria,
  ImpactoMargen,
  DescuentoPorPromocion
} from '../repositories/descuentos.types';

class DescuentosService {
  async getMetrics(): Promise<DescuentosMetrics & { roi_potencial: string; estado_programa: string; objetivo_cumplimiento: string }> {
    const data = await descuentosRepository.getMetrics();

    if (!data || !data.total_detalles) {
      throw new Error('No se encontraron datos de descuentos');
    }

    return {
      ...data,
      roi_potencial: this.calculateROI(data),
      estado_programa: this.evaluarPrograma(data),
      objetivo_cumplimiento: this.evaluarObjetivo(data)
    };
  }

  async getDistribucionMensual(): Promise<DistribucionMensual[]> {
    const data = await descuentosRepository.getDistribucionMensual();
    return data || [];
  }

  async getTopProductos(limit?: number): Promise<ProductoConDescuento[]> {
    const data = await descuentosRepository.getTopProductos(limit);
    return data || [];
  }

  async getPorCategoria(): Promise<DescuentoPorCategoria[]> {
    const data = await descuentosRepository.getPorCategoria();
    return data || [];
  }

  async getImpactoMargen(): Promise<ImpactoMargen & { analisis: string; recomendaciones: string[] }> {
    const data = await descuentosRepository.getImpactoMargen();

    if (!data) {
      throw new Error('No se pudo calcular el impacto en márgenes');
    }

    return {
      ...data,
      analisis: this.analizarImpacto(data),
      recomendaciones: this.generarRecomendaciones(data)
    };
  }

  async getPorPromocion(): Promise<DescuentoPorPromocion[]> {
    const data = await descuentosRepository.getPorPromocion();
    return data || [];
  }

  async getAnalisisCompleto() {
    const [metrics, distribucion, topProductos, porCategoria, impacto, porPromocion] = 
      await Promise.all([
        this.getMetrics(),
        this.getDistribucionMensual(),
        this.getTopProductos(15),
        this.getPorCategoria(),
        this.getImpactoMargen(),
        this.getPorPromocion()
      ]);

    return {
      metricas_generales: metrics,
      distribucion_mensual: distribucion,
      top_productos: topProductos,
      por_categoria: porCategoria,
      impacto_margen: impacto,
      por_promocion: porPromocion,
      fecha_analisis: new Date().toISOString(),
      resumen_ejecutivo: this.generarResumenEjecutivo(metrics, impacto)
    };
  }

  // Métodos privados de análisis
  private calculateROI(metrics: DescuentosMetrics): string {
    const porcentaje = parseFloat(metrics.porcentaje_transacciones_descuento);
    const descuentos = parseFloat(metrics.total_descuentos_otorgados);
    
    if (porcentaje >= 25 && porcentaje <= 35) {
      const roiEstimado = (descuentos * 3).toFixed(2);
      return `ROI óptimo: $${roiEstimado} (300% sobre descuentos)`;
    } else if (porcentaje < 25) {
      return `Oportunidad de crecimiento: Aumentar a 25-35% objetivo`;
    } else {
      return `Precaución: Revisar si descuentos excesivos afectan margen`;
    }
  }

  private evaluarPrograma(metrics: DescuentosMetrics): string {
    const porcentaje = parseFloat(metrics.porcentaje_transacciones_descuento);
    
    if (porcentaje === 0) {
      return 'CRÍTICO: No hay programa de descuentos activo';
    } else if (porcentaje < 10) {
      return 'BAJO: Programa limitado, oportunidad de mejora';
    } else if (porcentaje >= 10 && porcentaje < 20) {
      return 'REGULAR: Programa funcional, puede optimizarse';
    } else if (porcentaje >= 20 && porcentaje <= 35) {
      return 'ÓPTIMO: Dentro del rango objetivo (25-35%)';
    } else {
      return 'ALTO: Revisar si descuentos son sostenibles';
    }
  }

  private evaluarObjetivo(metrics: DescuentosMetrics): string {
    const porcentaje = parseFloat(metrics.porcentaje_transacciones_descuento);
    const objetivo = 30; // 30% objetivo medio
    const diferencia = Math.abs(porcentaje - objetivo);
    
    if (diferencia <= 5) {
      return `✅ Cumpliendo objetivo (${porcentaje.toFixed(1)}% vs 25-35% meta)`;
    } else if (porcentaje < 25) {
      return `📈 Por debajo del objetivo (${porcentaje.toFixed(1)}% vs 25-35% meta)`;
    } else {
      return `⚠️ Por encima del objetivo (${porcentaje.toFixed(1)}% vs 25-35% meta)`;
    }
  }

  private analizarImpacto(impacto: ImpactoMargen): string {
    const reduccion = parseFloat(impacto.porcentaje_reduccion);
    
    if (reduccion < 5) {
      return 'Impacto bajo en margen: Estrategia conservadora y sostenible';
    } else if (reduccion >= 5 && reduccion < 8) {
      return 'Impacto aceptable: Dentro del objetivo (<8% reducción)';
    } else if (reduccion >= 8 && reduccion < 12) {
      return 'Impacto moderado: Revisar efectividad de descuentos';
    } else {
      return 'Impacto alto: Urgente revisar estrategia de descuentos';
    }
  }

  private generarRecomendaciones(impacto: ImpactoMargen): string[] {
    const recomendaciones: string[] = [];
    const reduccion = parseFloat(impacto.porcentaje_reduccion);
    const promociones = parseInt(impacto.promociones_aplicadas);

    if (reduccion < 8) {
      recomendaciones.push('✅ Estrategia de descuentos saludable, mantener curso');
      recomendaciones.push('📊 Considerar ampliar programa a más productos');
      recomendaciones.push('🎯 Implementar descuentos segmentados por cliente');
    } else if (reduccion >= 8 && reduccion < 12) {
      recomendaciones.push('⚠️ Revisar descuentos que no generan incremento de volumen');
      recomendaciones.push('📉 Reducir descuentos en productos de alta rotación');
      recomendaciones.push('🔍 Analizar elasticidad precio-demanda por categoría');
    } else {
      recomendaciones.push('🚨 Urgente: Reducir niveles de descuento globales');
      recomendaciones.push('📊 Implementar descuentos por volumen vs porcentaje fijo');
      recomendaciones.push('🎯 Enfocar descuentos solo en productos estratégicos');
    }

    if (promociones > 100) {
      recomendaciones.push(`📈 ${promociones} promociones activas - Consolidar las más efectivas`);
    }

    recomendaciones.push(`💰 Descuentos actuales: $${impacto.total_descuentos} - Monitorear ROI mensual`);

    return recomendaciones;
  }

  private generarResumenEjecutivo(
    metrics: DescuentosMetrics & { roi_potencial: string; estado_programa: string; objetivo_cumplimiento: string }, 
    impacto: ImpactoMargen & { analisis: string; recomendaciones: string[] }
  ) {
    return {
      porcentaje_actual: `${metrics.porcentaje_transacciones_descuento}%`,
      objetivo: '25-35%',
      cumplimiento: this.evaluarObjetivo(metrics),
      inversion_descuentos: `$${metrics.total_descuentos_otorgados}`,
      reduccion_margen: `${impacto.porcentaje_reduccion}%`,
      estado: this.evaluarPrograma(metrics),
      roi_estimado: this.calculateROI(metrics)
    };
  }
}

export const descuentosService = new DescuentosService();