import { Router, Request, Response } from "express";
import { pool } from "../config/db";
import { buildOrderBy } from "../utils/sorting";

const router = Router();

// GET / - listar pagos con JOIN a empleado y usuario
router.get("/", async (req: Request, res: Response) => {
  const { fechaDesde, fechaHasta, empleadoId, busqueda, page, limit } = req.query;
  let where = "WHERE 1=1";
  const params: any[] = [];
  let i = 1;

  if (busqueda) {
    where += ` AND (e."EmpleadoNombre" ILIKE $${i} OR e."EmpleadoApellido" ILIKE $${i} OR e."EmpleadoCI" ILIKE $${i})`;
    params.push(`%${busqueda}%`);
    i++;
  }
  if (fechaDesde) {
    where += ` AND p."PagoEmpleadoFecha" >= $${i}`;
    params.push(fechaDesde);
    i++;
  }
  if (fechaHasta) {
    where += ` AND p."PagoEmpleadoFecha" <= $${i}`;
    params.push(fechaHasta);
    i++;
  }
  if (empleadoId) {
    where += ` AND p."EmpleadoId" = $${i}`;
    params.push(empleadoId);
    i++;
  }

  const baseFrom = `FROM pagoempleado p JOIN empleado e ON p."EmpleadoId" = e."EmpleadoId" JOIN usuario u ON p."UsuarioId" = u."UsuarioId" ${where}`;
  const countResult = await pool.query(`SELECT COUNT(*)::int AS total ${baseFrom}`, params);

  const pageNum = Math.max(0, Number(page) || 0);
  const pageSize = Math.min(10000, Math.max(1, Number(limit) || 10));
  const dataParams = [...params, pageSize, pageNum * pageSize];
  const orderBy = buildOrderBy(req, {
    PagoEmpleadoNroRecibo: 'p."PagoEmpleadoNroRecibo"',
    PagoEmpleadoFecha: 'p."PagoEmpleadoFecha"',
    EmpleadoApellido: 'e."EmpleadoApellido"',
    PagoEmpleadoEntregaMonto: 'p."PagoEmpleadoEntregaMonto"',
    PagoEmpleadoSaldoMonto: 'p."PagoEmpleadoSaldoMonto"',
  }, 'p."PagoEmpleadoId" DESC');
  const result = await pool.query(
    `SELECT p.*, e."EmpleadoNombre", e."EmpleadoApellido", e."EmpleadoCI", u."UsuarioNombre", u."UsuarioApellido" ${baseFrom} ${orderBy} LIMIT $${i} OFFSET $${i + 1}`,
    dataParams
  );
  res.json({ data: result.rows, total: countResult.rows[0].total });
});

// GET /empleado/:empleadoId - pagos de un empleado en un mes/año
router.get("/empleado/:empleadoId", async (req: Request, res: Response) => {
  const { empleadoId } = req.params;
  const { mes, anio } = req.query;

  if (!mes || !anio) {
    res.status(400).json({ error: "Se requiere mes y anio" });
    return;
  }

  const mesNum = Number(mes);
  const anioNum = Number(anio);

  // Rango de fechas del mes
  const fechaDesde = `${anioNum}-${String(mesNum).padStart(2, "0")}-01`;
  const ultimoDia = new Date(anioNum, mesNum, 0).getDate();
  const fechaHasta = `${anioNum}-${String(mesNum).padStart(2, "0")}-${ultimoDia}`;

  // Datos del empleado
  const empResult = await pool.query('SELECT * FROM empleado WHERE "EmpleadoId" = $1', [empleadoId]);
  if (empResult.rows.length === 0) {
    res.status(404).json({ error: "Empleado no encontrado" });
    return;
  }
  const empleado = empResult.rows[0];

  // Pagos del mes
  const pagosResult = await pool.query(
    `SELECT p.*, u."UsuarioNombre", u."UsuarioApellido"
     FROM pagoempleado p
     JOIN usuario u ON p."UsuarioId" = u."UsuarioId"
     WHERE p."EmpleadoId" = $1 AND p."PagoEmpleadoFecha" >= $2 AND p."PagoEmpleadoFecha" <= $3
     ORDER BY p."PagoEmpleadoId" ASC`,
    [empleadoId, fechaDesde, fechaHasta]
  );

  const salarioTotal = Number(empleado.EmpleadoCobroMonto);
  const totalEntregado = pagosResult.rows.reduce((sum: number, p: any) => sum + Number(p.PagoEmpleadoEntregaMonto), 0);
  const saldoTotal = salarioTotal - totalEntregado;

  res.json({
    empleado,
    pagos: pagosResult.rows,
    salarioTotal,
    totalEntregado,
    saldoTotal,
  });
});

// GET /siguiente-recibo - próximo nro. de recibo (solo informativo: no lo
// reserva; el número definitivo lo asigna el POST al guardar).
router.get("/siguiente-recibo/next", async (_req: Request, res: Response) => {
  const result = await pool.query(
    "SELECT last_value + CASE WHEN is_called THEN 1 ELSE 0 END AS siguiente FROM pagoempleado_nro_recibo_seq"
  );
  res.json({ siguiente: Number(result.rows[0].siguiente) });
});

// GET /:id - obtener pago por id
router.get("/:id", async (req: Request, res: Response) => {
  const result = await pool.query(
    `SELECT p.*, e."EmpleadoNombre", e."EmpleadoApellido", e."EmpleadoCI",
            u."UsuarioNombre", u."UsuarioApellido"
     FROM pagoempleado p
     JOIN empleado e ON p."EmpleadoId" = e."EmpleadoId"
     JOIN usuario u ON p."UsuarioId" = u."UsuarioId"
     WHERE p."PagoEmpleadoId" = $1`,
    [req.params.id]
  );
  if (result.rows.length === 0) {
    res.status(404).json({ error: "Pago no encontrado" });
    return;
  }
  res.json(result.rows[0]);
});

// POST / - crear pago.
// Sin PagoEmpleadoNroRecibo (o <= 0) toma el siguiente de la secuencia, que
// nunca reutiliza un número aunque se elimine el pago. Con un número cargado a
// mano (Historial Pagos) lo respeta y adelanta la secuencia si hace falta, para
// que los números automáticos no lo repitan.
router.post("/", async (req: Request, res: Response) => {
  const {
    PagoEmpleadoFecha, EmpleadoId, PagoEmpleadoEntregaMonto,
    PagoEmpleadoSaldoMonto, UsuarioId,
  } = req.body;
  const nroManual = Number(req.body.PagoEmpleadoNroRecibo);
  const usarManual = Number.isSafeInteger(nroManual) && nroManual > 0;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // Serializa con otros pagos para que un ajuste de la secuencia (nro. manual)
    // no la haga retroceder por debajo de un número recién tomado.
    await client.query("SELECT pg_advisory_xact_lock(hashtext('pagoempleado_nro_recibo'))");
    let nroRecibo: number;
    if (usarManual) {
      nroRecibo = nroManual;
      await client.query(
        `SELECT setval('pagoempleado_nro_recibo_seq', $1, false)
         FROM pagoempleado_nro_recibo_seq
         WHERE last_value + CASE WHEN is_called THEN 1 ELSE 0 END < $1`,
        [nroManual + 1]
      );
    } else {
      const seq = await client.query("SELECT nextval('pagoempleado_nro_recibo_seq') AS nro");
      nroRecibo = Number(seq.rows[0].nro);
    }
    const result = await client.query(
      `INSERT INTO pagoempleado (
        "PagoEmpleadoFecha", "EmpleadoId", "PagoEmpleadoEntregaMonto",
        "PagoEmpleadoSaldoMonto", "UsuarioId", "PagoEmpleadoNroRecibo"
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [PagoEmpleadoFecha, EmpleadoId, PagoEmpleadoEntregaMonto, PagoEmpleadoSaldoMonto, UsuarioId, nroRecibo]
    );
    await client.query("COMMIT");
    res.status(201).json(result.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
});

// DELETE /:id - eliminar pago
router.delete("/:id", async (req: Request, res: Response) => {
  const result = await pool.query('DELETE FROM pagoempleado WHERE "PagoEmpleadoId" = $1 RETURNING *', [req.params.id]);
  if (result.rows.length === 0) {
    res.status(404).json({ error: "Pago no encontrado" });
    return;
  }
  res.json({ message: "Pago eliminado" });
});

export default router;
