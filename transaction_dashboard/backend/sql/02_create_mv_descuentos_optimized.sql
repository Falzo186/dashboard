-- =====================================================
-- SCRIPT 2: CREAR VISTA MATERIALIZADA OPTIMIZADA
-- =====================================================
-- Vista optimizada para 60M+ registros
-- Estrategia: Últimos 24 meses (2 años) + índices eficientes
-- =====================================================

-- IMPORTANTE:
-- - Se incluirán los últimos 24 meses (2 años) de datos
-- - Cubre un período amplio para análisis histórico
-- - Los índices se crearán automáticamente
-- Tiempo estimado: 2-5 minutos para crear la vista
-- Tiempo estimado: 1-3 minutos para crear índices

DO $$ BEGIN
    RAISE NOTICE '=======================================================';
    RAISE NOTICE 'CREANDO VISTA MATERIALIZADA OPTIMIZADA';
    RAISE NOTICE '=======================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Iniciando creación...';
END $$;

-- =====================================================
-- PASO 1: Crear la vista materializada OPTIMIZADA
-- Solo últimos 6 meses para reducir volumen
-- =====================================================

CREATE MATERIALIZED VIEW mv_descuentos_base AS
SELECT 
  td.id,
  td.transaction_id,
  td.producto_id,
  td.cantidad,
  td.precio_unitario,
  td.descuento_monto,
  td.promo_id,
  td.lote_id,
  -- Campos calculados para optimizar queries
  CASE 
    WHEN td.descuento_monto > 0 THEN true 
    ELSE false 
  END as tiene_descuento,
  -- Fecha de la transacción (desnormalizada para filtros rápidos)
  t.fecha_hora
FROM transaction_detail td
INNER JOIN transactions t ON t.id = td.transaction_id
-- FILTRO AMPLIADO: Últimos 24 meses (2 años completos)
WHERE t.fecha_hora >= CURRENT_DATE - INTERVAL '24 months'
  AND t.fecha_hora < CURRENT_DATE + INTERVAL '1 day';

DO $$ BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'Vista materializada creada';
    RAISE NOTICE '';
    RAISE NOTICE '=======================================================';
    RAISE NOTICE 'PASO 2: Verificando cantidad de registros';
    RAISE NOTICE '=======================================================';
END $$;

SELECT 
  COUNT(*) as total_registros,
  COUNT(*) FILTER (WHERE tiene_descuento = true) as con_descuento,
  MIN(fecha_hora) as fecha_minima,
  MAX(fecha_hora) as fecha_maxima,
  pg_size_pretty(pg_total_relation_size('mv_descuentos_base')) as tamaño
FROM mv_descuentos_base;

DO $$ BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=======================================================';
    RAISE NOTICE 'PASO 3: Creando índices (esto mejorará el rendimiento)';
    RAISE NOTICE '=======================================================';
END $$;

-- =====================================================
-- ÍNDICE 1: Por fecha (CRÍTICO)
-- =====================================================
DO $$ BEGIN RAISE NOTICE 'Creando índice 1/6: fecha_hora...'; END $$;
CREATE INDEX idx_mv_descuentos_fecha_hora 
ON mv_descuentos_base(fecha_hora DESC);
DO $$ BEGIN RAISE NOTICE 'Índice de fecha creado'; RAISE NOTICE ''; END $$;

-- =====================================================
-- ÍNDICE 2: Por tiene_descuento (CRÍTICO)
-- =====================================================
DO $$ BEGIN RAISE NOTICE 'Creando índice 2/6: tiene_descuento...'; END $$;
CREATE INDEX idx_mv_descuentos_tiene_descuento 
ON mv_descuentos_base(tiene_descuento)
WHERE tiene_descuento = true;
DO $$ BEGIN RAISE NOTICE 'Índice de descuento creado'; RAISE NOTICE ''; END $$;

-- =====================================================
-- ÍNDICE 3: Compuesto fecha + descuento (MUY CRÍTICO)
-- =====================================================
DO $$ BEGIN RAISE NOTICE 'Creando índice 3/6: fecha_hora + tiene_descuento...'; END $$;
CREATE INDEX idx_mv_descuentos_fecha_desc 
ON mv_descuentos_base(fecha_hora DESC, tiene_descuento)
WHERE tiene_descuento = true;
DO $$ BEGIN RAISE NOTICE 'Índice compuesto creado'; RAISE NOTICE ''; END $$;

-- =====================================================
-- ÍNDICE 4: Por producto_id
-- =====================================================
DO $$ BEGIN RAISE NOTICE 'Creando índice 4/6: producto_id...'; END $$;
CREATE INDEX idx_mv_descuentos_producto 
ON mv_descuentos_base(producto_id)
WHERE tiene_descuento = true;
DO $$ BEGIN RAISE NOTICE 'Índice de producto creado'; RAISE NOTICE ''; END $$;

-- =====================================================
-- ÍNDICE 5: Por transaction_id
-- =====================================================
DO $$ BEGIN RAISE NOTICE 'Creando índice 5/6: transaction_id...'; END $$;
CREATE INDEX idx_mv_descuentos_transaction 
ON mv_descuentos_base(transaction_id);
DO $$ BEGIN RAISE NOTICE 'Índice de transacción creado'; RAISE NOTICE ''; END $$;

-- =====================================================
-- ÍNDICE 6: Por promo_id
-- =====================================================
DO $$ BEGIN RAISE NOTICE 'Creando índice 6/6: promo_id...'; END $$;
CREATE INDEX idx_mv_descuentos_promo 
ON mv_descuentos_base(promo_id)
WHERE promo_id IS NOT NULL;
DO $$ BEGIN RAISE NOTICE 'Índice de promoción creado'; RAISE NOTICE ''; END $$;

-- =====================================================
-- PASO 4: Actualizar estadísticas
-- =====================================================
DO $$ BEGIN RAISE NOTICE 'Actualizando estadísticas de PostgreSQL...'; END $$;
ANALYZE mv_descuentos_base;
DO $$ BEGIN RAISE NOTICE 'Estadísticas actualizadas'; RAISE NOTICE ''; END $$;

-- =====================================================
-- PASO 5: Verificación final
-- =====================================================

DO $$ BEGIN
    RAISE NOTICE '=======================================================';
    RAISE NOTICE 'VERIFICACIÓN FINAL';
    RAISE NOTICE '=======================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Índices creados:';
END $$;

SELECT 
  indexname,
  pg_size_pretty(pg_relation_size(indexname::regclass)) as tamaño
FROM pg_indexes
WHERE tablename = 'mv_descuentos_base'
ORDER BY pg_relation_size(indexname::regclass) DESC;

DO $$ BEGIN RAISE NOTICE ''; RAISE NOTICE 'Tamaño total (vista + índices):'; END $$;

SELECT 
  pg_size_pretty(pg_total_relation_size('mv_descuentos_base')) as tamaño_total,
  pg_size_pretty(pg_relation_size('mv_descuentos_base')) as tamaño_vista,
  pg_size_pretty(
    pg_total_relation_size('mv_descuentos_base') - 
    pg_relation_size('mv_descuentos_base')
  ) as tamaño_indices;

DO $$ BEGIN RAISE NOTICE ''; RAISE NOTICE 'Test de velocidad (último mes con descuento):'; END $$;

SELECT COUNT(*) as registros_ultimo_mes
FROM mv_descuentos_base
WHERE fecha_hora >= CURRENT_DATE - INTERVAL '1 month'
  AND tiene_descuento = true;

DO $$ BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=======================================================';
    RAISE NOTICE 'COMPLETADO EXITOSAMENTE';
    RAISE NOTICE '=======================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'PRÓXIMOS PASOS:';
    RAISE NOTICE '1. Reinicia el backend: npm run dev';
    RAISE NOTICE '2. Prueba el endpoint: GET /api/v1/casos/descuentos/metrics';
    RAISE NOTICE '3. Las queries ahora deberían responder en 5-30 segundos';
    RAISE NOTICE '';
    RAISE NOTICE 'MANTENIMIENTO:';
    RAISE NOTICE '- Refresca la vista mensualmente: REFRESH MATERIALIZED VIEW mv_descuentos_base;';
    RAISE NOTICE '- O configura un cron job para refrescarla automáticamente';
    RAISE NOTICE '';
    RAISE NOTICE '=======================================================';
END $$;
