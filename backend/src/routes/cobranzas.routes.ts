import { Router, Request, Response } from "express";
import { pool } from "../config/db";

const router = Router();

// GET / - listar cobranzas con JOIN a alumno y usuario
router.get("/", async (req: Request, res: Response) => {
  const { fechaDesde, fechaHasta, alumnoId, busqueda, page, limit } = req.query;
  let where = "WHERE 1=1";
  const params: any[] = [];
  let i = 1;

  if (busqueda) {
    where += ` AND (a."AlumnoNombre" ILIKE $${i} OR a."AlumnoApellido" ILIKE $${i} OR a."AlumnoCI" ILIKE $${i})`;
    params.push(`%${busqueda}%`);
    i++;
  }
  if (fechaDesde) {
    where += ` AND co."CobranzaFecha" >= $${i}`;
    params.push(fechaDesde);
    i++;
  }
  if (fechaHasta) {
    where += ` AND co."CobranzaFecha" <= $${i}`;
    params.push(fechaHasta);
    i++;
  }
  if (alumnoId) {
    where += ` AND co."AlumnoId" = $${i}`;
    params.push(alumnoId);
    i++;
  }

  const baseFrom = `FROM cobranza co JOIN alumno a ON co."AlumnoId" = a."AlumnoId" JOIN usuario u ON co."UsuarioId" = u."UsuarioId" ${where}`;
  const countResult = await pool.query(`SELECT COUNT(*)::int AS total ${baseFrom}`, params);

  const pageNum = Math.max(0, Number(page) || 0);
  const pageSize = Math.min(100, Math.max(1, Number(limit) || 10));
  const dataParams = [...params, pageSize, pageNum * pageSize];
  const result = await pool.query(
    `SELECT co.*, a."AlumnoNombre", a."AlumnoApellido", a."AlumnoCI", u."UsuarioNombre", u."UsuarioApellido" ${baseFrom} ORDER BY co."CobranzaId" DESC LIMIT $${i} OFFSET $${i + 1}`,
    dataParams
  );
  res.json({ data: result.rows, total: countResult.rows[0].total });
});

// GET /:id - obtener cobranza por id
router.get("/:id", async (req: Request, res: Response) => {
  const result = await pool.query(
    `SELECT co.*, a."AlumnoNombre", a."AlumnoApellido", a."AlumnoCI",
            u."UsuarioNombre", u."UsuarioApellido"
     FROM cobranza co
     JOIN alumno a ON co."AlumnoId" = a."AlumnoId"
     JOIN usuario u ON co."UsuarioId" = u."UsuarioId"
     WHERE co."CobranzaId" = $1`,
    [req.params.id]
  );
  if (result.rows.length === 0) {
    res.status(404).json({ error: "Cobranza no encontrada" });
    return;
  }
  res.json(result.rows[0]);
});

// POST / - crear cobranza
router.post("/", async (req: Request, res: Response) => {
  const {
    CobranzaFecha, AlumnoId, CobranzaMesPagado, CobranzaMes,
    CobranzaSubtotalCuota, CobranzaDiasMora, CobranzaExamen,
    CobranzaDescuento, UsuarioId, CobranzaNroComprobante,
    CobranzaTimbrado, CobranzaFebrero, CobranzaAdicionalDetalle
  } = req.body;

  const result = await pool.query(
    `INSERT INTO cobranza (
      "CobranzaFecha", "AlumnoId", "CobranzaMesPagado", "CobranzaMes",
      "CobranzaSubtotalCuota", "CobranzaDiasMora", "CobranzaExamen",
      "CobranzaDescuento", "UsuarioId", "CobranzaNroComprobante",
      "CobranzaTimbrado", "CobranzaFebrero", "CobranzaAdicionalDetalle"
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING *`,
    [
      CobranzaFecha, AlumnoId, CobranzaMesPagado, CobranzaMes,
      CobranzaSubtotalCuota, CobranzaDiasMora, CobranzaExamen,
      CobranzaDescuento, UsuarioId, CobranzaNroComprobante,
      CobranzaTimbrado, CobranzaFebrero, CobranzaAdicionalDetalle
    ]
  );
  res.status(201).json(result.rows[0]);
});

// DELETE /:id - eliminar cobranza
router.delete("/:id", async (req: Request, res: Response) => {
  const result = await pool.query('DELETE FROM cobranza WHERE "CobranzaId" = $1 RETURNING *', [req.params.id]);
  if (result.rows.length === 0) {
    res.status(404).json({ error: "Cobranza no encontrada" });
    return;
  }
  res.json({ message: "Cobranza eliminada" });
});

export default router;
