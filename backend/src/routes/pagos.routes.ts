import { Router, Request, Response } from "express";
import { pool } from "../config/db";

const router = Router();

// GET / - listar pagos con JOIN a empleado y usuario
router.get("/", async (req: Request, res: Response) => {
  const { fechaDesde, fechaHasta, empleadoId } = req.query;
  let query = `
    SELECT p.*, e."EmpleadoNombre", e."EmpleadoApellido", e."EmpleadoCI",
           u."UsuarioNombre", u."UsuarioApellido"
    FROM pagoempleado p
    JOIN empleado e ON p."EmpleadoId" = e."EmpleadoId"
    JOIN usuario u ON p."UsuarioId" = u."UsuarioId"
    WHERE 1=1
  `;
  const params: any[] = [];
  let paramIndex = 1;

  if (fechaDesde) {
    query += ` AND p."PagoEmpleadoFecha" >= $${paramIndex}`;
    params.push(fechaDesde);
    paramIndex++;
  }
  if (fechaHasta) {
    query += ` AND p."PagoEmpleadoFecha" <= $${paramIndex}`;
    params.push(fechaHasta);
    paramIndex++;
  }
  if (empleadoId) {
    query += ` AND p."EmpleadoId" = $${paramIndex}`;
    params.push(empleadoId);
    paramIndex++;
  }

  query += ' ORDER BY p."PagoEmpleadoId" DESC';
  const result = await pool.query(query, params);
  res.json(result.rows);
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
