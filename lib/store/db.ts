import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";

const dbDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, "ownterms.db");
const db = new Database(dbPath);

// Enable WAL mode for high concurrency and crash resilience
db.pragma("journal_mode = WAL");
db.pragma("synchronous = NORMAL");

// Initialize Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS purchase_intents (
    id TEXT PRIMARY KEY,
    order_id TEXT UNIQUE,
    state TEXT NOT NULL,
    data TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS receipts (
    receipt_id TEXT PRIMARY KEY,
    order_id TEXT UNIQUE,
    capture_id TEXT NOT NULL,
    canonical_hash TEXT UNIQUE NOT NULL,
    data TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS webhook_events (
    event_id TEXT PRIMARY KEY,
    event_type TEXT NOT NULL,
    data TEXT NOT NULL,
    processed_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS idempotency (
    idempotency_key TEXT PRIMARY KEY,
    response TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS ledger (
    id TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    timestamp TEXT NOT NULL
  );
`);

export default db;
