import { Router, Request, Response } from "express";
import { pool } from "../config/db";
import { buildOrderBy } from "../utils/sorting";

const router = Router();

// GET / - listar facturas
router.get("/", async (req: Request, res: Response) => {
  const { busqueda, page, limit } = req.query;
  let where = "WHERE 1=1";
  const params: any[] = [];
  let i = 1;

  if (busqueda) {
    where += ` AND "FacturaTimbrado"::text ILIKE $${i}`;
    params.push(`%${busqueda}%`);
    i++;
  }

  const countResult = await pool.query(`SELECT COUNT(*)::int AS total FROM factura ${where}`, params);

  const pageNum = Math.max(0, Number(page) || 0);
  const pageSize = Math.min(100, Math.max(1, Number(limit) || 10));
  const dataParams = [...params, pageSize, pageNum * pageSize];
  const orderBy = buildOrderBy(req, {
    FacturaTimbrado: '"FacturaTimbrado"',
    FacturaDesde: '"FacturaDesde"',
    FacturaHasta: '"FacturaHasta"',
  }, '"FacturaId"');
  const result = await pool.query(
    `SELECT * FROM factura ${where} ${orderBy} LIMIT $${i} OFFSET $${i + 1}`,
    dataParams
  );
  res.json({ data: result.rows, total: countResult.rows[0].total });
});

// GET /:id - obtener factura por id
router.get("/:id", async (req: Request, res: Response) => {
  const result = await pool.query('SELECT * FROM factura WHERE "FacturaId" = $1', [req.params.id]);
  if (result.rows.length === 0) {
    res.status(404).json({ error: "Factura no encontrada" });
    return;
  }
  res.json(result.rows[0]);
});

// POST / - crear factura
router.post("/", async (req: Request, res: Response) => {
  const { FacturaTimbrado, FacturaDesde, FacturaHasta } = req.body;
  const result = await pool.query(
    'INSERT INTO factura ("FacturaTimbrado", "FacturaDesde", "FacturaHasta") VALUES ($1, $2, $3) RETURNING *',
    [FacturaTimbrado, FacturaDesde, FacturaHasta]
  );
  res.status(201).json(result.rows[0]);
});

// PUT /:id - actualizar factura
router.put("/:id", async (req: Request, res: Response) => {
  const { FacturaTimbrado, FacturaDesde, FacturaHasta } = req.body;
  const result = await pool.query(
    'UPDATE factura SET "FacturaTimbrado" = $1, "FacturaDesde" = $2, "FacturaHasta" = $3 WHERE "FacturaId" = $4 RETURNING *',
    [FacturaTimbrado, FacturaDesde, FacturaHasta, req.params.id]
  );
  if (result.rows.length === 0) {
    res.status(404).json({ error: "Factura no encontrada" });
    return;
  }
  res.json(result.rows[0]);
});

// DELETE /:id - eliminar factura
router.delete("/:id", async (req: Request, res: Response) => {
  const result = await pool.query('DELETE FROM factura WHERE "FacturaId" = $1 RETURNING *', [req.params.id]);
  if (result.rows.length === 0) {
    res.status(404).json({ error: "Factura no encontrada" });
    return;
  }
  res.json({ message: "Factura eliminada" });
});

export default router;
