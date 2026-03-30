import { Router, Request, Response } from "express";
import { pool } from "../config/db";

const router = Router();

// GET / - listar registros con JOIN a alumno
router.get("/", async (req: Request, res: Response) => {
  const { fechaDesde, fechaHasta, tipo, alumnoId } = req.query;
  let query = `
    SELECT r.*, a."AlumnoNombre", a."AlumnoApellido", a."AlumnoCI"
    FROM registro r
    JOIN alumno a ON r."AlumnoId" = a."AlumnoId"
    WHERE 1=1
  `;
  const params: any[] = [];
  let paramIndex = 1;

  if (fechaDesde) {
    query += ` AND r."RegistroFecha" >= $${paramIndex}`;
    params.push(fechaDesde);
    paramIndex++;
  }
  if (fechaHasta) {
    query += ` AND r."RegistroFecha" <= $${paramIndex}`;
    params.push(fechaHasta);
    paramIndex++;
  }
  if (tipo) {
    query += ` AND r."RegistroTipoRegistro" = $${paramIndex}`;
    params.push(tipo);
    paramIndex++;
  }
  if (alumnoId) {
    query += ` AND r."AlumnoId" = $${paramIndex}`;
    params.push(alumnoId);
    paramIndex++;
  }

  query += ' ORDER BY r."RegistroId" DESC';
  const result = await pool.query(query, params);
  res.json(result.rows);
});

// GET /:id - obtener registro por id
router.get("/:id", async (req: Request, res: Response) => {
  const result = await pool.query(
    `SELECT r.*, a."AlumnoNombre", a."AlumnoApellido", a."AlumnoCI"
     FROM registro r
     JOIN alumno a ON r."AlumnoId" = a."AlumnoId"
     WHERE r."RegistroId" = $1`,
    [req.params.id]
  );
  if (result.rows.length === 0) {
    res.status(404).json({ error: "Registro no encontrado" });
    return;
  }
  res.json(result.rows[0]);
});

// POST / - crear registro
router.post("/", async (req: Request, res: Response) => {
  const {
    RegistroTipoRegistro, AlumnoId, RegistroTipoComprobante, RegistroFecha,
    RegistroTimbrado, RegistroNroComprobante, RegistroIva10, RegistroIva5,
    RegistroIvaExento, RegistroTotal, RegistroCodigoCondicion,
    RegistroMonedaExtranjera, RegistroImputaIva, RegistroImputaIre,
    RegistroImputaIrp, RegistroComprobanteAsociado, RegistroTimbradoAsociado
  } = req.body;

  const result = await pool.query(
    `INSERT INTO registro (
      "RegistroTipoRegistro", "AlumnoId", "RegistroTipoComprobante", "RegistroFecha",
      "RegistroTimbrado", "RegistroNroComprobante", "RegistroIva10", "RegistroIva5",
      "RegistroIvaExento", "RegistroTotal", "RegistroCodigoCondicion",
      "RegistroMonedaExtranjera", "RegistroImputaIva", "RegistroImputaIre",
      "RegistroImputaIrp", "RegistroComprobanteAsociado", "RegistroTimbradoAsociado"
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
    RETURNING *`,
    [
      RegistroTipoRegistro, AlumnoId, RegistroTipoComprobante, RegistroFecha,
      RegistroTimbrado, RegistroNroComprobante, RegistroIva10, RegistroIva5,
      RegistroIvaExento, RegistroTotal, RegistroCodigoCondicion,
      RegistroMonedaExtranjera, RegistroImputaIva, RegistroImputaIre,
      RegistroImputaIrp, RegistroComprobanteAsociado, RegistroTimbradoAsociado
    ]
  );
  res.status(201).json(result.rows[0]);
});

// PUT /:id - actualizar registro
router.put("/:id", async (req: Request, res: Response) => {
  const {
    RegistroTipoRegistro, AlumnoId, RegistroTipoComprobante, RegistroFecha,
    RegistroTimbrado, RegistroNroComprobante, RegistroIva10, RegistroIva5,
    RegistroIvaExento, RegistroTotal, RegistroCodigoCondicion,
    RegistroMonedaExtranjera, RegistroImputaIva, RegistroImputaIre,
    RegistroImputaIrp, RegistroComprobanteAsociado, RegistroTimbradoAsociado
  } = req.body;

  const result = await pool.query(
    `UPDATE registro SET
      "RegistroTipoRegistro" = $1, "AlumnoId" = $2, "RegistroTipoComprobante" = $3,
      "RegistroFecha" = $4, "RegistroTimbrado" = $5, "RegistroNroComprobante" = $6,
      "RegistroIva10" = $7, "RegistroIva5" = $8, "RegistroIvaExento" = $9,
      "RegistroTotal" = $10, "RegistroCodigoCondicion" = $11,
      "RegistroMonedaExtranjera" = $12, "RegistroImputaIva" = $13,
      "RegistroImputaIre" = $14, "RegistroImputaIrp" = $15,
      "RegistroComprobanteAsociado" = $16, "RegistroTimbradoAsociado" = $17
    WHERE "RegistroId" = $18
    RETURNING *`,
    [
      RegistroTipoRegistro, AlumnoId, RegistroTipoComprobante, RegistroFecha,
      RegistroTimbrado, RegistroNroComprobante, RegistroIva10, RegistroIva5,
      RegistroIvaExento, RegistroTotal, RegistroCodigoCondicion,
      RegistroMonedaExtranjera, RegistroImputaIva, RegistroImputaIre,
      RegistroImputaIrp, RegistroComprobanteAsociado, RegistroTimbradoAsociado,
      req.params.id
    ]
  );
  if (result.rows.length === 0) {
    res.status(404).json({ error: "Registro no encontrado" });
    return;
  }
  res.json(result.rows[0]);
});

// DELETE /:id - eliminar registro
router.delete("/:id", async (req: Request, res: Response) => {
  const result = await pool.query('DELETE FROM registro WHERE "RegistroId" = $1 RETURNING *', [req.params.id]);
  if (result.rows.length === 0) {
    res.status(404).json({ error: "Registro no encontrado" });
    return;
  }
  res.json({ message: "Registro eliminado" });
});

export default router;
