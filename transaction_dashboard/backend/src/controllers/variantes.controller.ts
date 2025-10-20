// backend/src/controllers/variantes.controller.ts

import { Request, Response } from 'express';
import { variantesService } from '../services/variantes.service';

export class VariantesController {
  /**
   * GET /api/v1/casos/variantes/test
   * Test de conexión
   */
  async test(req: Request, res: Response): Promise<void> {
    try {
      const result = await variantesService.testConnection();
      res.json({
        success: result.success,
        message: result.message,
        endpoint: 'Caso 10 - Análisis de Variantes',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error en test endpoint:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * GET /api/v1/casos/variantes/metrics
   * Obtiene métricas generales de variantes
   */
  async getMetrics(req: Request, res: Response): Promise<void> {
    try {
      const metrics = await variantesService.getMetrics();
      res.json({
        success: true,
        data: metrics,
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

  /**
   * GET /api/v1/casos/variantes/analysis
   * Obtiene análisis completo de variantes
   */
  async getAnalysis(req: Request, res: Response): Promise<void> {
    try {
      const analysis = await variantesService.getVariantAnalysis();
      res.json({
        success: true,
        data: analysis,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error en getAnalysis:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * GET /api/v1/casos/variantes/detection
   * Obtiene detección de variantes en productos
   */
  async getDetection(req: Request, res: Response): Promise<void> {
    try {
      const detection = await variantesService.getVariantDetection();
      res.json({
        success: true,
        data: detection,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error en getDetection:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * GET /api/v1/casos/variantes/groups
   * Obtiene grupos de variantes (productos base con sus variantes)
   */
  async getGroups(req: Request, res: Response): Promise<void> {
    try {
      const groups = await variantesService.getVariantGroups();
      res.json({
        success: true,
        data: groups,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error en getGroups:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * GET /api/v1/casos/variantes/categories
   * Obtiene análisis de variantes por categoría
   */
  async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await variantesService.getCategoryAnalysis();
      res.json({
        success: true,
        data: categories,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error en getCategories:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * GET /api/v1/casos/variantes/prices
   * Obtiene análisis de precios entre variantes
   */
  async getPrices(req: Request, res: Response): Promise<void> {
    try {
      const prices = await variantesService.getPriceAnalysis();
      res.json({
        success: true,
        data: prices,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error en getPrices:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date().toISOString()
      });
    }
  }
}

export const variantesController = new VariantesController();