-- Numeración de recibos de salario con secuencia.
--
-- Antes el nro. era MAX(PagoEmpleadoNroRecibo) + 1: al eliminar el último pago,
-- su número (ya impreso y firmado) se volvía a asignar a otro recibo, y dos
-- pagos simultáneos podían recibir el mismo número. Con la secuencia un número
-- nunca se reutiliza. No modifica pagos existentes.
--
-- Idempotente: si se vuelve a correr, la secuencia nunca retrocede.
-- CORRER ANTES DE DEPLOYAR la API que usa pagoempleado_nro_recibo_seq.

CREATE SEQUENCE IF NOT EXISTS pagoempleado_nro_recibo_seq START 1;

-- Próximo número = el mayor entre (último recibo existente + 1) y el próximo
-- que ya iba a dar la secuencia.
SELECT setval(
  'pagoempleado_nro_recibo_seq',
  GREATEST(
    (SELECT COALESCE(MAX("PagoEmpleadoNroRecibo"), 0) + 1 FROM pagoempleado),
    (SELECT last_value + CASE WHEN is_called THEN 1 ELSE 0 END FROM pagoempleado_nro_recibo_seq)
  ),
  false
);

-- En producción la API usa el rol jcc_app (solo DML). nextval necesita USAGE,
-- leer el próximo número SELECT y ajustarlo (nro. cargado a mano) UPDATE.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'jcc_app') THEN
    GRANT USAGE, SELECT, UPDATE ON SEQUENCE pagoempleado_nro_recibo_seq TO jcc_app;
  END IF;
END $$;
