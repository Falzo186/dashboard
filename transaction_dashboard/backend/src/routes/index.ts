import { Router } from 'express';
import { healthRoutes } from './health.routes';
import { dashboardRoutes } from './dashboard.routes';

// ===================================
// 🆕 IMPORTS DE CASOS DE USO
// ===================================
import { horariosRoutes } from './horarios.routes';
import { caducidadRoutes } from './caducidad.routes';
import { preciosRoutes } from './precios.routes';
import { clientesRoutes } from './clientes.routes';
import { inventarioRoutes } from './inventario.routes';
import pagosRoutes from './pagos.routes';
import { devolucionesRoutes } from './devoluciones.routes';
import { descuentosRoutes } from './descuentos.routes';

const router = Router();

// ===================================
// HEALTH CHECK ROUTES
// ===================================
router.use('/health', healthRoutes);

// ===================================
// API ROUTES v1
// ===================================
const apiPrefix = process.env.API_PREFIX || '/api';
const apiVersion = process.env.API_VERSION || 'v1';

// 🔴 DEPRECATED: Mantener temporalmente por compatibilidad
router.use(`${apiPrefix}/${apiVersion}/dashboard`, dashboardRoutes);

// ===================================
// 🆕 CASOS DE USO - NUEVA ESTRUCTURA
// ===================================

// CASO 1: Patrones Horarios ✅
router.use(`${apiPrefix}/${apiVersion}/casos/horarios`, horariosRoutes);

// CASO 2: Control Caducidad ⏳ 
router.use(`${apiPrefix}/${apiVersion}/casos/caducidad`, caducidadRoutes);

// CASO 3: Gestión Precios ⏸️
router.use(`${apiPrefix}/${apiVersion}/casos/precios`, preciosRoutes);

// CASO 4: Identificación Clientes ⏸️
router.use(`${apiPrefix}/${apiVersion}/casos/clientes`, clientesRoutes);

// CASO 5: Seguimiento Inventario ⏸️ 
router.use(`${apiPrefix}/${apiVersion}/casos/inventario`, inventarioRoutes);

// CASO 6: Métodos de Pago ⏸️ 
router.use(`${apiPrefix}/${apiVersion}/casos/pagos`, pagosRoutes);

// CASO 7: Control Devoluciones ⏸️ 
router.use(`${apiPrefix}/${apiVersion}/casos/devoluciones`, devolucionesRoutes);

// CASO 8: Descuentos ⏸️
router.use(`${apiPrefix}/${apiVersion}/casos/descuentos`, descuentosRoutes);

// ===================================
// API INFO ROUTE
// ===================================
router.get(`${apiPrefix}`, (_req, res) => {
  res.json({
    name: 'Transaction Analytics Dashboard API',
    version: apiVersion,
    endpoints: {
      health: '/health',
      dashboard: `${apiPrefix}/${apiVersion}/dashboard`, // 🔴 Deprecated
      casos: {
        horarios: `${apiPrefix}/${apiVersion}/casos/horarios`, // ✅ Activo
        caducidad: `${apiPrefix}/${apiVersion}/casos/caducidad`, // ⏳ Próximo
        precios: `${apiPrefix}/${apiVersion}/casos/precios`, // ⏸️ Futuro
        clientes: `${apiPrefix}/${apiVersion}/casos/clientes`, // ⏸️ Futuro
        inventario: `${apiPrefix}/${apiVersion}/casos/inventario`, // ⏸️ Futuro
        pagos: `${apiPrefix}/${apiVersion}/casos/pagos`, // ⏸️ Futuro
        devoluciones: `${apiPrefix}/${apiVersion}/casos/devoluciones`, // ⏸️ Futuro
        descuentos: `${apiPrefix}/${apiVersion}/casos/descuentos` // ⏸️ Futuro
      }
    },
    documentation: `${apiPrefix}/docs`,
    status: 'active',
    timestamp: new Date().toISOString()
  });
});

export { router };