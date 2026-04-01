import { Router, Request, Response } from "express";
import { pool } from "../config/db";
import { buildOrderBy } from "../utils/sorting";

const router = Router();

// GET / - listar empleados
router.get("/", async (req: Request, res: Response) => {
  const { busqueda, page, limit } = req.query;
  let where = "WHERE 1=1";
  const params: any[] = [];
  let i = 1;

  if (busqueda) {
    where += ` AND ("EmpleadoNombre" ILIKE $${i} OR "EmpleadoApellido" ILIKE $${i} OR "EmpleadoCI" ILIKE $${i})`;
    params.push(`%${busqueda}%`);
    i++;
  }

  const countResult = await pool.query(`SELECT COUNT(*)::int AS total FROM empleado ${where}`, params);

  const pageNum = Math.max(0, Number(page) || 0);
  const pageSize = Math.min(10000, Math.max(1, Number(limit) || 10));
  const dataParams = [...params, pageSize, pageNum * pageSize];
  const orderBy = buildOrderBy(req, {
    EmpleadoNombre: '"EmpleadoNombre"',
    EmpleadoApellido: '"EmpleadoApellido"',
    EmpleadoCI: '"EmpleadoCI"',
    EmpleadoCobroMonto: '"EmpleadoCobroMonto"',
  }, '"EmpleadoId"');
  const result = await pool.query(
    `SELECT * FROM empleado ${where} ${orderBy} LIMIT $${i} OFFSET $${i + 1}`,
    dataParams
  );
  res.json({ data: result.rows, total: countResult.rows[0].total });
});

// GET /:id - obtener empleado por id
router.get("/:id", async (req: Request, res: Response) => {
  const result = await pool.query('SELECT * FROM empleado WHERE "EmpleadoId" = $1', [req.params.id]);
  if (result.rows.length === 0) {
    res.status(404).json({ error: "Empleado no encontrado" });
    return;
  }
  res.json(result.rows[0]);
});

// POST / - crear empleado
router.post("/", async (req: Request, res: Response) => {
  const { EmpleadoCI, EmpleadoNombre, EmpleadoApellido, EmpleadoCobroMonto } = req.body;
  const existe = await pool.query('SELECT 1 FROM empleado WHERE "EmpleadoCI" = $1', [EmpleadoCI]);
  if (existe.rows.length > 0) {
    res.status(400).json({ message: "Ya existe un empleado con ese número de CI" });
    return;
  }
  const result = await pool.query(
    'INSERT INTO empleado ("EmpleadoCI", "EmpleadoNombre", "EmpleadoApellido", "EmpleadoCobroMonto") VALUES ($1, $2, $3, $4) RETURNING *',
    [EmpleadoCI, EmpleadoNombre, EmpleadoApellido, EmpleadoCobroMonto]
  );
  res.status(201).json(result.rows[0]);
});

// PUT /:id - actualizar empleado
router.put("/:id", async (req: Request, res: Response) => {
  const { EmpleadoCI, EmpleadoNombre, EmpleadoApellido, EmpleadoCobroMonto } = req.body;
  const existe = await pool.query('SELECT 1 FROM empleado WHERE "EmpleadoCI" = $1 AND "EmpleadoId" != $2', [EmpleadoCI, req.params.id]);
  if (existe.rows.length > 0) {
    res.status(400).json({ message: "Ya existe un empleado con ese número de CI" });
    return;
  }
  const result = await pool.query(
    'UPDATE empleado SET "EmpleadoCI" = $1, "EmpleadoNombre" = $2, "EmpleadoApellido" = $3, "EmpleadoCobroMonto" = $4 WHERE "EmpleadoId" = $5 RETURNING *',
    [EmpleadoCI, EmpleadoNombre, EmpleadoApellido, EmpleadoCobroMonto, req.params.id]
  );
  if (result.rows.length === 0) {
    res.status(404).json({ error: "Empleado no encontrado" });
    return;
  }
  res.json(result.rows[0]);
});

// DELETE /:id - eliminar empleado
router.delete("/:id", async (req: Request, res: Response) => {
  const result = await pool.query('DELETE FROM empleado WHERE "EmpleadoId" = $1 RETURNING *', [req.params.id]);
  if (result.rows.length === 0) {
    res.status(404).json({ error: "Empleado no encontrado" });
    return;
  }
  res.json({ message: "Empleado eliminado" });
});

export default router;
