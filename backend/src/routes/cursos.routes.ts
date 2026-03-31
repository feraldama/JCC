import { Router, Request, Response } from "express";
import { pool } from "../config/db";

const router = Router();

// GET / - listar todos los cursos
router.get("/", async (req: Request, res: Response) => {
  const { busqueda, page, limit } = req.query;
  let where = "WHERE 1=1";
  const params: any[] = [];
  let i = 1;

  if (busqueda) {
    where += ` AND "CursoNombre" ILIKE $${i}`;
    params.push(`%${busqueda}%`);
    i++;
  }

  const countResult = await pool.query(`SELECT COUNT(*)::int AS total FROM curso ${where}`, params);

  const pageNum = Math.max(0, Number(page) || 0);
  const pageSize = Math.min(100, Math.max(1, Number(limit) || 10));
  const dataParams = [...params, pageSize, pageNum * pageSize];
  const result = await pool.query(
    `SELECT * FROM curso ${where} ORDER BY "CursoId" LIMIT $${i} OFFSET $${i + 1}`,
    dataParams
  );
  res.json({ data: result.rows, total: countResult.rows[0].total });
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
