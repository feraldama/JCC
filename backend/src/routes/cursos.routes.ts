import { Router, Request, Response } from "express";
import { pool } from "../config/db";

const router = Router();

// GET / - listar todos los cursos
router.get("/", async (_req: Request, res: Response) => {
  const result = await pool.query('SELECT * FROM curso ORDER BY "CursoId"');
  res.json(result.rows);
});

// GET /:id - obtener curso por id
router.get("/:id", async (req: Request, res: Response) => {
  const result = await pool.query('SELECT * FROM curso WHERE "CursoId" = $1', [req.params.id]);
  if (result.rows.length === 0) {
    res.status(404).json({ error: "Curso no encontrado" });
    return;
  }
  res.json(result.rows[0]);
});

// POST / - crear curso
router.post("/", async (req: Request, res: Response) => {
  const { CursoNombre, CursoImporte } = req.body;
  const result = await pool.query(
    'INSERT INTO curso ("CursoNombre", "CursoImporte") VALUES ($1, $2) RETURNING *',
    [CursoNombre, CursoImporte]
  );
  res.status(201).json(result.rows[0]);
});

// PUT /:id - actualizar curso
router.put("/:id", async (req: Request, res: Response) => {
  const { CursoNombre, CursoImporte } = req.body;
  const result = await pool.query(
    'UPDATE curso SET "CursoNombre" = $1, "CursoImporte" = $2 WHERE "CursoId" = $3 RETURNING *',
    [CursoNombre, CursoImporte, req.params.id]
  );
  if (result.rows.length === 0) {
    res.status(404).json({ error: "Curso no encontrado" });
    return;
  }
  res.json(result.rows[0]);
});

// DELETE /:id - eliminar curso
router.delete("/:id", async (req: Request, res: Response) => {
  const result = await pool.query('DELETE FROM curso WHERE "CursoId" = $1 RETURNING *', [req.params.id]);
  if (result.rows.length === 0) {
    res.status(404).json({ error: "Curso no encontrado" });
    return;
  }
  res.json({ message: "Curso eliminado" });
});

export default router;
