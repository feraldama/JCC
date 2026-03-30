import { Router, Request, Response } from "express";
import { pool } from "../config/db";

const router = Router();

// GET / - listar empleados
router.get("/", async (_req: Request, res: Response) => {
  const result = await pool.query('SELECT * FROM empleado ORDER BY "EmpleadoId"');
  res.json(result.rows);
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
  const result = await pool.query(
    'INSERT INTO empleado ("EmpleadoCI", "EmpleadoNombre", "EmpleadoApellido", "EmpleadoCobroMonto") VALUES ($1, $2, $3, $4) RETURNING *',
    [EmpleadoCI, EmpleadoNombre, EmpleadoApellido, EmpleadoCobroMonto]
  );
  res.status(201).json(result.rows[0]);
});

// PUT /:id - actualizar empleado
router.put("/:id", async (req: Request, res: Response) => {
  const { EmpleadoCI, EmpleadoNombre, EmpleadoApellido, EmpleadoCobroMonto } = req.body;
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
