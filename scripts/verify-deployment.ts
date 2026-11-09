import fs from "node:fs";
import path from "node:path";
import db from "../lib/store/db";
import { paypal } from "../lib/paypal/client";

async function verifyDeployment(): Promise<void> {
  console.log("================================================================================");
  console.log("🛠️  OwnTerms — Deployment, Persistence & Boundary Verification Gate");
  console.log("================================================================================");

  let allPassed = true;

  // 1. Runtime Mode Check
  const mode = paypal.getMode();
  console.log(`[1] Runtime Mode: ${mode.toUpperCase()}`);
  if (mode === "sandbox") {
    const hasCreds = paypal.hasValidCredentials();
    console.log(`    PayPal Credentials Configured: ${hasCreds ? "YES (LIVE_SANDBOX ready)" : "NO (Will fail closed)"}`);
  } else {
    console.log("    Deterministic Judge Fixture Flow: ACTIVE (Honest fixture provenance)");
  }

  // 2. Database Path Check
  const dbPath = process.env.OWNTERMS_DB_PATH || path.join(process.cwd(), "data", "ownterms.db");
  console.log(`[2] SQLite Database Path: ${dbPath}`);

  // 3. Persistent Directory Writable Check
  const dbDir = path.dirname(dbPath);
  try {
    const testFile = path.join(dbDir, `.write-test-${Date.now()}`);
    fs.writeFileSync(testFile, "write_ok");
    fs.unlinkSync(testFile);
    console.log(`[3] Persistent Directory Writable: YES (${dbDir})`);
  } catch (err) {
    console.error(`[3] Persistent Directory Writable: FAILED (${dbDir}):`, err);
    allPassed = false;
  }

  // 4. Schema Verification
  const tables = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    .all() as { name: string }[];
  const tableNames = tables.map((t) => t.name).sort();
  const expectedTables = ["idempotency", "ledger", "purchase_intents", "receipts", "webhook_events"];
  const hasAllTables = expectedTables.every((t) => tableNames.includes(t));
  console.log(`[4] Database Schema Integrity: ${hasAllTables ? "PASSED" : "FAILED"}`);
  console.log(`    Detected Tables: [${tableNames.join(", ")}]`);
  if (!hasAllTables) allPassed = false;

  // 5. Unique Constraint & Anti-Silent Overwrite Test
  try {
    const testOrderId = `test_uniq_${Date.now()}`;
    const testHash = `hash_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const insertStmt = db.prepare(`
      INSERT INTO receipts (receipt_id, order_id, capture_id, canonical_hash, data, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    insertStmt.run(`rcpt_${testOrderId}_1`, testOrderId, `cap_${testOrderId}_1`, `${testHash}_1`, "{}", new Date().toISOString());

    let caughtViolation = false;
    try {
      insertStmt.run(`rcpt_${testOrderId}_2`, testOrderId, `cap_${testOrderId}_2`, `${testHash}_2`, "{}", new Date().toISOString());
    } catch {
      caughtViolation = true;
    }

    // Clean up test row
    db.prepare("DELETE FROM receipts WHERE order_id = ?").run(testOrderId);

    if (caughtViolation) {
      console.log("[5] Receipt Uniqueness & Fail-Closed Overwrite Prevention: PASSED (UNIQUE constraint enforced)");
    } else {
      console.error("[5] Receipt Uniqueness: FAILED (Silent duplicate allowed)");
      allPassed = false;
    }
  } catch (err) {
    console.error("[5] Receipt Uniqueness: ERROR:", err);
    allPassed = false;
  }

  // 6. Provider Provenance Audit
  const provenances = db.prepare("SELECT DISTINCT json_extract(data, '$.provenance') as prov FROM ledger").all() as { prov: string }[];
  const provList = provenances.map((p) => p.prov || "UNKNOWN");
  console.log(`[6] Ledger Provenance Tags Recorded: [${provList.join(", ")}]`);

  // 7. Health Endpoint Contract Verification
  try {
    const { GET: healthHandler } = await import("../app/api/health/route");
    const healthRes = await healthHandler();
    const healthJson = await healthRes.json();
    if (healthRes.status === 200 && healthJson.status === "ok") {
      console.log("[7] Health Endpoint (/api/health): PASSED (HTTP 200, status: ok)");
    } else {
      console.error("[7] Health Endpoint: FAILED:", healthJson);
      allPassed = false;
    }
  } catch (err) {
    console.error("[7] Health Endpoint: ERROR:", err);
    allPassed = false;
  }

  console.log("================================================================================");
  if (allPassed) {
    console.log("✅ All Deployment & Persistence Verification Gates PASSED.");
    process.exitCode = 0;
  } else {
    console.error("❌ One or more verification gates FAILED.");
    process.exitCode = 1;
  }
}

void verifyDeployment();
