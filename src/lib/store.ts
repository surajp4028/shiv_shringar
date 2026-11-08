import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { RowDataPacket } from "mysql2/promise";
import { getPool } from "@/lib/db";
import { seedItems, seedSettings } from "@/data/seed";
import {
  COLLECTIONS,
  type CollectionName,
  type Collections,
  type Settings,
  type SiteData,
} from "@/lib/types";

/*
 * Content store. MySQL (Aiven) is the primary backend: two tables,
 *   ss_settings (one JSON row) and ss_items (collection + JSON data).
 * If MySQL isn't configured or can't be reached, the same API reads and
 * writes data/store.json so the site still works locally.
 */

type Row<C extends CollectionName> = Collections[C];
type JsonStore = { settings: Settings } & { [K in CollectionName]: Row<K>[] };

const JSON_PATH = path.join(process.cwd(), "data", "store.json");
const g = globalThis as unknown as { __ssSchema?: Promise<void> | null; __ssMode?: "mysql" | "json" };

/* ---------------- seeding ---------------- */

function seededRows<C extends CollectionName>(c: C): Row<C>[] {
  const now = Date.now();
  return (seedItems[c] as Omit<Row<C>, "id" | "createdAt">[]).map(
    (data, i) =>
      ({ ...data, id: randomUUID(), createdAt: new Date(now - i * 60_000).toISOString() }) as Row<C>,
  );
}

/* ---------------- MySQL ---------------- */

async function ensureSchema() {
  const pool = getPool();
  if (!pool) throw new Error("MySQL not configured");
  g.__ssSchema ??= (async () => {
    await pool.query(`CREATE TABLE IF NOT EXISTS ss_settings (
      id TINYINT PRIMARY KEY,
      data JSON NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);
    await pool.query(`CREATE TABLE IF NOT EXISTS ss_items (
      id VARCHAR(36) PRIMARY KEY,
      collection VARCHAR(32) NOT NULL,
      data JSON NOT NULL,
      created_at DATETIME(3) NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_collection (collection, created_at)
    )`);
    const [rows] = await pool.query<RowDataPacket[]>("SELECT id FROM ss_settings WHERE id = 1");
    if (rows.length === 0) {
      await pool.query("INSERT INTO ss_settings (id, data) VALUES (1, ?)", [JSON.stringify(seedSettings)]);
      for (const c of COLLECTIONS) {
        for (const row of seededRows(c)) {
          const { id, createdAt, ...data } = row as Row<typeof c> & { id: string; createdAt: string };
          await pool.query(
            "INSERT INTO ss_items (id, collection, data, created_at) VALUES (?, ?, ?, ?)",
            [id, c, JSON.stringify(data), new Date(createdAt)],
          );
        }
      }
    }
  })().catch((err) => {
    g.__ssSchema = null; // retry on next request
    throw err;
  });
  return g.__ssSchema;
}

const parse = (v: unknown) => (typeof v === "string" ? JSON.parse(v) : v);

/* ---------------- JSON fallback ---------------- */

async function readJson(): Promise<JsonStore> {
  try {
    const store = JSON.parse(await fs.readFile(JSON_PATH, "utf8")) as JsonStore;
    store.settings = { ...seedSettings, ...store.settings };
    for (const c of COLLECTIONS) store[c] ??= [] as never;
    return store;
  } catch {
    const fresh = { settings: seedSettings } as JsonStore;
    for (const c of COLLECTIONS) (fresh as Record<string, unknown>)[c] = seededRows(c);
    await writeJson(fresh);
    return fresh;
  }
}

async function writeJson(store: JsonStore) {
  await fs.mkdir(path.dirname(JSON_PATH), { recursive: true });
  await fs.writeFile(JSON_PATH, JSON.stringify(store, null, 2));
}

/* ---------------- backend switch ---------------- */

async function withBackend<T>(mysqlFn: () => Promise<T>, jsonFn: () => Promise<T>): Promise<T> {
  if (getPool()) {
    try {
      await ensureSchema();
      const out = await mysqlFn();
      g.__ssMode = "mysql";
      return out;
    } catch (err) {
      console.error("[store] MySQL unavailable, using data/store.json:", err instanceof Error ? err.message : err);
    }
  }
  g.__ssMode = "json";
  return jsonFn();
}

export function storeMode() {
  return g.__ssMode ?? (getPool() ? "mysql" : "json");
}

/* ---------------- public API ---------------- */

export async function getSettings(): Promise<Settings> {
  return withBackend(
    async () => {
      const [rows] = await getPool()!.query<RowDataPacket[]>("SELECT data FROM ss_settings WHERE id = 1");
      return { ...seedSettings, ...(rows[0] ? parse(rows[0].data) : {}) };
    },
    async () => (await readJson()).settings,
  );
}

export async function updateSettings(patch: Partial<Settings>): Promise<Settings> {
  const next = { ...(await getSettings()), ...patch };
  return withBackend(
    async () => {
      await getPool()!.query(
        "INSERT INTO ss_settings (id, data) VALUES (1, ?) ON DUPLICATE KEY UPDATE data = VALUES(data)",
        [JSON.stringify(next)],
      );
      return next;
    },
    async () => {
      const store = await readJson();
      store.settings = next;
      await writeJson(store);
      return next;
    },
  );
}

export async function listItems<C extends CollectionName>(c: C): Promise<Row<C>[]> {
  return withBackend(
    async () => {
      const [rows] = await getPool()!.query<RowDataPacket[]>(
        "SELECT id, data, created_at FROM ss_items WHERE collection = ? ORDER BY created_at DESC",
        [c],
      );
      return rows.map(
        (r) => ({ ...parse(r.data), id: r.id, createdAt: new Date(r.created_at).toISOString() }) as Row<C>,
      );
    },
    async () => {
      const list = (await readJson())[c] as Row<C>[];
      return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
  );
}

export async function createItem<C extends CollectionName>(
  c: C,
  data: Omit<Row<C>, "id" | "createdAt">,
): Promise<Row<C>> {
  const row = { ...data, id: randomUUID(), createdAt: new Date().toISOString() } as Row<C>;
  return withBackend(
    async () => {
      await getPool()!.query(
        "INSERT INTO ss_items (id, collection, data, created_at) VALUES (?, ?, ?, ?)",
        [row.id, c, JSON.stringify(data), new Date(row.createdAt)],
      );
      return row;
    },
    async () => {
      const store = await readJson();
      (store[c] as Row<C>[]).unshift(row);
      await writeJson(store);
      return row;
    },
  );
}

export async function updateItem<C extends CollectionName>(
  c: C,
  id: string,
  data: Partial<Omit<Row<C>, "id" | "createdAt">>,
): Promise<Row<C> | null> {
  return withBackend(
    async () => {
      const pool = getPool()!;
      const [rows] = await pool.query<RowDataPacket[]>(
        "SELECT data, created_at FROM ss_items WHERE id = ? AND collection = ?",
        [id, c],
      );
      if (!rows[0]) return null;
      const merged = { ...parse(rows[0].data), ...data };
      delete merged.id;
      delete merged.createdAt;
      await pool.query("UPDATE ss_items SET data = ? WHERE id = ?", [JSON.stringify(merged), id]);
      return { ...merged, id, createdAt: new Date(rows[0].created_at).toISOString() } as Row<C>;
    },
    async () => {
      const store = await readJson();
      const list = store[c] as Row<C>[];
      const i = list.findIndex((r) => r.id === id);
      if (i < 0) return null;
      list[i] = { ...list[i], ...data, id, createdAt: list[i].createdAt };
      await writeJson(store);
      return list[i];
    },
  );
}

export async function deleteItem(c: CollectionName, id: string): Promise<boolean> {
  return withBackend(
    async () => {
      const [res] = await getPool()!.query("DELETE FROM ss_items WHERE id = ? AND collection = ?", [id, c]);
      return (res as { affectedRows: number }).affectedRows > 0;
    },
    async () => {
      const store = await readJson();
      const list = store[c] as { id: string }[];
      const next = list.filter((r) => r.id !== id);
      (store as Record<string, unknown>)[c] = next;
      await writeJson(store);
      return next.length !== list.length;
    },
  );
}

export async function getSiteData(): Promise<SiteData> {
  const [settings, events, videos, shringar, highlights, trips, gallery, schedule] = await Promise.all([
    getSettings(),
    listItems("events"),
    listItems("videos"),
    listItems("shringar"),
    listItems("highlights"),
    listItems("trips"),
    listItems("gallery"),
    listItems("schedule"),
  ]);
  return { settings, events, videos, shringar, highlights, trips, gallery, schedule };
}
