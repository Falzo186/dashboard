import { recomendacionesRepository } from '../repositories/recomendaciones.repository'

export interface ComboStat {
  productAId: number
  productBId: number
  pairCount: number
  support: number // porcentaje sobre todas las transacciones
  confidenceAtoB: number // % de clientes que compran A que también compran B
  confidenceBtoA: number
}

export class RecomendacionesService {
  /**
   * Calcula los top combos (pares) a partir de los itemsets
   */
  async getTopPairCombos(days = 90, limit = 10): Promise<ComboStat[]> {
    const itemSets = await recomendacionesRepository.getTransactionItemSets(days)

    const totalTx = itemSets.length
    // conteo de frecuencia por producto
    const freq: Map<number, number> = new Map()
    // conteo de pares (key: "a|b" con a<b)
    const pairCount: Map<string, number> = new Map()

    for (const items of itemSets) {
      // asegurar unicidad
      const uniq = Array.from(new Set(items)).sort((a, b) => a - b)

      // contar unarios
      uniq.forEach(id => freq.set(id, (freq.get(id) || 0) + 1))

      // generar pares
      for (let i = 0; i < uniq.length; i++) {
        for (let j = i + 1; j < uniq.length; j++) {
          const a = uniq[i]
          const b = uniq[j]
          const key = `${a}|${b}`
          pairCount.set(key, (pairCount.get(key) || 0) + 1)
        }
      }
    }

    // transformar a array y calcular métricas
    const combos: ComboStat[] = []
    for (const [key, count] of pairCount.entries()) {
      const [aStr, bStr] = key.split('|')
      const a = Number(aStr)
      const b = Number(bStr)
      const freqA = freq.get(a) || 0
      const freqB = freq.get(b) || 0

      const support = totalTx > 0 ? (count / totalTx) * 100 : 0
      const confidenceAtoB = freqA > 0 ? (count / freqA) * 100 : 0
      const confidenceBtoA = freqB > 0 ? (count / freqB) * 100 : 0

      combos.push({
        productAId: a,
        productBId: b,
        pairCount: count,
        support: Number(support.toFixed(2)),
        confidenceAtoB: Number(confidenceAtoB.toFixed(2)),
        confidenceBtoA: Number(confidenceBtoA.toFixed(2))
      })
    }

    // ordenar por pairCount desc y tomar top `limit`
    combos.sort((x, y) => y.pairCount - x.pairCount)
    return combos.slice(0, limit)
  }

  async getTopCombosWithNames(days = 90, limit = 10) {
    // Utilizamos la versión optimizada que ejecuta agregaciones en la BD
    const rows = await recomendacionesRepository.getTopPairsSQL(days, limit)
    // $queryRaw devuelve los campos ya con nombres (productAId, productAName, ...)
    return rows.map((r: { productAId: any; productAName: any; productBId: any; productBName: any; pairCount: any; support: any; confidenceAtoB: any; confidenceBtoA: any }) => ({
      productAId: r.productAId,
      productAName: r.productAName || null,
      productBId: r.productBId,
      productBName: r.productBName || null,
      pairCount: Number(r.pairCount) || 0,
      support: Number(r.support) || 0,
      confidenceAtoB: Number(r.confidenceAtoB) || 0,
      confidenceBtoA: Number(r.confidenceBtoA) || 0
    }))
  }
}

export const recomendacionesService = new RecomendacionesService()
