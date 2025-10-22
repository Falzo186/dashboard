-- =====================================================
-- SCRIPT URGENTE: CANCELAR OPERACIONES Y LIMPIAR
-- =====================================================
-- Este script cancela cualquier creación de índice en curso
-- y luego elimina la vista materializada
-- =====================================================

\echo '======================================================='
\echo 'PASO 1: CANCELANDO OPERACIONES EN CURSO'
\echo '======================================================='
\echo ''

-- Ver qué está ejecutándose ahora
\echo 'Operaciones activas relacionadas con mv_descuentos:'
SELECT 
    pid,
    usename,
    state,
    query_start,
    now() - query_start as duration,
    LEFT(query, 100) as query_snippet
FROM pg_stat_activity
WHERE query ILIKE '%mv_descuentos%'
  AND state != 'idle'
  AND pid != pg_backend_pid();

\echo ''
\echo 'Si ves operaciones CREATE INDEX arriba, serán canceladas...'
\echo ''

-- Cancelar todas las operaciones de índices en mv_descuentos
DO $$
DECLARE
    r RECORD;
    canceled_count INTEGER := 0;
BEGIN
    FOR r IN 
        SELECT pid, query
        FROM pg_stat_activity
        WHERE query ILIKE '%mv_descuentos%'
          AND query ILIKE '%CREATE INDEX%'
          AND state != 'idle'
          AND pid != pg_backend_pid()
    LOOP
        RAISE NOTICE 'Cancelando PID %: %', r.pid, LEFT(r.query, 80);
        PERFORM pg_cancel_backend(r.pid);
        canceled_count := canceled_count + 1;
        -- Esperar un momento
        PERFORM pg_sleep(1);
    END LOOP;
    
    IF canceled_count > 0 THEN
        RAISE NOTICE '✅ % operaciones canceladas', canceled_count;
    ELSE
        RAISE NOTICE '✓ No hay operaciones en curso para cancelar';
    END IF;
END $$;

\echo ''
\echo 'Esperando 3 segundos para asegurar cancelación...'
SELECT pg_sleep(3);

\echo ''
\echo '======================================================='
\echo 'PASO 2: ELIMINAR ÍNDICES (con CONCURRENTLY si están bloqueados)'
\echo '======================================================='
\echo ''

-- Eliminar índices uno por uno
DROP INDEX IF EXISTS idx_mv_descuentos_fecha_hora;
\echo '✓ idx_mv_descuentos_fecha_hora eliminado'

DROP INDEX IF EXISTS idx_mv_descuentos_tiene_descuento;
\echo '✓ idx_mv_descuentos_tiene_descuento eliminado'

DROP INDEX IF EXISTS idx_mv_descuentos_fecha_descuento;
DROP INDEX IF EXISTS idx_mv_descuentos_fecha_desc;
\echo '✓ idx_mv_descuentos_fecha_* eliminados'

DROP INDEX IF EXISTS idx_mv_descuentos_producto;
\echo '✓ idx_mv_descuentos_producto eliminado'

DROP INDEX IF EXISTS idx_mv_descuentos_transaction;
\echo '✓ idx_mv_descuentos_transaction eliminado'

DROP INDEX IF EXISTS idx_mv_descuentos_promo;
\echo '✓ idx_mv_descuentos_promo eliminado'

DROP INDEX IF EXISTS idx_mv_descuentos_unique_id;
\echo '✓ idx_mv_descuentos_unique_id eliminado'

\echo ''
\echo '======================================================='
\echo 'PASO 3: ELIMINAR VISTA MATERIALIZADA'
\echo '======================================================='
\echo ''

DROP MATERIALIZED VIEW IF EXISTS mv_descuentos_base CASCADE;

\echo '✅ Vista materializada eliminada'
\echo ''

-- Verificar que se eliminó
\echo 'Verificando eliminación...'
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ Vista eliminada correctamente'
        ELSE '❌ La vista aún existe'
    END as resultado
FROM pg_matviews
WHERE matviewname = 'mv_descuentos_base';

\echo ''
\echo '======================================================='
\echo 'VERIFICACIÓN FINAL'
\echo '======================================================='
\echo ''

-- Ver si quedan índices huérfanos
\echo 'Índices restantes relacionados con descuentos:'
SELECT 
    schemaname,
    indexname,
    tablename
FROM pg_indexes
WHERE indexname LIKE '%descuento%'
   OR tablename LIKE '%descuento%';

\echo ''
\echo '======================================================='
\echo '✅ LIMPIEZA COMPLETADA'
\echo '======================================================='
\echo ''
\echo 'Ahora puedes ejecutar: 02_create_mv_descuentos_optimized.sql'
\echo ''
