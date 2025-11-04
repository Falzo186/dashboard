import { clientesClassificationRepository } from '../repositories/clientes_classification.repository'
import { execFileSync } from 'child_process'
import path from 'path'

class ClientesClassificationService {
  async listTickets(limit = 100) {
    return await clientesClassificationRepository.listRecentTickets(limit)
  }

  async predictTransaction(transactionId: number) {
    // call python predict script
    try {
      const script = path.join(__dirname, '..', 'ml', 'predict_client.py')
      const out = execFileSync('python', [script, String(transactionId)], { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 })
      const json = JSON.parse(out)
      // save prediction
      if (json && json.predicted_type) {
        await clientesClassificationRepository.savePrediction(transactionId, json.predicted_type, Number(json.confidence || 0))
      }
      return json
    } catch (error: any) {
      console.error('Error running prediction script:', error?.message || error)
      // fallback: basic heuristic
      const details = await clientesClassificationRepository.getTransactionDetails(transactionId)
      // heuristic: if any producto category contains 'kids' or 'juguete' -> Niño; if contains 'protein' or 'supplement' -> Adulto; if many distinct items and total>50000 -> Empresa
      const categories = (details || []).map((r: any) => (r.categories || '').toLowerCase())
      const total = details && details[0] ? Number(details[0].total || 0) : 0
      const distinct = new Set((details || []).map((r: any) => r.producto_id)).size
      let predicted = 'Desconocido'
      if (categories.some((c: string) => c.includes('kids') || c.includes('niño') || c.includes('juguete'))) predicted = 'Niño'
      else if (categories.some((c: string) => c.includes('protein') || c.includes('suplement') || c.includes('adult'))) predicted = 'Adulto'
      else if (total > 200000 || distinct > 20) predicted = 'Empresa'
      else predicted = 'Joven'

      const confidence = 50
      await clientesClassificationRepository.savePrediction(transactionId, predicted, confidence)
      return { predicted_type: predicted, confidence, probabilities: {}, explanation: 'Heurística aplicada' }
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
}

export const clientesClassificationService = new ClientesClassificationService()
