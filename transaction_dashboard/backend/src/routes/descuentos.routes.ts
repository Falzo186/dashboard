import { Router } from 'express';
import { descuentosController } from '../controllers/descuentos.controller';

export const descuentosRoutes = Router();

// Métricas generales
descuentosRoutes.get('/metrics', 
  descuentosController.getMetrics.bind(descuentosController)
);

// Distribución mensual
descuentosRoutes.get('/distribucion-mensual', 
  descuentosController.getDistribucionMensual.bind(descuentosController)
);

// Top productos con descuento
descuentosRoutes.get('/top-productos', 
  descuentosController.getTopProductos.bind(descuentosController)
);

// Análisis por categoría
descuentosRoutes.get('/por-categoria', 
  descuentosController.getPorCategoria.bind(descuentosController)
);

// Impacto en margen
descuentosRoutes.get('/impacto-margen', 
  descuentosController.getImpactoMargen.bind(descuentosController)
);

// Análisis por promoción
descuentosRoutes.get('/por-promocion', 
  descuentosController.getPorPromocion.bind(descuentosController)
);

// Análisis completo
descuentosRoutes.get('/analisis-completo', 
  descuentosController.getAnalisisCompleto.bind(descuentosController)
);