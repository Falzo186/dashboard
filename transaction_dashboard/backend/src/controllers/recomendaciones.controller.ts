import { Request, Response } from 'express'
import { recomendacionesService } from '../services/recomendaciones.service'

class RecomendacionesController {
  async topCombos(req: Request, res: Response) {
    try {
      const days = req.query.days ? Number(req.query.days) : 90
      const limit = req.query.limit ? Number(req.query.limit) : 10

      const start = Date.now()
      console.info(`🔍 Recomendaciones: petición recibida (days=${days}, limit=${limit})`)

      const combos = await recomendacionesService.getTopCombosWithNames(days, limit)

      const duration = Date.now() - start
      console.info(`✅ Recomendaciones calculadas: ${combos.length} combos en ${duration} ms`)

      // set a header to show processing time (useful for debugging)
      res.setHeader('X-Processing-Time', `${duration}ms`)

      return res.json({ success: true, data: combos, timestamp: new Date().toISOString() })
    } catch (error) {
      console.error('Error in recomendaciones.topCombos:', error)
      return res.status(500).json({ success: false, message: 'Error calculating recommendations', error: (error as any).message })
    }
  }
}

export const recomendacionesController = new RecomendacionesController()
