// backend/src/app.ts - SOLUCIÓN COMPLETA
import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { router } from './routes'  // ✅ IMPORTAR ROUTER
import { logger } from './utils/logger'

// Crear aplicación Express
const app = express()

// ===================================
// MIDDLEWARE DE SEGURIDAD
// ===================================
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false
}))

// ===================================
// CORS CONFIGURATION
// ===================================
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000'
app.use(cors({
  origin: corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}))

// ===================================
// MIDDLEWARE GENERAL
// ===================================
// Comentar compression si sigue dando problemas TypeScript
// app.use(compression())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// ===================================
// LOGGING MIDDLEWARE  
// ===================================
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now()
  
  res.on('finish', () => {
    const duration = Date.now() - start
    const logLevel = res.statusCode >= 400 ? 'warn' : 'info'
    
    logger[logLevel](`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`)
  })
  
  next()
})

// ===================================
// REGISTRO DE RUTAS PRINCIPALES
// ===================================
logger.info('🔧 Registrando rutas principales...')

// ✅ USAR EL ROUTER CON TODAS LAS RUTAS
app.use('/', router)

logger.info('✅ Rutas registradas correctamente')

// ===================================
// MIDDLEWARE DE MANEJO DE ERRORES 404
// ===================================
app.use('*', (req: Request, res: Response) => {
  logger.warn(`❌ Ruta no encontrada: ${req.method} ${req.originalUrl}`)
  
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `The endpoint ${req.method} ${req.originalUrl} does not exist`,
    timestamp: new Date().toISOString(),
    availableEndpoints: [
      'GET /health',
      'GET /health/detailed', 
      'GET /health/database',
      'GET /api',
      'GET /api/v1/dashboard/test',
      'GET /api/v1/dashboard/metrics',
      'GET /api/v1/dashboard/overview',
      'GET /api/v1/dashboard/transactions/hourly',
      'GET /api/v1/dashboard/transactions/summary',
      'GET /api/v1/dashboard/customers/segmentation'
    ]
  })
})

// ===================================
// MIDDLEWARE DE MANEJO DE ERRORES GLOBAL
// ===================================
app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error('❌ Error global:', error)
  
  const statusCode = (error as any).status || (error as any).statusCode || 500
  
  // En desarrollo incluir stack y mensaje detallado para depuración
  const isDev = process.env.NODE_ENV === 'development'
  res.status(statusCode).json({
    success: false,
    error: isDev ? error.message : 'Internal server error',
    message: isDev ? (error as any).message : 'Something went wrong',
    stack: isDev ? (error as any).stack : undefined,
    timestamp: new Date().toISOString()
  })
})

// ✅ EXPORT DEFAULT (recomendado para TypeScript)
export default app