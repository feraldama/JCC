import { Router, Request, Response } from "express";
import { pool } from "../config/db";

const router = Router();

// GET / - listar todos los menus
router.get("/", async (_req: Request, res: Response) => {
  const result = await pool.query('SELECT * FROM menu ORDER BY "MenuId"');
  res.json(result.rows);
});

export default router;
