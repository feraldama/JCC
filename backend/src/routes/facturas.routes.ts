import { Router, Request, Response } from "express";
import { pool } from "../config/db";

const router = Router();

// GET / - listar facturas
router.get("/", async (_req: Request, res: Response) => {
  const result = await pool.query('SELECT * FROM factura ORDER BY "FacturaId"');
  res.json(result.rows);
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
