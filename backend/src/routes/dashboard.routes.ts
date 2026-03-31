import { Router, Request, Response } from "express";
import { pool } from "../config/db";

const router = Router();

// GET / - estadísticas para el dashboard
router.get("/", async (_req: Request, res: Response) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const primerDiaMes = `${year}-${String(month).padStart(2, "0")}-01`;
  const ultimoDiaMes = `${year}-${String(month).padStart(2, "0")}-${new Date(year, month, 0).getDate()}`;

  const [
    totalAlumnos,
    totalEmpleados,
    cobranzasMes,
    registrosMes,
    alumnosPorCurso,
    cobranzasPorMes,
    cobranzasRecientes,
    alumnosMorosos,
    pagosMes,
  ] = await Promise.all([
    // Total alumnos
    pool.query('SELECT COUNT(*)::int AS total FROM alumno'),

    // Total empleados
    pool.query('SELECT COUNT(*)::int AS total FROM empleado'),

    // Cobranzas del mes actual: cantidad y monto total
    pool.query(
      `SELECT COUNT(*)::int AS cantidad,
              COALESCE(SUM("CobranzaSubtotalCuota"), 0)::bigint AS monto
       FROM cobranza
       WHERE "CobranzaFecha" >= $1 AND "CobranzaFecha" <= $2`,
      [primerDiaMes, ultimoDiaMes]
    ),

    // Registros del mes actual
    pool.query(
      `SELECT COUNT(*)::int AS total
       FROM registro
       WHERE "RegistroFecha" >= $1 AND "RegistroFecha" <= $2`,
      [primerDiaMes, ultimoDiaMes]
    ),

    // Alumnos por curso (para gráfico de torta)
    pool.query(
      `SELECT c."CursoNombre" AS nombre, COUNT(*)::int AS cantidad
       FROM alumno a
       JOIN curso c ON a."CursoId" = c."CursoId"
       GROUP BY c."CursoNombre"
       ORDER BY cantidad DESC`
    ),

    // Cobranzas agrupadas por mes (últimos 6 meses, para gráfico de barras)
    pool.query(
      `SELECT TO_CHAR("CobranzaFecha", 'YYYY-MM') AS mes,
              COUNT(*)::int AS cantidad,
              COALESCE(SUM("CobranzaSubtotalCuota"), 0)::bigint AS monto
       FROM cobranza
       WHERE "CobranzaFecha" >= (CURRENT_DATE - INTERVAL '6 months')
       GROUP BY TO_CHAR("CobranzaFecha", 'YYYY-MM')
       ORDER BY mes ASC`
    ),

    // Últimas 5 cobranzas
    pool.query(
      `SELECT co."CobranzaId", co."CobranzaFecha", co."CobranzaSubtotalCuota",
              co."CobranzaMesPagado",
              a."AlumnoNombre", a."AlumnoApellido"
       FROM cobranza co
       JOIN alumno a ON co."AlumnoId" = a."AlumnoId"
       ORDER BY co."CobranzaId" DESC
       LIMIT 5`
    ),

    // Alumnos con mora (últimas cobranzas con días de mora > 0)
    pool.query(
      `SELECT co."CobranzaDiasMora", co."CobranzaFecha", co."CobranzaSubtotalCuota",
              a."AlumnoNombre", a."AlumnoApellido", a."AlumnoCI"
       FROM cobranza co
       JOIN alumno a ON co."AlumnoId" = a."AlumnoId"
       WHERE co."CobranzaDiasMora" > 0
       ORDER BY co."CobranzaDiasMora" DESC
       LIMIT 10`
    ),

    // Pagos a empleados del mes actual
    pool.query(
      `SELECT COALESCE(SUM("PagoEmpleadoEntregaMonto"), 0)::bigint AS monto,
              COUNT(*)::int AS cantidad
       FROM pagoempleado
       WHERE "PagoEmpleadoFecha" >= $1 AND "PagoEmpleadoFecha" <= $2`,
      [primerDiaMes, ultimoDiaMes]
    ),
  ]);

  res.json({
    totalAlumnos: totalAlumnos.rows[0].total,
    totalEmpleados: totalEmpleados.rows[0].total,
    cobranzasMes: {
      cantidad: cobranzasMes.rows[0].cantidad,
      monto: Number(cobranzasMes.rows[0].monto),
    },
    registrosMes: registrosMes.rows[0].total,
    alumnosPorCurso: alumnosPorCurso.rows,
    cobranzasPorMes: cobranzasPorMes.rows.map((r: any) => ({
      mes: r.mes,
      cantidad: r.cantidad,
      monto: Number(r.monto),
    })),
    cobranzasRecientes: cobranzasRecientes.rows.map((r: any) => ({
      ...r,
      CobranzaSubtotalCuota: Number(r.CobranzaSubtotalCuota),
    })),
    alumnosMorosos: alumnosMorosos.rows.map((r: any) => ({
      ...r,
      CobranzaSubtotalCuota: Number(r.CobranzaSubtotalCuota),
    })),
    pagosMes: {
      cantidad: pagosMes.rows[0].cantidad,
      monto: Number(pagosMes.rows[0].monto),
    },
  });
});

export default router;
