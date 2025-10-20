-- backend/sql/mv_employee_metrics.sql
-- Materialized view: métricas agregadas por empleado
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_employee_metrics AS
SELECT
  t.empleado_id,
  COALESCE(e.nombre, 'Sin empleado') AS empleado_nombre,
  COUNT(DISTINCT t.id) AS total_transacciones,
  COUNT(td.id) AS total_detalles,
  COALESCE(SUM(td.precio_unitario * td.cantidad), 0) AS total_ventas_sin_descuento,
  COALESCE(SUM(td.precio_unitario * td.cantidad - td.descuento_monto), 0) AS total_ventas_con_descuento,
  COALESCE(SUM(td.descuento_monto), 0) AS total_descuentos,
  COALESCE(ROUND(AVG(NULLIF(td.descuento_monto, 0))::numeric, 2), 0) AS descuento_promedio
FROM transactions t
JOIN transaction_detail td ON td.transaction_id = t.id
LEFT JOIN employees e ON e.id = t.empleado_id
GROUP BY t.empleado_id, e.nombre;

-- índice recomendado (no UNIQUE):
CREATE INDEX IF NOT EXISTS idx_mv_employee_metrics_emp ON mv_employee_metrics (empleado_id);
