-- backend/sql/mv_employee_top_products.sql
-- Materialized view: top productos por empleado
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_employee_top_products AS
SELECT
  t.empleado_id,
  td.producto_id,
  COALESCE(p.product_name, 'Desconocido') AS product_name,
  SUM(td.cantidad) AS cantidad_vendida,
  COALESCE(SUM(td.descuento_monto), 0) AS total_descuento
FROM transactions t
JOIN transaction_detail td ON td.transaction_id = t.id
LEFT JOIN products p ON p.id = td.producto_id
GROUP BY t.empleado_id, td.producto_id, p.product_name;

CREATE INDEX IF NOT EXISTS idx_mv_employee_topprod_emp ON mv_employee_top_products (empleado_id, producto_id);
