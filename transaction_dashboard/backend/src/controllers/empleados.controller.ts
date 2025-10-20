import { Request, Response } from 'express'
import { logger } from '../utils/logger'
import { empleadosService } from '../services/empleados.service'

class EmpleadosController {
  private safeInfo = (...args: any[]) => {
    try {
      if (logger && typeof (logger as any).info === 'function') {
        ;(logger as any).info(...args)
      } else {
        console.log(...args)
      }
    } catch (e) {
      console.log(...args)
    }
  }

  private safeError = (...args: any[]) => {
    try {
      if (logger && typeof (logger as any).error === 'function') {
        ;(logger as any).error(...args)
      } else {
        console.error(...args)
      }
    } catch (e) {
      console.error(...args)
    }
  }
  testEndpoint = async (_req: Request, res: Response) => {
    try {
      this.safeInfo('🧪 Empleados test endpoint called')
      res.status(200).json({
        success: true,
        message: 'Empleados API funcionando',
        endpoint: '/api/v1/casos/empleados/test',
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      this.safeError('❌ Empleados test error:', error)
      res.status(500).json({ success: false, error: 'Error en endpoint de prueba' })
    }
  }

  getMetrics = async (_req: Request, res: Response) => {
    try {
      this.safeInfo('📊 Getting empleados metrics')
      const data = await empleadosService.getMetrics()
      res.status(200).json({ success: true, data, timestamp: new Date().toISOString() })
    } catch (error) {
      this.safeError('❌ Error getting empleados metrics:', error)
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown' })
    }
  }

  getTop = async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20
      this.safeInfo(`📊 Getting top ${limit} cashiers`)
      const data = await empleadosService.getTopCashiers(limit)
      res.status(200).json({ success: true, data, timestamp: new Date().toISOString() })
    } catch (error) {
      this.safeError('❌ Error getting top cashiers:', error)
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown' })
    }
  }

  getHourly = async (req: Request, res: Response) => {
    try {
      const employeeId = parseInt(req.params.employeeId)
      const days = req.query.days ? parseInt(req.query.days as string) : 30
      const data = await empleadosService.getHourly(employeeId, days)
      res.status(200).json({ success: true, data, timestamp: new Date().toISOString() })
    } catch (error) {
      this.safeError('❌ Error getting employee hourly:', error)
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown' })
    }
  }

  getTopProducts = async (req: Request, res: Response) => {
    try {
      const employeeId = parseInt(req.params.employeeId)
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20
      const data = await empleadosService.getTopProducts(employeeId, limit)
      res.status(200).json({ success: true, data, timestamp: new Date().toISOString() })
    } catch (error) {
      this.safeError('❌ Error getting top products by employee:', error)
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown' })
    }
  }

  refresh = async (_req: Request, res: Response) => {
    // refresh endpoint removed
    res.status(404).json({ success: false, error: 'Endpoint removed' })
  }
}

export const empleadosController = new EmpleadosController()
