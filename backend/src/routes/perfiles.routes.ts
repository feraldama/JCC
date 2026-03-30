import { Router, Request, Response } from "express";
import { pool } from "../config/db";

const router = Router();

// GET / - listar perfiles
router.get("/", async (_req: Request, res: Response) => {
  const result = await pool.query('SELECT * FROM perfil ORDER BY "PerfilId"');
  res.json(result.rows);
});

// GET /:id - obtener perfil con sus menus asignados
router.get("/:id", async (req: Request, res: Response) => {
  const perfilResult = await pool.query('SELECT * FROM perfil WHERE "PerfilId" = $1', [req.params.id]);
  if (perfilResult.rows.length === 0) {
    res.status(404).json({ error: "Perfil no encontrado" });
    return;
  }

  const menusResult = await pool.query(
    `SELECT m."MenuId", m."MenuNombre"
     FROM perfilmenu pm
     JOIN menu m ON pm."MenuId" = m."MenuId"
     WHERE pm."PerfilId" = $1`,
    [req.params.id]
  );

  res.json({
    ...perfilResult.rows[0],
    menus: menusResult.rows,
  });
});

// POST / - crear perfil
router.post("/", async (req: Request, res: Response) => {
  const { PerfilDescripcion } = req.body;
  const result = await pool.query(
    'INSERT INTO perfil ("PerfilDescripcion") VALUES ($1) RETURNING *',
    [PerfilDescripcion]
  );
  res.status(201).json(result.rows[0]);
});

// PUT /:id - actualizar perfil
router.put("/:id", async (req: Request, res: Response) => {
  const { PerfilDescripcion } = req.body;
  const result = await pool.query(
    'UPDATE perfil SET "PerfilDescripcion" = $1 WHERE "PerfilId" = $2 RETURNING *',
    [PerfilDescripcion, req.params.id]
  );
  if (result.rows.length === 0) {
    res.status(404).json({ error: "Perfil no encontrado" });
    return;
  }
  res.json(result.rows[0]);
});

// DELETE /:id - eliminar perfil
router.delete("/:id", async (req: Request, res: Response) => {
  const result = await pool.query('DELETE FROM perfil WHERE "PerfilId" = $1 RETURNING *', [req.params.id]);
  if (result.rows.length === 0) {
    res.status(404).json({ error: "Perfil no encontrado" });
    return;
  }
  res.json({ message: "Perfil eliminado" });
});

// POST /:id/menus - asignar menus al perfil
router.post("/:id/menus", async (req: Request, res: Response) => {
  const perfilId = req.params.id;
  const { menus } = req.body as { menus: string[] };

  // Verificar que el perfil existe
  const perfilResult = await pool.query('SELECT * FROM perfil WHERE "PerfilId" = $1', [perfilId]);
  if (perfilResult.rows.length === 0) {
    res.status(404).json({ error: "Perfil no encontrado" });
    return;
  }

  // Eliminar menus actuales y asignar los nuevos en una transaccion
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query('DELETE FROM perfilmenu WHERE "PerfilId" = $1', [perfilId]);

    for (const menuId of menus) {
      await client.query(
        'INSERT INTO perfilmenu ("PerfilId", "MenuId") VALUES ($1, $2)',
        [perfilId, menuId]
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  // Devolver el perfil con los menus actualizados
  const menusResult = await pool.query(
    `SELECT m."MenuId", m."MenuNombre"
     FROM perfilmenu pm
     JOIN menu m ON pm."MenuId" = m."MenuId"
     WHERE pm."PerfilId" = $1`,
    [perfilId]
  );

  res.json({
    ...perfilResult.rows[0],
    menus: menusResult.rows,
  });
});

export default router;
