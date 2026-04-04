import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { pool } from "../config/db";
import { buildOrderBy } from "../utils/sorting";

const router = Router();

// GET / - listar usuarios (sin contrasena)
router.get("/", async (req: Request, res: Response) => {
  const { busqueda, page, limit } = req.query;
  let where = "WHERE 1=1";
  const params: any[] = [];
  let i = 1;

  if (busqueda) {
    where += ` AND ("UsuarioId" ILIKE $${i} OR "UsuarioNombre" ILIKE $${i} OR "UsuarioApellido" ILIKE $${i} OR "UsuarioCorreo" ILIKE $${i})`;
    params.push(`%${busqueda}%`);
    i++;
  }

  const countResult = await pool.query(`SELECT COUNT(*)::int AS total FROM usuario ${where}`, params);

  const pageNum = Math.max(0, Number(page) || 0);
  const pageSize = Math.min(10000, Math.max(1, Number(limit) || 10));
  const dataParams = [...params, pageSize, pageNum * pageSize];
  const orderBy = buildOrderBy(req, {
    UsuarioId: '"UsuarioId"',
    UsuarioNombre: '"UsuarioNombre"',
    UsuarioApellido: '"UsuarioApellido"',
    UsuarioCorreo: '"UsuarioCorreo"',
  }, '"UsuarioId"');
  const result = await pool.query(
    `SELECT "UsuarioId", "UsuarioNombre", "UsuarioApellido", "UsuarioCorreo", "UsuarioIsAdmin", "UsuarioEstado" FROM usuario ${where} ${orderBy} LIMIT $${i} OFFSET $${i + 1}`,
    dataParams
  );
  res.json({ data: result.rows, total: countResult.rows[0].total });
});

// POST / - crear usuario
router.post("/", async (req: Request, res: Response) => {
  const { UsuarioId, UsuarioContrasena, UsuarioNombre, UsuarioApellido, UsuarioCorreo, UsuarioIsAdmin, UsuarioEstado } = req.body;
  const hashedPassword = await bcrypt.hash(UsuarioContrasena, 10);
  const result = await pool.query(
    `INSERT INTO usuario ("UsuarioId", "UsuarioContrasena", "UsuarioNombre", "UsuarioApellido", "UsuarioCorreo", "UsuarioIsAdmin", "UsuarioEstado")
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING "UsuarioId", "UsuarioNombre", "UsuarioApellido", "UsuarioCorreo", "UsuarioIsAdmin", "UsuarioEstado"`,
    [UsuarioId, hashedPassword, UsuarioNombre, UsuarioApellido, UsuarioCorreo, UsuarioIsAdmin, UsuarioEstado]
  );
  res.status(201).json(result.rows[0]);
});

// GET /:id/perfiles - obtener perfiles asignados al usuario (ANTES de /:id)
router.get("/:id/perfiles", async (req: Request, res: Response) => {
  const result = await pool.query(
    `SELECT p."PerfilId", p."PerfilDescripcion"
     FROM usuarioperfil up
     JOIN perfil p ON up."PerfilId" = p."PerfilId"
     WHERE up."UsuarioId" = $1`,
    [req.params.id]
  );
  res.json(result.rows);
});

// POST /:id/perfiles - asignar perfiles al usuario (ANTES de /:id)
router.post("/:id/perfiles", async (req: Request, res: Response) => {
  const usuarioId = req.params.id;
  const { perfiles } = req.body as { perfiles: number[] };

  const userResult = await pool.query('SELECT "UsuarioId" FROM usuario WHERE "UsuarioId" = $1', [usuarioId]);
  if (userResult.rows.length === 0) {
    res.status(404).json({ error: "Usuario no encontrado" });
    return;
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query('DELETE FROM usuarioperfil WHERE "UsuarioId" = $1', [usuarioId]);
    for (const perfilId of perfiles) {
      await client.query(
        'INSERT INTO usuarioperfil ("UsuarioId", "PerfilId") VALUES ($1, $2)',
        [usuarioId, perfilId]
      );
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  const result = await pool.query(
    `SELECT p."PerfilId", p."PerfilDescripcion"
     FROM usuarioperfil up
     JOIN perfil p ON up."PerfilId" = p."PerfilId"
     WHERE up."UsuarioId" = $1`,
    [usuarioId]
  );
  res.json(result.rows);
});

// GET /:id - obtener usuario por id con perfiles asignados
router.get("/:id", async (req: Request, res: Response) => {
  const userResult = await pool.query(
    'SELECT "UsuarioId", "UsuarioNombre", "UsuarioApellido", "UsuarioCorreo", "UsuarioIsAdmin", "UsuarioEstado" FROM usuario WHERE "UsuarioId" = $1',
    [req.params.id]
  );
  if (userResult.rows.length === 0) {
    res.status(404).json({ error: "Usuario no encontrado" });
    return;
  }

  const perfilesResult = await pool.query(
    `SELECT p."PerfilId", p."PerfilDescripcion"
     FROM usuarioperfil up
     JOIN perfil p ON up."PerfilId" = p."PerfilId"
     WHERE up."UsuarioId" = $1`,
    [req.params.id]
  );

  res.json({
    ...userResult.rows[0],
    perfiles: perfilesResult.rows,
  });
});

// PUT /:id - actualizar usuario (sin contrasena si no se envia)
router.put("/:id", async (req: Request, res: Response) => {
  const { UsuarioContrasena, UsuarioNombre, UsuarioApellido, UsuarioCorreo, UsuarioIsAdmin, UsuarioEstado } = req.body;

  let result;
  if (UsuarioContrasena) {
    const hashedPassword = await bcrypt.hash(UsuarioContrasena, 10);
    result = await pool.query(
      `UPDATE usuario SET "UsuarioContrasena" = $1, "UsuarioNombre" = $2, "UsuarioApellido" = $3, "UsuarioCorreo" = $4, "UsuarioIsAdmin" = $5, "UsuarioEstado" = $6
       WHERE "UsuarioId" = $7
       RETURNING "UsuarioId", "UsuarioNombre", "UsuarioApellido", "UsuarioCorreo", "UsuarioIsAdmin", "UsuarioEstado"`,
      [hashedPassword, UsuarioNombre, UsuarioApellido, UsuarioCorreo, UsuarioIsAdmin, UsuarioEstado, req.params.id]
    );
  } else {
    result = await pool.query(
      `UPDATE usuario SET "UsuarioNombre" = $1, "UsuarioApellido" = $2, "UsuarioCorreo" = $3, "UsuarioIsAdmin" = $4, "UsuarioEstado" = $5
       WHERE "UsuarioId" = $6
       RETURNING "UsuarioId", "UsuarioNombre", "UsuarioApellido", "UsuarioCorreo", "UsuarioIsAdmin", "UsuarioEstado"`,
      [UsuarioNombre, UsuarioApellido, UsuarioCorreo, UsuarioIsAdmin, UsuarioEstado, req.params.id]
    );
  }

  if (result.rows.length === 0) {
    res.status(404).json({ error: "Usuario no encontrado" });
    return;
  }
  res.json(result.rows[0]);
});

// DELETE /:id - eliminar usuario
router.delete("/:id", async (req: Request, res: Response) => {
  const result = await pool.query('DELETE FROM usuario WHERE "UsuarioId" = $1 RETURNING "UsuarioId"', [req.params.id]);
  if (result.rows.length === 0) {
    res.status(404).json({ error: "Usuario no encontrado" });
    return;
  }
  res.json({ message: "Usuario eliminado" });
});

export default router;
