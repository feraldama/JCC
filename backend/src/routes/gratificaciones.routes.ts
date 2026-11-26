import { Router, Response } from "express";
import type { PoolClient } from "pg";
import { pool } from "../config/db";
import { buildOrderBy } from "../utils/sorting";
import type { AuthRequest } from "../middleware/auth";

const router = Router();

// El frontend (lib/api.ts) muestra `message`; el resto del backend usa `error`.
function rechazar(res: Response, status: number, mensaje: string) {
  res.status(status).json({ error: mensaje, message: mensaje });
}

function parseAnio(valor: unknown): number | null {
  const anio = Number(valor);
  return Number.isInteger(anio) && anio >= 2000 && anio <= 2100 ? anio : null;
}

// GET /?anio=2026 - todos los empleados con su gratificación del año (si tiene)
router.get("/", async (req: AuthRequest, res: Response) => {
  const anio = parseAnio(req.query.anio);
  if (!anio) {
    rechazar(res, 400, "Se requiere un año válido");
    return;
  }
  const { busqueda, page, limit } = req.query;

  let where = "WHERE 1=1";
  const params: any[] = [anio];
  let i = 2;
  if (busqueda) {
    where += ` AND (e."EmpleadoNombre" ILIKE $${i} OR e."EmpleadoApellido" ILIKE $${i} OR e."EmpleadoCI" ILIKE $${i})`;
    params.push(`%${busqueda}%`);
    i++;
  }

  const baseFrom = `FROM empleado e
    LEFT JOIN gratificacion g ON g."EmpleadoId" = e."EmpleadoId" AND g."GratificacionAnio" = $1
    ${where}`;

  const countResult = await pool.query(`SELECT COUNT(*)::int AS total ${baseFrom}`, params);
  const totalesResult = await pool.query(
    `SELECT COALESCE(SUM("GratificacionMonto"), 0)::bigint AS "totalMonto", COUNT(*)::int AS "cantidadCargados"
     FROM gratificacion WHERE "GratificacionAnio" = $1`,
    [anio]
  );

  const pageNum = Math.max(0, Number(page) || 0);
  const pageSize = Math.min(10000, Math.max(1, Number(limit) || 10));
  const orderBy = buildOrderBy(req, {
    EmpleadoCI: 'e."EmpleadoCI"',
    EmpleadoNombre: 'e."EmpleadoNombre"',
    EmpleadoApellido: 'e."EmpleadoApellido"',
    EmpleadoCobroMonto: 'e."EmpleadoCobroMonto"',
    GratificacionMonto: 'g."GratificacionMonto" NULLS FIRST',
    GratificacionNroRecibo: 'g."GratificacionNroRecibo" NULLS FIRST',
  }, 'e."EmpleadoApellido", e."EmpleadoNombre"');

  const result = await pool.query(
    `SELECT e."EmpleadoId", e."EmpleadoCI", e."EmpleadoNombre", e."EmpleadoApellido", e."EmpleadoCobroMonto",
            g."GratificacionId", g."GratificacionMonto", g."GratificacionFecha", g."GratificacionNroRecibo"
     ${baseFrom} ${orderBy} LIMIT $${i} OFFSET $${i + 1}`,
    [...params, pageSize, pageNum * pageSize]
  );

  res.json({
    data: result.rows,
    total: countResult.rows[0].total,
    totalMonto: Number(totalesResult.rows[0].totalMonto),
    cantidadCargados: totalesResult.rows[0].cantidadCargados,
  });
});

const FECHA_RE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_LOTE = 1000;

function montoValido(valor: unknown): valor is number {
  return Number.isSafeInteger(valor) && (valor as number) > 0;
}

// Crea o actualiza la gratificación de un empleado en un año, dentro de la
// transacción de `client`. Al actualizar conserva su nro. de recibo; al crear
// toma el siguiente de la secuencia, que nunca reutiliza un número (aunque se
// elimine una gratificación ya impresa).
async function upsertGratificacion(
  client: PoolClient,
  anio: number,
  empleadoId: number,
  monto: number,
  fecha: string,
  usuarioId: string,
) {
  // Serializa por empleado+año para que dos pedidos simultáneos no intenten
  // crear el mismo registro (el segundo actualiza en lugar de fallar).
  await client.query("SELECT pg_advisory_xact_lock($1, $2)", [anio, empleadoId]);
  const actualizado = await client.query(
    `UPDATE gratificacion SET
       "GratificacionMonto" = $3, "GratificacionFecha" = $4, "UsuarioId" = $5
     WHERE "GratificacionAnio" = $1 AND "EmpleadoId" = $2
     RETURNING *`,
    [anio, empleadoId, monto, fecha, usuarioId]
  );
  if (actualizado.rows.length > 0) return actualizado.rows[0];
  const creado = await client.query(
    `INSERT INTO gratificacion (
       "GratificacionAnio", "EmpleadoId", "GratificacionMonto", "GratificacionFecha",
       "GratificacionNroRecibo", "UsuarioId"
     ) VALUES ($1, $2, $3, $4, nextval('gratificacion_nro_recibo_seq'), $5)
     RETURNING *`,
    [anio, empleadoId, monto, fecha, usuarioId]
  );
  return creado.rows[0];
}

async function enTransaccion<T>(res: Response, fn: (client: PoolClient) => Promise<T>) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const resultado = await fn(client);
    await client.query("COMMIT");
    return resultado;
  } catch (err: any) {
    await client.query("ROLLBACK");
    if (err.code === "23503") {
      rechazar(res, 400, "Empleado no encontrado");
      return undefined;
    }
    throw err;
  } finally {
    client.release();
  }
}

// PUT / - crear o actualizar la gratificación de un empleado en un año.
router.put("/", async (req: AuthRequest, res: Response) => {
  const anio = parseAnio(req.body.GratificacionAnio);
  const empleadoId = Number(req.body.EmpleadoId);
  const monto = Number(req.body.GratificacionMonto);
  const fecha = req.body.GratificacionFecha;

  if (!anio || !Number.isInteger(empleadoId) || empleadoId <= 0) {
    rechazar(res, 400, "Año o empleado inválido");
    return;
  }
  if (!montoValido(monto)) {
    rechazar(res, 400, "El monto debe ser mayor a cero");
    return;
  }
  if (typeof fecha !== "string" || !FECHA_RE.test(fecha)) {
    rechazar(res, 400, "Fecha inválida");
    return;
  }

  const row = await enTransaccion(res, (client) =>
    upsertGratificacion(client, anio, empleadoId, monto, fecha, req.userId!)
  );
  if (row) res.json(row);
});

// PUT /lote - guardar varias gratificaciones del mismo año en una sola
// transacción: se guardan todas o ninguna.
// Body: { GratificacionAnio, GratificacionFecha, items: [{ EmpleadoId, GratificacionMonto }] }
router.put("/lote", async (req: AuthRequest, res: Response) => {
  const anio = parseAnio(req.body.GratificacionAnio);
  const fecha = req.body.GratificacionFecha;
  const items = req.body.items;

  if (!anio) {
    rechazar(res, 400, "Se requiere un año válido");
    return;
  }
  if (typeof fecha !== "string" || !FECHA_RE.test(fecha)) {
    rechazar(res, 400, "Fecha inválida");
    return;
  }
  if (!Array.isArray(items) || items.length === 0 || items.length > MAX_LOTE) {
    rechazar(res, 400, `Se requieren entre 1 y ${MAX_LOTE} gratificaciones`);
    return;
  }
  const vistos = new Set<number>();
  for (const it of items) {
    const empleadoId = Number(it?.EmpleadoId);
    if (!Number.isInteger(empleadoId) || empleadoId <= 0 || vistos.has(empleadoId)) {
      rechazar(res, 400, "Empleado inválido o repetido en el lote");
      return;
    }
    if (!montoValido(Number(it.GratificacionMonto))) {
      rechazar(res, 400, "Todos los montos deben ser mayores a cero");
      return;
    }
    vistos.add(empleadoId);
  }

  // Orden fijo por EmpleadoId para tomar los locks siempre en el mismo orden
  const ordenados = [...items].sort((a: any, b: any) => Number(a.EmpleadoId) - Number(b.EmpleadoId));
  const rows = await enTransaccion(res, async (client) => {
    const guardados = [];
    for (const it of ordenados) {
      guardados.push(
        await upsertGratificacion(client, anio, Number(it.EmpleadoId), Number(it.GratificacionMonto), fecha, req.userId!)
      );
    }
    return guardados;
  });
  if (rows) res.json({ guardados: rows.length, data: rows });
});

// DELETE /:id - eliminar gratificación
router.delete("/:id", async (req: AuthRequest, res: Response) => {
  const result = await pool.query(
    'DELETE FROM gratificacion WHERE "GratificacionId" = $1 RETURNING *',
    [req.params.id]
  );
  if (result.rows.length === 0) {
    rechazar(res, 404, "Gratificación no encontrada");
    return;
  }
  res.json({ message: "Gratificación eliminada" });
});

export default router;
