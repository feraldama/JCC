-- Gratificación (aguinaldo) anual por empleado.
--
-- Un registro por empleado por año. El monto se carga a mano (cada año varía y
-- no siempre es el 100% del sueldo); no hay pagos parciales ni arrastre de saldo.
-- La numeración de recibos es propia de gratificación, empieza en 1 y sale de
-- una secuencia: un número nunca se reutiliza, aunque se elimine la
-- gratificación que lo tenía (el recibo ya pudo haberse impreso y firmado).
--
-- También registra el menú "gratificacion". Los usuarios administradores lo ven
-- automáticamente; a los operadores hay que asignárselo desde Perfiles.
--
-- CORRER ANTES DE DEPLOYAR la API que usa /api/gratificaciones.

CREATE SEQUENCE IF NOT EXISTS gratificacion_nro_recibo_seq START 1;

CREATE TABLE IF NOT EXISTS gratificacion (
  "GratificacionId"        SERIAL PRIMARY KEY,
  "GratificacionAnio"      SMALLINT    NOT NULL,
  "EmpleadoId"             INTEGER     NOT NULL,
  "GratificacionMonto"     BIGINT      NOT NULL CHECK ("GratificacionMonto" > 0),
  "GratificacionFecha"     DATE        NOT NULL,
  "GratificacionNroRecibo" BIGINT      NOT NULL,
  "UsuarioId"              VARCHAR(12) NOT NULL,
  CONSTRAINT "IGRATIFICACION1" FOREIGN KEY ("UsuarioId") REFERENCES usuario ("UsuarioId"),
  CONSTRAINT "IGRATIFICACION2" FOREIGN KEY ("EmpleadoId") REFERENCES empleado ("EmpleadoId"),
  CONSTRAINT "UGRATIFICACION_ANIO_EMPLEADO" UNIQUE ("GratificacionAnio", "EmpleadoId"),
  CONSTRAINT "UGRATIFICACION_NRORECIBO" UNIQUE ("GratificacionNroRecibo")
);

CREATE INDEX IF NOT EXISTS "idx_IGRATIFICACION1" ON gratificacion ("UsuarioId");
CREATE INDEX IF NOT EXISTS "idx_IGRATIFICACION2" ON gratificacion ("EmpleadoId");

INSERT INTO menu ("MenuId", "MenuNombre")
VALUES ('gratificacion', 'Gratificación')
ON CONFLICT ("MenuId") DO NOTHING;

-- En producción la API usa el rol jcc_app (solo DML) y la migración corre como
-- postgres: sin estos permisos la API no puede usar la tabla ni las secuencias.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'jcc_app') THEN
    GRANT SELECT, INSERT, UPDATE, DELETE ON gratificacion TO jcc_app;
    GRANT USAGE, SELECT ON SEQUENCE gratificacion_nro_recibo_seq TO jcc_app;
    GRANT USAGE, SELECT ON SEQUENCE "gratificacion_GratificacionId_seq" TO jcc_app;
  END IF;
END $$;
