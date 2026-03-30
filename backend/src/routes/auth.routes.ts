import { Router, Response } from "express";
import jwt from "jsonwebtoken";
import { pool } from "../config/db";
import { AuthRequest, authMiddleware } from "../middleware/auth";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "jcc_secret_key_2024";

// POST /login
router.post("/login", async (req: AuthRequest, res: Response) => {
  const { UsuarioId, Contrasena } = req.body;

  if (!UsuarioId || !Contrasena) {
    res.status(400).json({ error: "UsuarioId y contrasena son requeridos" });
    return;
  }

  const userResult = await pool.query(
    'SELECT "UsuarioId", "UsuarioNombre", "UsuarioApellido", "UsuarioCorreo", "UsuarioIsAdmin", "UsuarioEstado" FROM usuario WHERE "UsuarioId" = $1 AND "UsuarioContrasena" = $2',
    [UsuarioId, Contrasena]
  );

  if (userResult.rows.length === 0) {
    res.status(401).json({ error: "Credenciales incorrectas" });
    return;
  }

  const usuario = userResult.rows[0];

  if (usuario.UsuarioEstado !== "A") {
    res.status(403).json({ error: "Usuario inactivo" });
    return;
  }

  const menusResult = await pool.query(
    `SELECT DISTINCT m."MenuId", m."MenuNombre"
     FROM usuarioperfil up
     JOIN perfilmenu pm ON up."PerfilId" = pm."PerfilId"
     JOIN menu m ON pm."MenuId" = m."MenuId"
     WHERE up."UsuarioId" = $1`,
    [UsuarioId]
  );

  const token = jwt.sign({ userId: UsuarioId }, JWT_SECRET, { expiresIn: "8h" });

  res.json({
    token,
    usuario,
    menus: menusResult.rows,
  });
});

// GET /me (protegido)
router.get("/me", authMiddleware, async (req: AuthRequest, res: Response) => {
  const userResult = await pool.query(
    'SELECT "UsuarioId", "UsuarioNombre", "UsuarioApellido", "UsuarioCorreo", "UsuarioIsAdmin", "UsuarioEstado" FROM usuario WHERE "UsuarioId" = $1',
    [req.userId]
  );

  if (userResult.rows.length === 0) {
    res.status(404).json({ error: "Usuario no encontrado" });
    return;
  }

  const menusResult = await pool.query(
    `SELECT DISTINCT m."MenuId", m."MenuNombre"
     FROM usuarioperfil up
     JOIN perfilmenu pm ON up."PerfilId" = pm."PerfilId"
     JOIN menu m ON pm."MenuId" = m."MenuId"
     WHERE up."UsuarioId" = $1`,
    [req.userId]
  );

  res.json({
    usuario: userResult.rows[0],
    menus: menusResult.rows,
  });
});

export default router;
