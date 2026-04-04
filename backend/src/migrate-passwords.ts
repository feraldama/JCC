import bcrypt from "bcryptjs";
import { pool } from "./config/db";

async function migratePasswords() {
  const { rows } = await pool.query(
    'SELECT "UsuarioId", "UsuarioContrasena" FROM usuario'
  );

  console.log(`Migrando ${rows.length} contraseñas...`);

  // Ampliar columna a VARCHAR(60) para soportar hash bcrypt
  await pool.query('ALTER TABLE usuario ALTER COLUMN "UsuarioContrasena" TYPE VARCHAR(60)');
  console.log("Columna UsuarioContrasena ampliada a VARCHAR(60)");

  for (const row of rows) {
    // Si ya está hasheada (empieza con $2a$ o $2b$), saltar
    if (row.UsuarioContrasena.startsWith("$2a$") || row.UsuarioContrasena.startsWith("$2b$")) {
      console.log(`  ${row.UsuarioId}: ya está hasheada, saltando`);
      continue;
    }

    const hashed = await bcrypt.hash(row.UsuarioContrasena, 10);
    await pool.query(
      'UPDATE usuario SET "UsuarioContrasena" = $1 WHERE "UsuarioId" = $2',
      [hashed, row.UsuarioId]
    );
    console.log(`  ${row.UsuarioId}: migrada`);
  }

  console.log("Migración completada");
  await pool.end();
}

migratePasswords().catch((err) => {
  console.error("Error en migración:", err);
  process.exit(1);
});
