import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./config/db";
import { authMiddleware } from "./middleware/auth";

import authRoutes from "./routes/auth.routes";
import cursosRoutes from "./routes/cursos.routes";
import alumnosRoutes from "./routes/alumnos.routes";
import cobranzasRoutes from "./routes/cobranzas.routes";
import facturasRoutes from "./routes/facturas.routes";
import empleadosRoutes from "./routes/empleados.routes";
import pagosRoutes from "./routes/pagos.routes";
import registrosRoutes from "./routes/registros.routes";
import usuariosRoutes from "./routes/usuarios.routes";
import perfilesRoutes from "./routes/perfiles.routes";
import menusRoutes from "./routes/menus.routes";
import dashboardRoutes from "./routes/dashboard.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Ruta publica de salud
app.get("/api/health", async (_req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ status: "ok", time: result.rows[0].now });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Database connection failed" });
  }
});

// Rutas publicas
app.use("/api/auth", authRoutes);

// Rutas protegidas
app.use("/api/cursos", authMiddleware, cursosRoutes);
app.use("/api/alumnos", authMiddleware, alumnosRoutes);
app.use("/api/cobranzas", authMiddleware, cobranzasRoutes);
app.use("/api/facturas", authMiddleware, facturasRoutes);
app.use("/api/empleados", authMiddleware, empleadosRoutes);
app.use("/api/pagos", authMiddleware, pagosRoutes);
app.use("/api/registros", authMiddleware, registrosRoutes);
app.use("/api/usuarios", authMiddleware, usuariosRoutes);
app.use("/api/perfiles", authMiddleware, perfilesRoutes);
app.use("/api/menus", authMiddleware, menusRoutes);
app.use("/api/dashboard", authMiddleware, dashboardRoutes);

// Error handler global
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Error:", err.message);
  res.status(500).json({ error: "Error interno del servidor", message: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
