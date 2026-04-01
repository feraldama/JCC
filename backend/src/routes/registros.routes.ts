import { Router, Request, Response } from "express";
import { pool } from "../config/db";
import { buildOrderBy } from "../utils/sorting";

const router = Router();

// GET / - listar registros con JOIN a alumno
router.get("/", async (req: Request, res: Response) => {
  const { fechaDesde, fechaHasta, tipo, alumnoId, busqueda, page, limit } = req.query;
  let where = "WHERE 1=1";
  const params: any[] = [];
  let i = 1;

  if (busqueda) {
    where += ` AND (a."AlumnoNombre" ILIKE $${i} OR a."AlumnoApellido" ILIKE $${i} OR r."RegistroNroComprobante" ILIKE $${i})`;
    params.push(`%${busqueda}%`);
    i++;
  }
  if (fechaDesde) {
    where += ` AND r."RegistroFecha" >= $${i}`;
    params.push(fechaDesde);
    i++;
  }
  if (fechaHasta) {
    where += ` AND r."RegistroFecha" <= $${i}`;
    params.push(fechaHasta);
    i++;
  }
  if (tipo) {
    where += ` AND r."RegistroTipoRegistro" = $${i}`;
    params.push(tipo);
    i++;
  }
  if (alumnoId) {
    where += ` AND r."AlumnoId" = $${i}`;
    params.push(alumnoId);
    i++;
  }

  const baseFrom = `FROM registro r JOIN alumno a ON r."AlumnoId" = a."AlumnoId" ${where}`;
  const countResult = await pool.query(`SELECT COUNT(*)::int AS total ${baseFrom}`, params);

  const pageNum = Math.max(0, Number(page) || 0);
  const pageSize = Math.min(10000, Math.max(1, Number(limit) || 10));
  const dataParams = [...params, pageSize, pageNum * pageSize];
  const orderBy = buildOrderBy(req, {
    RegistroId: 'r."RegistroId"',
    RegistroFecha: 'r."RegistroFecha"',
    AlumnoApellido: 'a."AlumnoApellido"',
    RegistroTotal: 'r."RegistroTotal"',
    RegistroTipoRegistro: 'r."RegistroTipoRegistro"',
    RegistroNroComprobante: 'r."RegistroNroComprobante"',
  }, 'r."RegistroId" DESC');
  const result = await pool.query(
    `SELECT r.*, a."AlumnoNombre", a."AlumnoApellido", a."AlumnoCI", a."AlumnoCodigoIdentificador" ${baseFrom} ${orderBy} LIMIT $${i} OFFSET $${i + 1}`,
    dataParams
  );
  res.json({ data: result.rows, total: countResult.rows[0].total });
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
