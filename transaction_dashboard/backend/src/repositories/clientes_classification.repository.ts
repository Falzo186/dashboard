import { PrismaClient } from '@prisma/client'

export class ClientesClassificationRepository {
  private prisma: PrismaClient

  constructor() {
    this.prisma = new PrismaClient()
  }

  async listRecentTickets(limit: number = 100) {
    // Some schemas may not have `store_id`. Select only common columns to be safe.
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT id, fecha_hora, total, metodo_pago
      FROM transactions
      ORDER BY fecha_hora DESC
      LIMIT ${limit}
    `
    // Convert any BigInt values to strings so JSON serialization by Express/PowerShell works.
    const converted = rows.map(r => {
      const out: any = {}
      for (const k of Object.keys(r)) {
        const v = (r as any)[k]
        if (typeof v === 'bigint') out[k] = v.toString()
        else out[k] = v
      }
      return out
    })
    return converted
  }

  async getTransactionDetails(transactionId: number) {
    // Some schemas may not include all product columns (eg. brand). Select the common subset.
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT td.transaction_id, td.producto_id, td.cantidad, p.product_name, p.categories, t.total, t.fecha_hora
      FROM transaction_detail td
      INNER JOIN products p ON td.producto_id = p.id
      INNER JOIN transactions t ON td.transaction_id = t.id
      WHERE td.transaction_id = ${transactionId}
    `
    // normalize BigInt -> string for safe JSON handling
    const converted = rows.map(r => {
      const out: any = {}
      for (const k of Object.keys(r)) {
        const v = (r as any)[k]
        if (typeof v === 'bigint') out[k] = v.toString()
        else out[k] = v
      }
      return out
    })
    return converted
  }

  async savePrediction(transactionId: number, predictedType: string, confidence: number) {
    // ensure table exists
    await this.prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS customer_predictions (
        id SERIAL PRIMARY KEY,
        transaction_id BIGINT UNIQUE,
        predicted_type TEXT,
        confidence NUMERIC,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `)

    // upsert
    await this.prisma.$executeRawUnsafe(`
      INSERT INTO customer_predictions (transaction_id, predicted_type, confidence)
      VALUES (${transactionId}, '${predictedType.replace("'", "''")}', ${confidence})
      ON CONFLICT (transaction_id) DO UPDATE SET predicted_type = EXCLUDED.predicted_type, confidence = EXCLUDED.confidence, created_at = NOW();
    `)

    return { transactionId, predictedType, confidence }
  }

  async disconnect() {
    await this.prisma.$disconnect()
  }

  async listPredictions(limit: number = 50) {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT id, transaction_id, predicted_type, confidence, created_at
      FROM customer_predictions
      ORDER BY created_at DESC
      LIMIT ${limit}
    `
    // normalize BigInt -> string
    const converted = rows.map(r => {
      const out: any = {}
      for (const k of Object.keys(r)) {
        const v = (r as any)[k]
        if (typeof v === 'bigint') out[k] = v.toString()
        else out[k] = v
      }
      return out
    })
    return converted
  }
}

export const clientesClassificationRepository = new ClientesClassificationRepository()
