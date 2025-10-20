-- backend/sql/mv_employee_hourly.sql
-- Materialized view: transacciones por empleado por dia/hora
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_employee_hourly AS
SELECT
  t.empleado_id,
  DATE_TRUNC('day', t.fecha_hora) AS dia,
  DATE_TRUNC('hour', t.fecha_hora) AS hora,
  COUNT(DISTINCT t.id) AS transacciones,
  COALESCE(SUM(td.precio_unitario * td.cantidad - td.descuento_monto), 0) AS ventas_netas
FROM transactions t
JOIN transaction_detail td ON td.transaction_id = t.id
GROUP BY t.empleado_id, DATE_TRUNC('day', t.fecha_hora), DATE_TRUNC('hour', t.fecha_hora);

CREATE INDEX IF NOT EXISTS idx_mv_employee_hourly_emp ON mv_employee_hourly (empleado_id, dia, hora);
