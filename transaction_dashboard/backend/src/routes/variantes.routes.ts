// backend/src/routes/variantes.routes.ts

import { Router } from 'express';
import { variantesController } from '../controllers/variantes.controller';

export const variantesRoutes = Router();

// Test endpoint
variantesRoutes.get('/test', 
  variantesController.test.bind(variantesController)
);

// Métricas generales
variantesRoutes.get('/metrics', 
  variantesController.getMetrics.bind(variantesController)
);

// Análisis completo
variantesRoutes.get('/analysis', 
  variantesController.getAnalysis.bind(variantesController)
);

// Detección de variantes
variantesRoutes.get('/detection', 
  variantesController.getDetection.bind(variantesController)
);

// Grupos de variantes
variantesRoutes.get('/groups', 
  variantesController.getGroups.bind(variantesController)
);

// Análisis por categoría
variantesRoutes.get('/categories', 
  variantesController.getCategories.bind(variantesController)
);

// Análisis de precios
variantesRoutes.get('/prices', 
  variantesController.getPrices.bind(variantesController)
);