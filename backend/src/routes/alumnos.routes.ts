import { Router, Request, Response } from "express";
import { pool } from "../config/db";
import { buildOrderBy } from "../utils/sorting";

const router = Router();

// GET / - listar alumnos con JOIN a curso
router.get("/", async (req: Request, res: Response) => {
  const { nombre, ci, cursoId, busqueda, page, limit } = req.query;
  let where = "WHERE 1=1";
  const params: any[] = [];
  let i = 1;

  if (busqueda) {
    where += ` AND (a."AlumnoNombre" ILIKE $${i} OR a."AlumnoApellido" ILIKE $${i} OR a."AlumnoCI" ILIKE $${i})`;
    params.push(`%${busqueda}%`);
    i++;
  }
  if (nombre) {
    where += ` AND (a."AlumnoNombre" ILIKE $${i} OR a."AlumnoApellido" ILIKE $${i})`;
    params.push(`%${nombre}%`);
    i++;
  }
  if (ci) {
    where += ` AND a."AlumnoCI" ILIKE $${i}`;
    params.push(`%${ci}%`);
    i++;
  }
  if (cursoId) {
    where += ` AND a."CursoId" = $${i}`;
    params.push(cursoId);
    i++;
  }

  const baseFrom = `FROM alumno a JOIN curso c ON a."CursoId" = c."CursoId" ${where}`;
  const countResult = await pool.query(`SELECT COUNT(*)::int AS total ${baseFrom}`, params);

  const pageNum = Math.max(0, Number(page) || 0);
  const pageSize = Math.min(100, Math.max(1, Number(limit) || 10));
  const dataParams = [...params, pageSize, pageNum * pageSize];
  const orderBy = buildOrderBy(req, {
    AlumnoApellido: 'a."AlumnoApellido"',
    AlumnoNombre: 'a."AlumnoNombre"',
    AlumnoCI: 'a."AlumnoCI"',
    CursoNombre: 'c."CursoNombre"',
  }, 'a."AlumnoApellido", a."AlumnoNombre"');
  const result = await pool.query(
    `SELECT a.*, c."CursoNombre" ${baseFrom} ${orderBy} LIMIT $${i} OFFSET $${i + 1}`,
    dataParams
  );
  res.json({ data: result.rows, total: countResult.rows[0].total });
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
