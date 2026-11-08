import "server-only";
import fs from "node:fs";
import mysql, { type Pool } from "mysql2/promise";

// One pool per server process (kept on globalThis so dev hot-reloads reuse it).
const g = globalThis as unknown as { __ssPool?: Pool | null };

export function dbConfigured() {
  return Boolean(process.env.MYSQL_HOST && process.env.MYSQL_USER && process.env.MYSQL_DATABASE);
}

export function getPool(): Pool | null {
  if (!dbConfigured()) return null;
  if (g.__ssPool) return g.__ssPool;

  const caPath = process.env.MYSQL_SSL_CA_PATH;
  // Aiven only accepts SSL connections. With the CA file the certificate is
  // fully verified; without it the connection is still encrypted.
  const ssl =
    caPath && fs.existsSync(caPath)
      ? { ca: fs.readFileSync(caPath, "utf8") }
      : { rejectUnauthorized: false };

  g.__ssPool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT ?? 3306),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    ssl,
    connectionLimit: 5,
    connectTimeout: 10_000,
    waitForConnections: true,
  });
  return g.__ssPool;
}
