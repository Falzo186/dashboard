// backend/src/repositories/variantes.repository.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface VariantDetection {
  product_id: number;
  product_name: string;
  categoria: string | null;
  base_name: string;
  variant_type: string | null;
  variant_value: string | null;
  total_vendido: string;
  num_transacciones: string;
}

interface VariantAnalysis {
  base_name: string;
  categoria: string | null;
  total_variantes: string;
  variantes: string;
  total_ventas: string;
  producto_mas_vendido: string;
  variante_mas_vendida: string;
}

interface CategoryVariants {
  categoria: string;
  productos_con_variantes: string;
  total_variantes: string;
  promedio_variantes_por_producto: string;
}

interface VariantPrice {
  base_name: string;
  variant_value: string;
  precio_promedio: string;
  variacion_precio: string;
}

export class VariantesRepository {
  private prisma = prisma;

  /**
   * Detecta variantes en nombres de productos usando regex
   */
  async detectVariants(): Promise<VariantDetection[]> {
    return await this.prisma.$queryRaw<VariantDetection[]>`
      WITH product_sales AS (
        SELECT 
          p.id as product_id,
          p.product_name,
          COALESCE(p.categories, 'Sin categoría') as categoria,
          COUNT(DISTINCT td.transaction_id)::text as num_transacciones,
          COALESCE(SUM(td.cantidad), 0)::text as total_vendido
        FROM products p
        LEFT JOIN transaction_detail td ON p.id = td.producto_id
        GROUP BY p.id, p.product_name, p.categories
      ),
      variant_extraction AS (
        SELECT 
          product_id,
          product_name,
          categoria,
          num_transacciones,
          total_vendido,
          REGEXP_REPLACE(
            product_name, 
            E'\\s*(\\d+(\\.\\d+)?\\s*(ml|l|g|kg|oz|lb|unidades?|piezas?)).*$', 
            '', 
            'gi'
          ) as base_name,
          CASE
            WHEN product_name ~* E'\\d+(\\.\\d+)?\\s*(ml|l)' THEN 'volumen'
            WHEN product_name ~* E'\\d+(\\.\\d+)?\\s*(g|kg)' THEN 'peso'
            WHEN product_name ~* E'\\d+(\\.\\d+)?\\s*(oz|lb)' THEN 'peso_imperial'
            WHEN product_name ~* E'\\d+\\s*(unidades?|piezas?)' THEN 'cantidad'
            WHEN product_name ~* '(pequeño|mediano|grande|chico|jumbo)' THEN 'tamaño'
            WHEN product_name ~* '(rojo|azul|verde|amarillo|negro|blanco|rosa|morado)' THEN 'color'
            WHEN product_name ~* '(fresa|chocolate|vainilla|limón|naranja|mango|coco)' THEN 'sabor'
            ELSE NULL
          END as variant_type,
          CASE
            WHEN product_name ~* E'\\d+(\\.\\d+)?\\s*(ml|l|g|kg|oz|lb)' THEN
              (REGEXP_MATCH(product_name, E'(\\d+(\\.\\d+)?\\s*(ml|l|g|kg|oz|lb))', 'i'))[1]
            WHEN product_name ~* E'\\d+\\s*(unidades?|piezas?)' THEN
              (REGEXP_MATCH(product_name, E'(\\d+\\s*(unidades?|piezas?))', 'i'))[1]
            WHEN product_name ~* '(pequeño|mediano|grande|chico|jumbo)' THEN
              (REGEXP_MATCH(product_name, '(pequeño|mediano|grande|chico|jumbo)', 'i'))[1]
            WHEN product_name ~* '(rojo|azul|verde|amarillo|negro|blanco|rosa|morado)' THEN
              (REGEXP_MATCH(product_name, '(rojo|azul|verde|amarillo|negro|blanco|rosa|morado)', 'i'))[1]
            WHEN product_name ~* '(fresa|chocolate|vainilla|limón|naranja|mango|coco)' THEN
              (REGEXP_MATCH(product_name, '(fresa|chocolate|vainilla|limón|naranja|mango|coco)', 'i'))[1]
            ELSE NULL
          END as variant_value
        FROM product_sales
      )
      SELECT 
        product_id,
        product_name,
        categoria,
        TRIM(base_name) as base_name,
        variant_type,
        variant_value,
        total_vendido,
        num_transacciones
      FROM variant_extraction
      ORDER BY base_name, variant_value
      LIMIT 1000;
    `;
  }

  /**
   * Agrupa productos por base y analiza sus variantes
   */
  async analyzeVariantGroups(): Promise<VariantAnalysis[]> {
    return await this.prisma.$queryRaw<VariantAnalysis[]>`
      WITH product_sales AS (
        SELECT 
          p.id,
          p.product_name,
          p.categories,
          COALESCE(SUM(td.cantidad * td.precio_unitario), 0) as ventas_totales
        FROM products p
        LEFT JOIN transaction_detail td ON p.id = td.producto_id
        GROUP BY p.id, p.product_name, p.categories
      ),
      variant_detection AS (
        SELECT 
          id,
          product_name,
          categories,
          ventas_totales,
          TRIM(REGEXP_REPLACE(
            product_name, 
            E'\\s*(\\d+(\\.\\d+)?\\s*(ml|l|g|kg|oz|lb|unidades?|piezas?)).*$', 
            '', 
            'gi'
          )) as base_name,
          CASE
            WHEN product_name ~* E'\\d+(\\.\\d+)?\\s*(ml|l|g|kg|oz|lb)' THEN
              (REGEXP_MATCH(product_name, E'(\\d+(\\.\\d+)?\\s*(ml|l|g|kg|oz|lb))', 'i'))[1]
            WHEN product_name ~* '(pequeño|mediano|grande|chico|jumbo)' THEN
              (REGEXP_MATCH(product_name, '(pequeño|mediano|grande|chico|jumbo)', 'i'))[1]
            ELSE 'estándar'
          END as variant_value
        FROM product_sales
      ),
      grouped_variants AS (
        SELECT 
          base_name,
          COALESCE(categories, 'Sin categoría') as categoria,
          COUNT(DISTINCT id)::text as total_variantes,
          STRING_AGG(DISTINCT variant_value, ', ' ORDER BY variant_value) as variantes,
          SUM(ventas_totales)::text as total_ventas,
          MAX(product_name) FILTER (WHERE ventas_totales = (
            SELECT MAX(ventas_totales) FROM variant_detection v2 WHERE v2.base_name = variant_detection.base_name
          )) as producto_mas_vendido,
          MAX(variant_value) FILTER (WHERE ventas_totales = (
            SELECT MAX(ventas_totales) FROM variant_detection v2 WHERE v2.base_name = variant_detection.base_name
          )) as variante_mas_vendida
        FROM variant_detection
        GROUP BY base_name, categories
        HAVING COUNT(DISTINCT id) > 1
      )
      SELECT * FROM grouped_variants
      ORDER BY CAST(total_variantes AS INTEGER) DESC
      LIMIT 50;
    `;
  }

  /**
   * Analiza categorías con más variantes
   */
  async getVariantsByCategory(): Promise<CategoryVariants[]> {
    return await this.prisma.$queryRaw<CategoryVariants[]>`
      WITH variant_detection AS (
        SELECT 
          p.id,
          COALESCE(p.categories, 'Sin categoría') as categories,
          TRIM(REGEXP_REPLACE(
            p.product_name, 
            E'\\s*(\\d+(\\.\\d+)?\\s*(ml|l|g|kg|oz|lb|unidades?|piezas?)).*$', 
            '', 
            'gi'
          )) as base_name
        FROM products p
      ),
      category_analysis AS (
        SELECT 
          categories as categoria,
          COUNT(DISTINCT base_name)::text as productos_con_variantes,
          COUNT(*)::text as total_variantes,
          ROUND(COUNT(*)::numeric / NULLIF(COUNT(DISTINCT base_name), 0), 2)::text as promedio_variantes_por_producto
        FROM variant_detection
        GROUP BY categories
      )
      SELECT * FROM category_analysis
      ORDER BY CAST(total_variantes AS INTEGER) DESC;
    `;
  }

  /**
   * Analiza variación de precios entre variantes
   */
  async getVariantPriceAnalysis(): Promise<VariantPrice[]> {
    return await this.prisma.$queryRaw<VariantPrice[]>`
      WITH product_prices AS (
        SELECT 
          p.id,
          p.product_name,
          TRIM(REGEXP_REPLACE(
            p.product_name, 
            E'\\s*(\\d+(\\.\\d+)?\\s*(ml|l|g|kg|oz|lb|unidades?|piezas?)).*$', 
            '', 
            'gi'
          )) as base_name,
          CASE
            WHEN p.product_name ~* E'\\d+(\\.\\d+)?\\s*(ml|l|g|kg|oz|lb)' THEN
              (REGEXP_MATCH(p.product_name, E'(\\d+(\\.\\d+)?\\s*(ml|l|g|kg|oz|lb))', 'i'))[1]
            ELSE 'estándar'
          END as variant_value,
          AVG(td.precio_unitario) as precio_promedio
        FROM products p
        LEFT JOIN transaction_detail td ON p.id = td.producto_id
        WHERE td.precio_unitario > 0
        GROUP BY p.id, p.product_name
      ),
      price_variation AS (
        SELECT 
          base_name,
          variant_value,
          ROUND(precio_promedio::numeric, 2)::text as precio_promedio,
          ROUND(
            ((precio_promedio - AVG(precio_promedio) OVER (PARTITION BY base_name)) / 
             NULLIF(AVG(precio_promedio) OVER (PARTITION BY base_name), 0) * 100)::numeric, 
            2
          )::text as variacion_precio
        FROM product_prices
        WHERE base_name IN (
          SELECT base_name 
          FROM product_prices 
          GROUP BY base_name 
          HAVING COUNT(*) > 1
        )
      )
      SELECT * FROM price_variation
      ORDER BY base_name, precio_promedio DESC
      LIMIT 100;
    `;
  }

  /**
   * Métricas generales de variantes
   */
  async getVariantMetrics() {
    const totalProducts = await this.prisma.$queryRaw<Array<{total: string}>>`
      SELECT COUNT(*)::text as total FROM products;
    `;

    const productsWithVariants = await this.prisma.$queryRaw<Array<{total: string}>>`
      WITH variant_detection AS (
        SELECT 
          TRIM(REGEXP_REPLACE(
            product_name, 
            E'\\s*(\\d+(\\.\\d+)?\\s*(ml|l|g|kg|oz|lb|unidades?|piezas?)).*$', 
            '', 
            'gi'
          )) as base_name
        FROM products
      )
      SELECT COUNT(DISTINCT base_name)::text as total
      FROM variant_detection
      WHERE base_name IN (
        SELECT base_name 
        FROM variant_detection 
        GROUP BY base_name 
        HAVING COUNT(*) > 1
      );
    `;

    const avgVariantsPerProduct = await this.prisma.$queryRaw<Array<{avg: string}>>`
      WITH variant_detection AS (
        SELECT 
          TRIM(REGEXP_REPLACE(
            product_name, 
            E'\\s*(\\d+(\\.\\d+)?\\s*(ml|l|g|kg|oz|lb|unidades?|piezas?)).*$', 
            '', 
            'gi'
          )) as base_name
        FROM products
      )
      SELECT ROUND(AVG(variant_count)::numeric, 2)::text as avg
      FROM (
        SELECT base_name, COUNT(*) as variant_count
        FROM variant_detection
        GROUP BY base_name
        HAVING COUNT(*) > 1
      ) sub;
    `;

    const topVariantType = await this.prisma.$queryRaw<Array<{tipo: string, total: string}>>`
      WITH variant_detection AS (
        SELECT 
          CASE
            WHEN product_name ~* E'\\d+(\\.\\d+)?\\s*(ml|l)' THEN 'Volumen'
            WHEN product_name ~* E'\\d+(\\.\\d+)?\\s*(g|kg)' THEN 'Peso'
            WHEN product_name ~* '(pequeño|mediano|grande)' THEN 'Tamaño'
            WHEN product_name ~* '(fresa|chocolate|vainilla)' THEN 'Sabor'
            ELSE 'Otros'
          END as variant_type
        FROM products
      )
      SELECT variant_type as tipo, COUNT(*)::text as total
      FROM variant_detection
      WHERE variant_type != 'Otros'
      GROUP BY variant_type
      ORDER BY COUNT(*) DESC
      LIMIT 1;
    `;

    return {
      totalProductos: totalProducts[0]?.total || '0',
      productosConVariantes: productsWithVariants[0]?.total || '0',
      promedioVariantesPorProducto: avgVariantsPerProduct[0]?.avg || '0',
      tipoVarianteMasComun: topVariantType[0]?.tipo || 'N/A',
      porcentajeProductosConVariantes: totalProducts[0]?.total !== '0' 
        ? ((parseInt(productsWithVariants[0]?.total || '0') / parseInt(totalProducts[0].total)) * 100).toFixed(1)
        : '0'
    };
  }

  /**
   * Test de conexión
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { success: true, message: 'Conexión exitosa a base de datos' };
    } catch (error) {
      return { 
        success: false, 
        message: `Error de conexión: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }
}

export const variantesRepository = new VariantesRepository();