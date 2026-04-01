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

// POST / - crear pago
router.post("/", async (req: Request, res: Response) => {
  const {
    PagoEmpleadoFecha, EmpleadoId, PagoEmpleadoEntregaMonto,
    PagoEmpleadoSaldoMonto, UsuarioId, PagoEmpleadoNroRecibo
  } = req.body;

  const result = await pool.query(
    `INSERT INTO pagoempleado (
      "PagoEmpleadoFecha", "EmpleadoId", "PagoEmpleadoEntregaMonto",
      "PagoEmpleadoSaldoMonto", "UsuarioId", "PagoEmpleadoNroRecibo"
    ) VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *`,
    [PagoEmpleadoFecha, EmpleadoId, PagoEmpleadoEntregaMonto, PagoEmpleadoSaldoMonto, UsuarioId, PagoEmpleadoNroRecibo]
  );
  res.status(201).json(result.rows[0]);
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
