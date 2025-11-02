import { PrismaClient } from '@prisma/client'

/**
 * RecomendacionesRepository
 * - Obtiene los conjuntos de productos por transacción
 * - Obtiene nombres de productos
 */
export class RecomendacionesRepository {
  private prisma: PrismaClient

  constructor() {
    this.prisma = new PrismaClient()
  }

  /**
   * Obtiene por cada transacción el conjunto (array) de product ids.
   * Opcionalmente filtra por los últimos `days` días.
   */
  async getTransactionItemSets(days: number = 90): Promise<number[][]> {
    try {
      const result = await this.prisma.$queryRaw<Array<{ items: number[] }>>`
        SELECT
          td.transaction_id,
          ARRAY_AGG(DISTINCT td.producto_id) as items
        FROM transaction_detail td
        INNER JOIN transactions t ON td.transaction_id = t.id
        WHERE t.fecha_hora >= (NOW() - INTERVAL '${String(days)} days')
        GROUP BY td.transaction_id
      `

      return result.map(r => r.items || [])
    } catch (error) {
      console.error('Error getting transaction item sets:', error)
      throw error
    }
  }

  /**
   * Devuelve un mapa id -> product_name para una lista de ids
   */
  async getProductNames(productIds: number[]): Promise<Record<number, string>> {
    if (!productIds || productIds.length === 0) return {}
    try {
      const rows = await this.prisma.$queryRaw<Array<{ id: number; product_name: string }>>`
        SELECT id, product_name FROM products WHERE id IN (${productIds.join(',')})
      `

      const map: Record<number, string> = {}
      rows.forEach(r => {
        map[r.id] = r.product_name
      })
      return map
    } catch (error) {
      console.error('Error getting product names:', error)
      throw error
    }
  }

  /**
   * Método optimizado: calcula los top pares directamente en la base de datos.
   * Devuelve ids y nombres con métricas: pairCount, support, confidenceAtoB, confidenceBtoA
   */
  async getTopPairsSQL(days: number = 90, limit: number = 10) {
    try {
      console.info(`🔍 getTopPairsSQL start (days=${days}, limit=${limit})`)

      // 1) obtener número total de transacciones en la ventana (usamos tabla transactions que suele estar más ligera)
      const totalTxRows = await this.prisma.$queryRaw<any[]>`
        SELECT COUNT(*)::bigint as cnt FROM transactions t WHERE t.fecha_hora >= (NOW() - INTERVAL '${String(days)} days')
      `
      const totalTx = (totalTxRows && totalTxRows[0] && Number(totalTxRows[0].cnt)) || 0
      console.info(`ℹ️ transacciones en ventana: ${totalTx}`)

      // Si hay demasiadas transacciones, hacer fallback: tomar las últimas N transacciones para un cálculo aproximado
      const TX_THRESHOLD = 200000
      const SAMPLE_TX = 100000

      let query: string
      if (totalTx > TX_THRESHOLD) {
        console.info(`⚠️ Volumen alto (${totalTx} tx). Usando muestra de últimas ${SAMPLE_TX} transacciones para cálculo rápido.`)
        query = `
          WITH recent_tx AS (
            SELECT id as transaction_id FROM transactions t
            WHERE t.fecha_hora >= (NOW() - INTERVAL '${String(days)} days')
            ORDER BY t.fecha_hora DESC
            LIMIT ${SAMPLE_TX}
          ),
          tx AS (
            SELECT td.transaction_id, td.producto_id
            FROM transaction_detail td
            INNER JOIN recent_tx r ON td.transaction_id = r.transaction_id
          ),
          pairs AS (
            SELECT LEAST(a.producto_id, b.producto_id) AS a_id,
                   GREATEST(a.producto_id, b.producto_id) AS b_id,
                   COUNT(*) AS pair_count
            FROM tx a
            JOIN tx b ON a.transaction_id = b.transaction_id AND a.producto_id < b.producto_id
            GROUP BY 1,2
          ),
          product_counts AS (
            SELECT producto_id, COUNT(DISTINCT transaction_id) AS tx_count FROM tx GROUP BY producto_id
          ),
          total_tx AS (
            SELECT COUNT(DISTINCT transaction_id) AS total_transactions FROM tx
          )
          SELECT
            pairs.a_id as "productAId",
            prodA.product_name as "productAName",
            pairs.b_id as "productBId",
            prodB.product_name as "productBName",
            pairs.pair_count::INTEGER as "pairCount",
            ROUND((pairs.pair_count::numeric / NULLIF(total_tx.total_transactions,0)::numeric) * 100, 2)::NUMERIC as "support",
            ROUND((pairs.pair_count::numeric / NULLIF(pc_a.tx_count,0)::numeric) * 100, 2)::NUMERIC as "confidenceAtoB",
            ROUND((pairs.pair_count::numeric / NULLIF(pc_b.tx_count,0)::numeric) * 100, 2)::NUMERIC as "confidenceBtoA"
          FROM pairs
          CROSS JOIN total_tx
          LEFT JOIN product_counts pc_a ON pc_a.producto_id = pairs.a_id
          LEFT JOIN product_counts pc_b ON pc_b.producto_id = pairs.b_id
          LEFT JOIN products prodA ON prodA.id = pairs.a_id
          LEFT JOIN products prodB ON prodB.id = pairs.b_id
          ORDER BY pairs.pair_count DESC
          LIMIT ${limit}
        `
      } else {
        query = `
          WITH tx AS (
            SELECT td.transaction_id, td.producto_id
            FROM transaction_detail td
            INNER JOIN transactions t ON td.transaction_id = t.id
            WHERE t.fecha_hora >= (NOW() - INTERVAL '${String(days)} days')
          ),
          pairs AS (
            SELECT LEAST(a.producto_id, b.producto_id) AS a_id,
                   GREATEST(a.producto_id, b.producto_id) AS b_id,
                   COUNT(*) AS pair_count
            FROM tx a
            JOIN tx b ON a.transaction_id = b.transaction_id AND a.producto_id < b.producto_id
            GROUP BY 1,2
          ),
          product_counts AS (
            SELECT producto_id, COUNT(DISTINCT transaction_id) AS tx_count FROM tx GROUP BY producto_id
          ),
          total_tx AS (
            SELECT COUNT(DISTINCT transaction_id) AS total_transactions FROM tx
          )
          SELECT
            pairs.a_id as "productAId",
            prodA.product_name as "productAName",
            pairs.b_id as "productBId",
            prodB.product_name as "productBName",
            pairs.pair_count::INTEGER as "pairCount",
            ROUND((pairs.pair_count::numeric / NULLIF(total_tx.total_transactions,0)::numeric) * 100, 2)::NUMERIC as "support",
            ROUND((pairs.pair_count::numeric / NULLIF(pc_a.tx_count,0)::numeric) * 100, 2)::NUMERIC as "confidenceAtoB",
            ROUND((pairs.pair_count::numeric / NULLIF(pc_b.tx_count,0)::numeric) * 100, 2)::NUMERIC as "confidenceBtoA"
          FROM pairs
          CROSS JOIN total_tx
          LEFT JOIN product_counts pc_a ON pc_a.producto_id = pairs.a_id
          LEFT JOIN product_counts pc_b ON pc_b.producto_id = pairs.b_id
          LEFT JOIN products prodA ON prodA.id = pairs.a_id
          LEFT JOIN products prodB ON prodB.id = pairs.b_id
          ORDER BY pairs.pair_count DESC
          LIMIT ${limit}
        `
      }

      const t0 = Date.now()
      const result = await this.prisma.$queryRawUnsafe<any>(query)
      const t1 = Date.now()
      console.info(`✅ getTopPairsSQL finished in ${t1 - t0} ms, rows=${result.length}`)

      return result
    } catch (error) {
      console.error('Error executing getTopPairsSQL:', error)
      throw error
    }
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect()
  }
}

export const recomendacionesRepository = new RecomendacionesRepository()
