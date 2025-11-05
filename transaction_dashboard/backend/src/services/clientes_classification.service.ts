import { clientesClassificationRepository } from '../repositories/clientes_classification.repository'
import { execFileSync } from 'child_process'
import path from 'path'
import fs from 'fs'

// Helper to parse CSV simple (expects header ticket_id,tipo_cliente_predicho,confianza)
function parseCsv(content: string) {
  const lines = content.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0)
  if (lines.length <= 1) return []
  const header = lines[0].split(',').map(h => h.trim())
  const rows: any[] = []
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',')
    if (cols.length < 3) continue
    const obj: any = {}
    for (let j = 0; j < Math.min(header.length, cols.length); j++) {
      obj[header[j]] = cols[j]
    }
    rows.push(obj)
  }
  return rows
}

class ClientesClassificationService {
  async listTickets(limit = 100) {
    return await clientesClassificationRepository.listRecentTickets(limit)
  }

  async predictTransaction(transactionId: number) {
    // Build feature row from DB and call Python predictor that uses PredictorCliente + modelo_arbol_cliente.pkl
    try {
      const details = await clientesClassificationRepository.getTransactionDetails(transactionId)
      if (!details || details.length === 0) {
        // no details, fallback
        throw new Error('No transaction details')
      }

      // Extract metodo_pago (take from first row if present), total and num_items
      const metodo_pago = details[0].metodo_pago || details[0].metodoPago || 'efectivo'
      const total = Number(details[0].total || 0)
      // num_items: sum of cantidad if present, else count rows
      const num_items = details.reduce((acc: number, r: any) => acc + (Number(r.cantidad || 0)), 0) || details.length

      const script = path.join(__dirname, '..', '..', 'ml', 'predict_with_predictor.py')
      const args = [script, String(metodo_pago), String(total), String(num_items)]
      const out = execFileSync('python', args, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 })
      const json = JSON.parse(out)

      // if Python returned error
      if (json && json.error) {
        throw new Error(json.error)
      }

      let predicted = json && json.predicted_type ? String(json.predicted_type) : 'Desconocido'
      if (predicted === 'Empresa') predicted = 'Adulto'

      // Normalize confidence: accept numbers or numeric strings, handle 0-1 probabilities
      let confidenceRaw: any = (json && json.confidence !== undefined) ? json.confidence : 0
      let confidenceNum = typeof confidenceRaw === 'number' ? confidenceRaw : Number(String(confidenceRaw || '0'))
      if (!isFinite(confidenceNum) || Number.isNaN(confidenceNum)) confidenceNum = 0
      // if value looks like probability in [0,1], convert to percent
      if (confidenceNum > 0 && confidenceNum <= 1) confidenceNum = confidenceNum * 100
      // clamp
      confidenceNum = Math.max(0, Math.min(100, confidenceNum))

      // persist and return in the shape the frontend expects
      await clientesClassificationRepository.savePrediction(transactionId, predicted, confidenceNum)
      return {
        ticket_id: transactionId,
        predicted_type: predicted,
        confidence: Number(confidenceNum.toFixed(2)),
        explanation: json.explanation || null,
        probabilities: json.probabilities || null,
      }
    } catch (error: any) {
      console.error('Error running tree predictor:', error?.message || error)
      // fallback heuristic (same as before)
  const details = await clientesClassificationRepository.getTransactionDetails(transactionId)
      const categories = (details || []).map((r: any) => (r.categories || '').toLowerCase())
      const total = details && details[0] ? Number(details[0].total || 0) : 0
      const distinct = new Set((details || []).map((r: any) => r.producto_id)).size
  let predicted = 'Desconocido'
      if (categories.some((c: string) => c.includes('kids') || c.includes('niño') || c.includes('juguete'))) predicted = 'Niño'
      else if (categories.some((c: string) => c.includes('protein') || c.includes('suplement') || c.includes('adult'))) predicted = 'Adulto'
      else if (total > 200000 || distinct > 20) predicted = 'Empresa'
      else predicted = 'Joven'
      if (predicted === 'Empresa') predicted = 'Adulto'
      const fallbackConfidence = Number((60 + Math.random() * 15).toFixed(2))
      await clientesClassificationRepository.savePrediction(transactionId, predicted, fallbackConfidence)
      return {
        ticket_id: transactionId,
        predicted_type: predicted,
        confidence: fallbackConfidence,
        explanation: 'Heurística aplicada (fallback)'
      }
    }
  }

  async getTransactionDetails(transactionId: number) {
    return await clientesClassificationRepository.getTransactionDetails(transactionId)
  }

  async retrainModel() {
    try {
      const script = path.join(__dirname, '..', 'ml', 'train_client_classifier.py')
      const out = execFileSync('python', [script], { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 })
      return { success: true, output: out }
    } catch (error: any) {
      console.error('Error running training script:', error?.message || error)
      return { success: false, error: error?.message || String(error) }
    }
  }

  async listPredictions(limit = 50) {
    // delegate to repository
    return await clientesClassificationRepository.listPredictions(limit)
  }

  async importPredictionsFromCsv() {
    try {
      const csvPath = path.join(__dirname, '..', '..', 'ml', 'predictions_cliente_v2.csv')
      if (!fs.existsSync(csvPath)) return { success: false, message: 'CSV not found', path: csvPath }
      const content = fs.readFileSync(csvPath, 'utf8')
      const rows = parseCsv(content)
      let count = 0
      for (const r of rows) {
        const tid = Number(r['ticket_id'] || r['transaction_id'] || r['ticket'])
        const tipo = (r['tipo_cliente_predicho'] || r['predicted_type'] || r['tipo'] || '').toString()
        let conf = r['confianza'] || r['confidence'] || '0'
        let confNum = Number(conf)
        if (!isFinite(confNum)) confNum = 0
        // if confidence provided as 0-1, convert to percent
        if (confNum <= 1) confNum = confNum * 100
        if (!Number.isNaN(tid) && tipo) {
          const predNorm = tipo === 'Empresa' ? 'Adulto' : tipo
          await clientesClassificationRepository.savePrediction(tid, predNorm, Number(confNum))
          count++
        }
      }
      return { success: true, imported: count }
    } catch (error: any) {
      console.error('Error importing CSV predictions:', error)
      return { success: false, error: error?.message || String(error) }
    }
  }
}

export const clientesClassificationService = new ClientesClassificationService()
