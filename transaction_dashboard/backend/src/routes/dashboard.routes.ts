// backend/src/routes/api/dashboard.routes.ts - ALTERNATIVA
import { Router, Request, Response } from 'express'

const dashboardRoutes = Router()

// ===================================
// DASHBOARD METRICS ROUTES
// ===================================

// GET /api/v1/dashboard/metrics - Métricas principales del dashboard
dashboardRoutes.get('/metrics', async (req: Request, res: Response) => {
  try {
    const { dashboardController } = await import('../controllers/dashboard.controller')
    return dashboardController.getDashboardMetrics(req, res)
  } catch (error) {
    console.error('Error importing dashboard controller:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/v1/dashboard/overview - Vista general del dashboard
dashboardRoutes.get('/overview', async (req: Request, res: Response) => {
  try {
    const { dashboardController } = await import('../controllers/dashboard.controller')
    return dashboardController.getDashboardOverview(req, res)
  } catch (error) {
    console.error('Error importing dashboard controller:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

dashboardRoutes.get('/analytics', async (req: Request, res: Response) => {
  try {
    const { dashboardController } = await import('../controllers/dashboard.controller')
    return dashboardController.getAnalytics(req, res)
  } catch (error) {
    console.error('Error importing dashboard controller:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// ===================================
// TRANSACTION ANALYSIS ROUTES  
// ===================================

// GET /api/v1/dashboard/transactions/hourly - Análisis por horas
dashboardRoutes.get('/transactions/hourly', async (req: Request, res: Response) => {
  try {
    const { dashboardController } = await import('../controllers/dashboard.controller')
    return dashboardController.getHourlyAnalysis(req, res)
  } catch (error) {
    console.error('Error importing dashboard controller:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/v1/dashboard/transactions/summary - Resumen de transacciones
dashboardRoutes.get('/transactions/summary', async (req: Request, res: Response) => {
  try {
    const { dashboardController } = await import('../controllers/dashboard.controller')
    return dashboardController.getTransactionsSummary(req, res)
  } catch (error) {
    console.error('Error importing dashboard controller:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// ===================================
// CUSTOMER ANALYSIS ROUTES
// ===================================

// GET /api/v1/dashboard/customers/segmentation - Segmentación de clientes
dashboardRoutes.get('/customers/segmentation', async (req: Request, res: Response) => {
  try {
    const { dashboardController } = await import('../controllers/dashboard.controller')
    return dashboardController.getCustomerSegmentation(req, res)
  } catch (error) {
    console.error('Error importing dashboard controller:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// ===================================
// TEST ROUTE
// ===================================

// GET /api/v1/dashboard/test - Endpoint de prueba
dashboardRoutes.get('/test', async (req: Request, res: Response) => {
  try {
    const { dashboardController } = await import('../controllers/dashboard.controller')
    return dashboardController.testEndpoint(req, res)
  } catch (error) {
    console.error('Error importing dashboard controller:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export { dashboardRoutes }