import { PrismaClient } from '@prisma/client';

// Tipos inline - NO usar carpeta types/
interface ExpiryDistribution {
  estado: string;
  num_lotes: bigint;
  num_productos: bigint;
}

interface CategoryRisk {
  categories: string;
  productos_en_riesgo: bigint;
  lotes_en_riesgo: bigint;
}

interface CriticalProduct {
  id: number;
  product_name: string;
  categories: string;
  lote_code: string;
  expiration_date: Date;
  dias_diferencia: number;
  nivel_urgencia: string;
}

interface ExpiryMetrics {
  vencidos: number;
  criticos: number;
  urgentes: number;
  enRiesgo: number;
}

export class CaducidadRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }
  
  // ==========================================
  // CONTROL DE CADUCIDAD - QUERIES REALES
  // ==========================================
  
  /**
   * 📊 Obtiene la distribución de lotes por estado de caducidad
   * Categorías: Vencido, Crítico, Urgente, Riesgo Medio, Preventivo, Normal
   * 
   * ⚠️ CORREGIDO: Usa CTE para evitar error "no existe la columna estado"
   */
  async getExpiryDistribution(): Promise<ExpiryDistribution[]> {
    try {
      const result = await this.prisma.$queryRaw<ExpiryDistribution[]>`
        WITH estado_lotes AS (
          SELECT 
            CASE 
              WHEN pl.expiration_date < CURRENT_DATE THEN 'Vencido'
              WHEN pl.expiration_date <= CURRENT_DATE + INTERVAL '3 days' THEN 'Crítico (1-3 días)'
              WHEN pl.expiration_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'Urgente (4-7 días)'
              WHEN pl.expiration_date <= CURRENT_DATE + INTERVAL '15 days' THEN 'Riesgo Medio (8-15 días)'
              WHEN pl.expiration_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'Preventivo (16-30 días)'
              ELSE 'Normal'
            END as estado,
            pl.product_id
          FROM product_lots pl
        )
        SELECT 
          estado,
          COUNT(*) as num_lotes,
          COUNT(DISTINCT product_id) as num_productos
        FROM estado_lotes
        GROUP BY estado
        ORDER BY 
          CASE 
            WHEN estado = 'Vencido' THEN 1
            WHEN estado LIKE 'Crítico%' THEN 2
            WHEN estado LIKE 'Urgente%' THEN 3
            WHEN estado LIKE 'Riesgo%' THEN 4
            WHEN estado LIKE 'Preventivo%' THEN 5
            ELSE 6
          END
      `;
      
      return result;
    } catch (error) {
      console.error('Error in getExpiryDistribution:', error);
      throw new Error('Failed to get expiry distribution');
    }
  }
  
  /**
   * 🏷️ Obtiene las categorías con productos en riesgo de caducidad
   * Solo productos que caducan en los próximos 7 días
   */
  async getExpiryCategoriesAtRisk(): Promise<CategoryRisk[]> {
    try {
      const result = await this.prisma.$queryRaw<CategoryRisk[]>`
        SELECT 
          p.categories,
          COUNT(DISTINCT pl.product_id) as productos_en_riesgo,
          COUNT(*) as lotes_en_riesgo
        FROM product_lots pl
        INNER JOIN products p ON pl.product_id = p.id
        WHERE pl.expiration_date <= CURRENT_DATE + INTERVAL '7 days'
          AND pl.expiration_date >= CURRENT_DATE
        GROUP BY p.categories
        ORDER BY lotes_en_riesgo DESC
        LIMIT 10
      `;
      
      return result;
    } catch (error) {
      console.error('Error in getExpiryCategoriesAtRisk:', error);
      throw new Error('Failed to get category risks');
    }
  }
  
  /**
   * ⚠️ Obtiene la lista de productos críticos que requieren atención inmediata
   * Productos que caducan en los próximos 7 días o ya vencidos
   */
  async getCriticalExpiryProducts(): Promise<CriticalProduct[]> {
    try {
      const result = await this.prisma.$queryRaw<CriticalProduct[]>`
        SELECT 
          p.id,
          p.product_name,
          p.categories,
          pl.lote_code,
          pl.expiration_date,
          CASE 
            WHEN pl.expiration_date < CURRENT_DATE THEN 
              CURRENT_DATE - pl.expiration_date::DATE
            ELSE 
              pl.expiration_date::DATE - CURRENT_DATE
          END as dias_diferencia,
          CASE 
            WHEN pl.expiration_date < CURRENT_DATE THEN 'Vencido'
            WHEN pl.expiration_date <= CURRENT_DATE + INTERVAL '3 days' THEN 'Crítico'
            WHEN pl.expiration_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'Urgente'
          END as nivel_urgencia
        FROM product_lots pl
        INNER JOIN products p ON pl.product_id = p.id
        WHERE pl.expiration_date <= CURRENT_DATE + INTERVAL '7 days'
        ORDER BY pl.expiration_date ASC
        LIMIT 50
      `;
      
      return result;
    } catch (error) {
      console.error('Error in getCriticalExpiryProducts:', error);
      throw new Error('Failed to get critical products');
    }
  }
  
  /**
   * 📈 Obtiene las métricas generales de caducidad
   * Contadores por nivel de urgencia
   */
  async getExpiryMetrics(): Promise<ExpiryMetrics> {
    try {
      const [vencidos, criticos, urgentes, enRiesgo] = await Promise.all([
        // Vencidos (fecha pasada)
        this.prisma.$queryRaw<[{ count: bigint }]>`
          SELECT COUNT(*) as count
          FROM product_lots
          WHERE expiration_date < CURRENT_DATE
        `,
        // Críticos (1-3 días)
        this.prisma.$queryRaw<[{ count: bigint }]>`
          SELECT COUNT(*) as count
          FROM product_lots
          WHERE expiration_date >= CURRENT_DATE 
            AND expiration_date <= CURRENT_DATE + INTERVAL '3 days'
        `,
        // Urgentes (4-7 días)
        this.prisma.$queryRaw<[{ count: bigint }]>`
          SELECT COUNT(*) as count
          FROM product_lots
          WHERE expiration_date > CURRENT_DATE + INTERVAL '3 days'
            AND expiration_date <= CURRENT_DATE + INTERVAL '7 days'
        `,
        // En Riesgo (hasta 30 días)
        this.prisma.$queryRaw<[{ count: bigint }]>`
          SELECT COUNT(*) as count
          FROM product_lots
          WHERE expiration_date <= CURRENT_DATE + INTERVAL '30 days'
        `
      ]);

      return {
        vencidos: Number(vencidos[0].count),
        criticos: Number(criticos[0].count),
        urgentes: Number(urgentes[0].count),
        enRiesgo: Number(enRiesgo[0].count)
      };
    } catch (error) {
      console.error('Error in getExpiryMetrics:', error);
      throw new Error('Failed to get expiry metrics');
    }
  }
  
  /**
   * 🧪 Test endpoint - verifica conectividad
   */
  async testConnection(): Promise<{ message: string; timestamp: Date }> {
    try {
      const result = await this.prisma.$queryRaw<[{ now: Date }]>`SELECT NOW() as now`;
      return {
        message: 'Caducidad repository connection OK',
        timestamp: result[0].now
      };
    } catch (error) {
      console.error('Error in testConnection:', error);
      throw new Error('Database connection failed');
    }
  }

  /**
   * Cierra la conexión con Prisma
   */
  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

// Exportar instancia singleton
export const caducidadRepository = new CaducidadRepository()