-- =====================================================
-- EMERGENCIA: CANCELAR TODO AHORA
-- =====================================================
-- Ejecuta este script en una NUEVA ventana de psql
-- mientras el otro script aún está corriendo
-- =====================================================

\echo '🚨 CANCELANDO TODAS LAS OPERACIONES EN mv_descuentos_base'
\echo ''

-- Mostrar qué se va a cancelar
SELECT 
    pid,
    usename,
    now() - query_start as duracion,
    state,
    wait_event,
    LEFT(query, 150) as query
FROM pg_stat_activity
WHERE (query ILIKE '%mv_descuentos%' OR query ILIKE '%descuento%')
  AND state != 'idle'
  AND pid != pg_backend_pid()
ORDER BY query_start;

\echo ''
\echo 'Cancelando operaciones...'
\echo ''

-- Cancelar TODAS las queries relacionadas
SELECT 
    pg_cancel_backend(pid) as cancelado,
    pid,
    LEFT(query, 100) as query_cancelada
FROM pg_stat_activity
WHERE (query ILIKE '%mv_descuentos%' OR query ILIKE '%descuento%')
  AND state != 'idle'
  AND pid != pg_backend_pid();

\echo ''
\echo '✅ Operaciones canceladas'
\echo ''
\echo 'Espera 5 segundos y luego ejecuta: 01_force_drop_mv_descuentos.sql'
\echo ''
