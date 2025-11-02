import { Router } from 'express'
import { recomendacionesController } from '../controllers/recomendaciones.controller'

const recomendacionesRoutes = Router()

// Canasta de Mercado - Top combos (pares) más frecuentes
recomendacionesRoutes.get('/canasta/top-combos', recomendacionesController.topCombos)

export { recomendacionesRoutes }
