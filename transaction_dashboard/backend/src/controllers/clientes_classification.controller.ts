import { Request, Response } from 'express'
import { clientesClassificationService } from '../services/clientes_classification.service'

class ClientesClassificationController {
  async listTickets(req: Request, res: Response) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100
      const data = await clientesClassificationService.listTickets(limit)
      res.json({ success: true, data, count: data.length })
    } catch (error) {
      console.error('Error in listTickets:', error)
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) })
    }
  }

  async predictTransaction(req: Request, res: Response) {
    try {
      const transactionId = parseInt(req.params.transactionId)
      if (Number.isNaN(transactionId)) { res.status(400).json({ success: false, error: 'transactionId must be a number' }); return }
      const data = await clientesClassificationService.predictTransaction(transactionId)
      res.json({ success: true, data })
    } catch (error) {
      console.error('Error in predictTransaction:', error)
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) })
    }
  }

  async retrain(_req: Request, res: Response) {
    try {
      const result = await clientesClassificationService.retrainModel()
      res.json(result)
    } catch (error) {
      console.error('Error in retrain:', error)
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) })
    }
  }

  async listPredictions(req: Request, res: Response) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50
      const data = await clientesClassificationService.listPredictions(limit)
      res.json({ success: true, data })
    } catch (error) {
      console.error('Error in listPredictions:', error)
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) })
    }
  }

  async getTicketDetails(req: Request, res: Response) {
    try {
      const transactionId = parseInt(req.params.id)
      if (Number.isNaN(transactionId)) { res.status(400).json({ success: false, error: 'transactionId must be a number' }); return }
      const data = await clientesClassificationService.getTransactionDetails(transactionId)
      res.json({ success: true, data })
    } catch (error) {
      console.error('Error in getTicketDetails:', error)
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) })
    }
  }
}

export const clientesClassificationController = new ClientesClassificationController()
