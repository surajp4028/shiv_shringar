// Full SQL backup of the site database (structure + data).
//   npm run db:backup            → backups/shivshringar_YYYY-MM-DD_HH-MM.sql
// The file can be imported into any MySQL 8 / MariaDB server (phpMyAdmin,
// `mysql < file.sql`, or `npm run db:restore -- <file>`).
import fs from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";

const env = process.env;
if (!env.MYSQL_HOST) {
  console.error("MYSQL_* settings not found. Run with: node --env-file=.env.local scripts/db-backup.mjs");
  process.exit(1);
}

const conn = await mysql.createConnection({
  host: env.MYSQL_HOST,
  port: Number(env.MYSQL_PORT ?? 3306),
  user: env.MYSQL_USER,
  password: env.MYSQL_PASSWORD,
  database: env.MYSQL_DATABASE,
  ssl: env.MYSQL_SSL_CA_PATH && fs.existsSync(env.MYSQL_SSL_CA_PATH) ? { ca: fs.readFileSync(env.MYSQL_SSL_CA_PATH, "utf8") } : { rejectUnauthorized: false },
  dateStrings: true, // keep DATETIME/TIMESTAMP values exactly as stored
  charset: "utf8mb4",
});

// Aiven (and some hosts) run with ANSI_QUOTES, which makes SHOW CREATE TABLE
// emit "double-quoted" names that other MySQL servers reject. Use the
// standard mode for this session so the dump uses portable `backticks`.
await conn.query("SET SESSION sql_mode = 'NO_AUTO_VALUE_ON_ZERO', SESSION sql_quote_show_create = 1");

// Timestamp in Indian time for the file name and header.
const now = new Date(Date.now() + 330 * 60_000).toISOString();
const stamp = `${now.slice(0, 10)}_${now.slice(11, 16).replace(":", "-")}`;
const out = [];
const counts = [];

out.push(
  `-- Shiv Shringar Sewa Samiti — database backup`,
  `-- Database: ${env.MYSQL_DATABASE}   Taken: ${now.slice(0, 10)} ${now.slice(11, 19)} IST`,
  `-- Restore: create an empty database, then import this file.`,
  ``,
  `SET NAMES utf8mb4;`,
  `SET FOREIGN_KEY_CHECKS = 0;`,
  `SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';`,
  ``,
);

const [tables] = await conn.query("SHOW FULL TABLES WHERE Table_type = 'BASE TABLE'");
for (const row of tables) {
  const table = Object.values(row)[0];
  const [[create]] = await conn.query(`SHOW CREATE TABLE \`${table}\``);
  out.push(`-- ----------------------------`, `-- Table: ${table}`, `-- ----------------------------`);
  // utf8mb4_0900_* collations exist only in MySQL 8; unicode_ci also works on MariaDB.
  const ddl = create["Create Table"].replace(/utf8mb4_0900_\w+/g, "utf8mb4_unicode_ci");
  out.push(`DROP TABLE IF EXISTS \`${table}\`;`, `${ddl};`, ``);

  const [rows, fields] = await conn.query(`SELECT * FROM \`${table}\``);
  counts.push(`${table}: ${rows.length} rows`);
  if (!rows.length) continue;
  const cols = fields.map((f) => `\`${f.name}\``).join(", ");
  const value = (v) => {
    if (v === null || v === undefined) return "NULL";
    if (Buffer.isBuffer(v)) return `X'${v.toString("hex")}'`;
    if (typeof v === "object") return conn.escape(JSON.stringify(v)); // JSON columns
    return conn.escape(v);
  };
  for (let i = 0; i < rows.length; i += 25) {
    const chunk = rows.slice(i, i + 25).map((r) => `(${fields.map((f) => value(r[f.name])).join(", ")})`);
    out.push(`INSERT INTO \`${table}\` (${cols}) VALUES\n${chunk.join(",\n")};`);
  }
  out.push(``);
}
out.push(`SET FOREIGN_KEY_CHECKS = 1;`, `-- ${counts.join(" | ")}`, ``);
await conn.end();

const dir = path.join(process.cwd(), "backups");
fs.mkdirSync(dir, { recursive: true });
const file = path.join(dir, `${env.MYSQL_DATABASE}_${stamp}.sql`);
fs.writeFileSync(file, out.join("\n"));
console.log(`Backup saved: ${path.relative(process.cwd(), file)} (${(fs.statSync(file).size / 1024).toFixed(1)} KB)`);
console.log(counts.join("\n"));
