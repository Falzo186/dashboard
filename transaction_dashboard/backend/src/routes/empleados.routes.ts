import { Router } from 'express'
import { empleadosController } from '../controllers/empleados.controller'

const empleadosRoutes = Router()

// GET /api/v1/casos/empleados/test
empleadosRoutes.get('/test', empleadosController.testEndpoint)

// GET /api/v1/casos/empleados/metrics
empleadosRoutes.get('/metrics', empleadosController.getMetrics)

// GET /api/v1/casos/empleados/top?limit=20
empleadosRoutes.get('/top', empleadosController.getTop)

// GET /api/v1/casos/empleados/:employeeId/hourly?days=30
empleadosRoutes.get('/:employeeId/hourly', empleadosController.getHourly)

// GET /api/v1/casos/empleados/:employeeId/top-products?limit=20
empleadosRoutes.get('/:employeeId/top-products', empleadosController.getTopProducts)

// (refresh endpoint removed)

export { empleadosRoutes }
