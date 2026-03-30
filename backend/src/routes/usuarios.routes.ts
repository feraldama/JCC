import { Router, Request, Response } from "express";
import { pool } from "../config/db";

const router = Router();

// GET / - listar usuarios (sin contrasena)
router.get("/", async (_req: Request, res: Response) => {
  const result = await pool.query(
    'SELECT "UsuarioId", "UsuarioNombre", "UsuarioApellido", "UsuarioCorreo", "UsuarioIsAdmin", "UsuarioEstado" FROM usuario ORDER BY "UsuarioId"'
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

// POST / - crear usuario
router.post("/", async (req: Request, res: Response) => {
  const { UsuarioId, UsuarioContrasena, UsuarioNombre, UsuarioApellido, UsuarioCorreo, UsuarioIsAdmin, UsuarioEstado } = req.body;
  const result = await pool.query(
    `INSERT INTO usuario ("UsuarioId", "UsuarioContrasena", "UsuarioNombre", "UsuarioApellido", "UsuarioCorreo", "UsuarioIsAdmin", "UsuarioEstado")
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING "UsuarioId", "UsuarioNombre", "UsuarioApellido", "UsuarioCorreo", "UsuarioIsAdmin", "UsuarioEstado"`,
    [UsuarioId, UsuarioContrasena, UsuarioNombre, UsuarioApellido, UsuarioCorreo, UsuarioIsAdmin, UsuarioEstado]
  );
  res.status(201).json(result.rows[0]);
});

// PUT /:id - actualizar usuario (sin contrasena si no se envia)
router.put("/:id", async (req: Request, res: Response) => {
  const { UsuarioContrasena, UsuarioNombre, UsuarioApellido, UsuarioCorreo, UsuarioIsAdmin, UsuarioEstado } = req.body;

  let result;
  if (UsuarioContrasena) {
    result = await pool.query(
      `UPDATE usuario SET "UsuarioContrasena" = $1, "UsuarioNombre" = $2, "UsuarioApellido" = $3, "UsuarioCorreo" = $4, "UsuarioIsAdmin" = $5, "UsuarioEstado" = $6
       WHERE "UsuarioId" = $7
       RETURNING "UsuarioId", "UsuarioNombre", "UsuarioApellido", "UsuarioCorreo", "UsuarioIsAdmin", "UsuarioEstado"`,
      [UsuarioContrasena, UsuarioNombre, UsuarioApellido, UsuarioCorreo, UsuarioIsAdmin, UsuarioEstado, req.params.id]
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
