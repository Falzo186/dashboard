// backend/src/controllers/descuentos.controller.ts
// ✅ Controller para endpoints de descuentos

import { Request, Response } from 'express';
import { descuentosService } from '../services/descuentos.service';

export class DescuentosController {
  
  async getMetrics(_req: Request, res: Response): Promise<void> {
    try {
      console.log('📊 GET /api/v1/casos/descuentos/metrics');
      const data = await descuentosService.getMetrics();
      
      res.json({
        success: true,
        data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error en getMetrics:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date().toISOString()
      });
    }
  }
  
  async getDistribucionMensual(_req: Request, res: Response): Promise<void> {
    try {
      console.log('📊 GET /api/v1/casos/descuentos/distribucion-mensual');
      const data = await descuentosService.getDistribucionMensual();
      
      res.json({
        success: true,
        data,
        count: data.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error en getDistribucionMensual:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date().toISOString()
      });
    }
  }
  
  async getTopProductos(req: Request, res: Response): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      console.log(`📊 GET /api/v1/casos/descuentos/top-productos?limit=${limit}`);
      
      const data = await descuentosService.getTopProductos(limit);
      
      res.json({
        success: true,
        data,
        count: data.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error en getTopProductos:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date().toISOString()
      });
    }
  }
  
  async getPorCategoria(_req: Request, res: Response): Promise<void> {
    try {
      console.log('📊 GET /api/v1/casos/descuentos/por-categoria');
      const data = await descuentosService.getPorCategoria();
      
      res.json({
        success: true,
        data,
        count: data.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error en getPorCategoria:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date().toISOString()
      });
    }
  }
  
  async getImpactoMargen(_req: Request, res: Response): Promise<void> {
    try {
      console.log('📊 GET /api/v1/casos/descuentos/impacto-margen');
      const data = await descuentosService.getImpactoMargen();
      
      res.json({
        success: true,
        data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error en getImpactoMargen:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date().toISOString()
      });
    }
  }
  
  async getPorPromocion(_req: Request, res: Response): Promise<void> {
    try {
      console.log('📊 GET /api/v1/casos/descuentos/por-promocion');
      const data = await descuentosService.getPorPromocion();
      
      res.json({
        success: true,
        data,
        count: data.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error en getPorPromocion:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date().toISOString()
      });
    }
  }
  
  async getAnalisisCompleto(_req: Request, res: Response): Promise<void> {
    try {
      console.log('📊 GET /api/v1/casos/descuentos/analisis-completo');
      const data = await descuentosService.getAnalisisCompleto();
      
      res.json({
        success: true,
        data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error en getAnalisisCompleto:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date().toISOString()
      });
    }
  }
}

export const descuentosController = new DescuentosController();