// Import a backup .sql file into the database configured in .env.local.
//   npm run db:restore -- backups/shivshringar_2026-11-09_02-15.sql
// WARNING: replaces the tables in that database with the backup's contents.
import fs from "node:fs";
import mysql from "mysql2/promise";

const file = process.argv[2];
if (!file || !fs.existsSync(file)) {
  console.error("Usage: npm run db:restore -- <backup.sql>");
  process.exit(1);
}
const env = process.env;
const db = process.env.RESTORE_DATABASE || env.MYSQL_DATABASE;
const conn = await mysql.createConnection({
  host: env.MYSQL_HOST,
  port: Number(env.MYSQL_PORT ?? 3306),
  user: env.MYSQL_USER,
  password: env.MYSQL_PASSWORD,
  database: db,
  ssl: env.MYSQL_SSL_CA_PATH && fs.existsSync(env.MYSQL_SSL_CA_PATH) ? { ca: fs.readFileSync(env.MYSQL_SSL_CA_PATH, "utf8") } : { rejectUnauthorized: false },
  multipleStatements: true,
  charset: "utf8mb4",
});
await conn.query(fs.readFileSync(file, "utf8"));
const [tables] = await conn.query("SHOW TABLES");
for (const t of tables) {
  const name = Object.values(t)[0];
  const [[{ n }]] = await conn.query(`SELECT COUNT(*) n FROM \`${name}\``);
  console.log(`${name}: ${n} rows`);
}
await conn.end();
console.log(`Restored into database "${db}".`);
