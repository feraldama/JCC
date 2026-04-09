import { Router, Request, Response } from "express";
import { pool } from "../config/db";
import { buildOrderBy } from "../utils/sorting";

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
  const pageSize = Math.min(10000, Math.max(1, Number(limit) || 10));
  const dataParams = [...params, pageSize, pageNum * pageSize];
  const orderBy = buildOrderBy(req, {
    CursoNombre: '"CursoNombre"',
    CursoImporte: '"CursoImporte"',
  }, '"CursoId"');
  const result = await pool.query(
    `SELECT * FROM curso ${where} ${orderBy} LIMIT $${i} OFFSET $${i + 1}`,
    dataParams
  );
  res.json({ data: result.rows, total: countResult.rows[0].total });
});

// GET /:id/estado-cuenta - estado de cuenta de todos los alumnos del curso
router.get("/:id/estado-cuenta", async (req: Request, res: Response) => {
  const cursoId = Number(req.params.id);
  const { anio } = req.query;
  const year = Number(anio) || new Date().getFullYear();

  // Datos del curso
  const cursoResult = await pool.query(
    'SELECT * FROM curso WHERE "CursoId" = $1',
    [cursoId]
  );
  if (cursoResult.rows.length === 0) {
    res.status(404).json({ error: "Curso no encontrado" });
    return;
  }
  const curso = cursoResult.rows[0];
  const importe = Number(curso.CursoImporte);

  // Alumnos del curso
  const alumnosResult = await pool.query(
    `SELECT "AlumnoId", "AlumnoNombre", "AlumnoApellido", "AlumnoCI"
     FROM alumno WHERE "CursoId" = $1
     ORDER BY "AlumnoApellido", "AlumnoNombre"`,
    [cursoId]
  );

  // Cobranzas de todos los alumnos del curso en el año
  const alumnoIds = alumnosResult.rows.map((a: any) => a.AlumnoId);
  let cobranzasMap: Record<number, { CobranzaId: number; CobranzaFecha: string; CobranzaMesPagado: string }[]> = {};
  if (alumnoIds.length > 0) {
    const cobranzasResult = await pool.query(
      `SELECT "CobranzaId", "CobranzaFecha", "CobranzaMesPagado", "AlumnoId"
       FROM cobranza
       WHERE "AlumnoId" = ANY($1) AND EXTRACT(YEAR FROM "CobranzaFecha") = $2
         AND "CobranzaEstado" = 'A'`,
      [alumnoIds, year]
    );
    for (const c of cobranzasResult.rows) {
      if (!cobranzasMap[c.AlumnoId]) cobranzasMap[c.AlumnoId] = [];
      cobranzasMap[c.AlumnoId].push(c);
    }
  }

  const nombreANum: Record<string, number> = {
    FEBRERO: 2, MARZO: 3, ABRIL: 4, MAYO: 5, JUNIO: 6,
    JULIO: 7, AGOSTO: 8, SEPTIEMBRE: 9, OCTUBRE: 10, NOVIEMBRE: 11,
  };
  const nombresMeses: Record<number, string> = {
    2: "FEBRERO", 3: "MARZO", 4: "ABRIL", 5: "MAYO", 6: "JUNIO",
    7: "JULIO", 8: "AGOSTO", 9: "SEPTIEMBRE", 10: "OCTUBRE", 11: "NOVIEMBRE",
  };

  let totalGeneralPagado = 0;
  let totalGeneralPendiente = 0;

  const alumnos = alumnosResult.rows.map((alumno: any) => {
    const cobranzas = cobranzasMap[alumno.AlumnoId] || [];
    const mesesPagados = new Set<number>();
    for (const c of cobranzas) {
      const nombres = String(c.CobranzaMesPagado).split(",").map((s: string) => s.trim().toUpperCase());
      for (const nombre of nombres) {
        const num = nombreANum[nombre];
        if (num) mesesPagados.add(num);
      }
    }

    let totalPagado = 0;
    let totalPendiente = 0;
    const meses: { mes: number; nombre: string; pagado: boolean; monto: number }[] = [];
    for (let m = 2; m <= 11; m++) {
      const monto = m === 2 ? Math.floor(importe / 2) : importe;
      const pagado = mesesPagados.has(m);
      if (pagado) totalPagado += monto;
      else totalPendiente += monto;
      meses.push({ mes: m, nombre: nombresMeses[m], pagado, monto });
    }

    totalGeneralPagado += totalPagado;
    totalGeneralPendiente += totalPendiente;

    return {
      AlumnoId: alumno.AlumnoId,
      AlumnoNombre: alumno.AlumnoNombre,
      AlumnoApellido: alumno.AlumnoApellido,
      AlumnoCI: alumno.AlumnoCI,
      meses,
      totalPagado,
      totalPendiente,
    };
  });

  res.json({
    curso: { CursoId: curso.CursoId, CursoNombre: curso.CursoNombre, CursoImporte: importe },
    anio: year,
    alumnos,
    totalGeneralPagado,
    totalGeneralPendiente,
  });
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
