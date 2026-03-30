import { Router, Request, Response } from "express";
import { pool } from "../config/db";

const router = Router();

// GET / - listar cobranzas con JOIN a alumno y usuario
router.get("/", async (req: Request, res: Response) => {
  const { fechaDesde, fechaHasta, alumnoId } = req.query;
  let query = `
    SELECT co.*, a."AlumnoNombre", a."AlumnoApellido", a."AlumnoCI",
           u."UsuarioNombre", u."UsuarioApellido"
    FROM cobranza co
    JOIN alumno a ON co."AlumnoId" = a."AlumnoId"
    JOIN usuario u ON co."UsuarioId" = u."UsuarioId"
    WHERE 1=1
  `;
  const params: any[] = [];
  let paramIndex = 1;

  if (fechaDesde) {
    query += ` AND co."CobranzaFecha" >= $${paramIndex}`;
    params.push(fechaDesde);
    paramIndex++;
  }
  if (fechaHasta) {
    query += ` AND co."CobranzaFecha" <= $${paramIndex}`;
    params.push(fechaHasta);
    paramIndex++;
  }
  if (alumnoId) {
    query += ` AND co."AlumnoId" = $${paramIndex}`;
    params.push(alumnoId);
    paramIndex++;
  }

  query += ' ORDER BY co."CobranzaId" DESC';
  const result = await pool.query(query, params);
  res.json(result.rows);
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
