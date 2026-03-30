import { Router, Request, Response } from "express";
import { pool } from "../config/db";

const router = Router();

// GET / - listar alumnos con JOIN a curso
router.get("/", async (req: Request, res: Response) => {
  const { nombre, ci, cursoId } = req.query;
  let query = `
    SELECT a.*, c."CursoNombre"
    FROM alumno a
    JOIN curso c ON a."CursoId" = c."CursoId"
    WHERE 1=1
  `;
  const params: any[] = [];
  let paramIndex = 1;

  if (nombre) {
    query += ` AND (a."AlumnoNombre" ILIKE $${paramIndex} OR a."AlumnoApellido" ILIKE $${paramIndex})`;
    params.push(`%${nombre}%`);
    paramIndex++;
  }
  if (ci) {
    query += ` AND a."AlumnoCI" ILIKE $${paramIndex}`;
    params.push(`%${ci}%`);
    paramIndex++;
  }
  if (cursoId) {
    query += ` AND a."CursoId" = $${paramIndex}`;
    params.push(cursoId);
    paramIndex++;
  }

  query += ' ORDER BY a."AlumnoId"';
  const result = await pool.query(query, params);
  res.json(result.rows);
});

// GET /:id - obtener alumno por id con datos del curso
router.get("/:id", async (req: Request, res: Response) => {
  const result = await pool.query(
    `SELECT a.*, c."CursoNombre"
     FROM alumno a
     JOIN curso c ON a."CursoId" = c."CursoId"
     WHERE a."AlumnoId" = $1`,
    [req.params.id]
  );
  if (result.rows.length === 0) {
    res.status(404).json({ error: "Alumno no encontrado" });
    return;
  }
  res.json(result.rows[0]);
});

// POST / - crear alumno
router.post("/", async (req: Request, res: Response) => {
  const { AlumnoCodigoIdentificador, AlumnoCI, AlumnoNombre, AlumnoApellido, CursoId } = req.body;
  const result = await pool.query(
    'INSERT INTO alumno ("AlumnoCodigoIdentificador", "AlumnoCI", "AlumnoNombre", "AlumnoApellido", "CursoId") VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [AlumnoCodigoIdentificador, AlumnoCI, AlumnoNombre, AlumnoApellido, CursoId]
  );
  res.status(201).json(result.rows[0]);
});

// PUT /:id - actualizar alumno
router.put("/:id", async (req: Request, res: Response) => {
  const { AlumnoCodigoIdentificador, AlumnoCI, AlumnoNombre, AlumnoApellido, CursoId } = req.body;
  const result = await pool.query(
    'UPDATE alumno SET "AlumnoCodigoIdentificador" = $1, "AlumnoCI" = $2, "AlumnoNombre" = $3, "AlumnoApellido" = $4, "CursoId" = $5 WHERE "AlumnoId" = $6 RETURNING *',
    [AlumnoCodigoIdentificador, AlumnoCI, AlumnoNombre, AlumnoApellido, CursoId, req.params.id]
  );
  if (result.rows.length === 0) {
    res.status(404).json({ error: "Alumno no encontrado" });
    return;
  }
  res.json(result.rows[0]);
});

// DELETE /:id - eliminar alumno
router.delete("/:id", async (req: Request, res: Response) => {
  const result = await pool.query('DELETE FROM alumno WHERE "AlumnoId" = $1 RETURNING *', [req.params.id]);
  if (result.rows.length === 0) {
    res.status(404).json({ error: "Alumno no encontrado" });
    return;
  }
  res.json({ message: "Alumno eliminado" });
});

export default router;
