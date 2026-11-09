import db from "./db";
import {
  Asset,
  LicensePolicy,
  RightsReceipt,
  LedgerEntry,
  PurchaseIntent,
  PurchaseIntentSchema,
  RightsReceiptSchema,
  LedgerEntrySchema,
} from "@/lib/types/domain";
import {
  CANONICAL_ASSETS,
  CANONICAL_POLICIES,
  INITIAL_LEDGER_ENTRIES,
} from "@/lib/data/seeds";

export class StoreRepository {
  private assets: Asset[];
  private policies: Record<string, LicensePolicy[]>;

  constructor() {
    this.assets = [...CANONICAL_ASSETS];
    this.policies = { ...CANONICAL_POLICIES };
    this.ensureInitialLedger();
  }

  private ensureInitialLedger(): void {
    const row = db.prepare("SELECT COUNT(*) as count FROM ledger").get() as { count: number };
    if (row.count === 0) {
      const insert = db.prepare("INSERT INTO ledger (id, data, timestamp) VALUES (?, ?, ?)");
      for (const entry of INITIAL_LEDGER_ENTRIES) {
        insert.run(entry.id, JSON.stringify(entry), entry.timestamp);
      }
    }
  }

  public resetToSeeds(): void {
    db.exec(`
      DELETE FROM purchase_intents;
      DELETE FROM receipts;
      DELETE FROM webhook_events;
      DELETE FROM idempotency;
      DELETE FROM ledger;
    `);
    const insert = db.prepare("INSERT INTO ledger (id, data, timestamp) VALUES (?, ?, ?)");
    for (const entry of INITIAL_LEDGER_ENTRIES) {
      insert.run(entry.id, JSON.stringify(entry), entry.timestamp);
    }
  }

  // Assets (Code-Seeded Source of Truth)
  public getAssets(): Asset[] {
    return this.assets;
  }

  public getAssetById(id: string): Asset | undefined {
    return this.assets.find((a) => a.id === id);
  }

  // Policies (Code-Seeded Source of Truth)
  public getPoliciesForAsset(assetId: string): LicensePolicy[] {
    return this.policies[assetId] || [];
  }

  public getPolicyById(assetId: string, policyId: string): LicensePolicy | undefined {
    const policies = this.getPoliciesForAsset(assetId);
    return policies.find((p) => p.id === policyId);
  }

  // Purchase Intents (Durable SQLite)
  public savePurchaseIntent(intent: PurchaseIntent): void {
    const validated = PurchaseIntentSchema.parse(intent);
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO purchase_intents (id, order_id, state, data, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(
      validated.id,
      validated.paypalOrderId || null,
      validated.state,
      JSON.stringify(validated),
      validated.createdAt
    );
  }

  public getPurchaseIntent(id: string): PurchaseIntent | undefined {
    const stmt = db.prepare("SELECT data FROM purchase_intents WHERE id = ?");
    const row = stmt.get(id) as { data: string } | undefined;
    if (!row) return undefined;
    return JSON.parse(row.data) as PurchaseIntent;
  }

  public getPurchaseIntentByOrderId(orderId: string): PurchaseIntent | undefined {
    const stmt = db.prepare("SELECT data FROM purchase_intents WHERE order_id = ?");
    const row = stmt.get(orderId) as { data: string } | undefined;
    if (!row) return undefined;
    return JSON.parse(row.data) as PurchaseIntent;
  }

  // Receipts (Durable SQLite)
  public saveReceipt(
    receipt: RightsReceipt,
    provenance: "LIVE_SANDBOX" | "FIXTURE" | "SIMULATED" = "FIXTURE"
  ): void {
    const validated = RightsReceiptSchema.parse(receipt);
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO receipts (receipt_id, order_id, capture_id, canonical_hash, data, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      validated.receiptId,
      validated.paypalOrderId,
      validated.paypalCaptureId,
      validated.canonicalSha256,
      JSON.stringify(validated),
      validated.issuedAt
    );

    // Also append an entry to the creator ledger
    const ledgerEntry: LedgerEntry = {
      id: `ledg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: receipt.issuedAt,
      assetId: receipt.assetId,
      assetTitle: receipt.assetTitle,
      licenseTier: receipt.licenseName,
      amountUsd: receipt.pricePaidCents / 100,
      channel: receipt.grantedChannels.join(", "),
      territory: receipt.grantedTerritories.join(", "),
      agentPrompt: `Licensed via PayPal Order ${receipt.paypalOrderId}`,
      paypalCaptureId: receipt.paypalCaptureId,
      receiptHash: receipt.canonicalSha256,
      provenance,
      status: "ACTIVE",
    };

    const ledgerStmt = db.prepare("INSERT INTO ledger (id, data, timestamp) VALUES (?, ?, ?)");
    ledgerStmt.run(ledgerEntry.id, JSON.stringify(ledgerEntry), ledgerEntry.timestamp);
  }

  public getReceiptById(receiptId: string): RightsReceipt | undefined {
    const stmt = db.prepare("SELECT data FROM receipts WHERE receipt_id = ?");
    const row = stmt.get(receiptId) as { data: string } | undefined;
    if (!row) return undefined;
    return JSON.parse(row.data) as RightsReceipt;
  }

  public getReceiptByOrderId(orderId: string): RightsReceipt | undefined {
    const stmt = db.prepare("SELECT data FROM receipts WHERE order_id = ?");
    const row = stmt.get(orderId) as { data: string } | undefined;
    if (!row) return undefined;
    return JSON.parse(row.data) as RightsReceipt;
  }

  // Webhooks Deduplication & Record
  public recordWebhookEvent(eventId: string, eventType: string, payload: unknown): boolean {
    const check = db.prepare("SELECT event_id FROM webhook_events WHERE event_id = ?").get(eventId);
    if (check) {
      return false; // Already processed!
    }
    const insert = db.prepare("INSERT INTO webhook_events (event_id, event_type, data, processed_at) VALUES (?, ?, ?, ?)");
    insert.run(eventId, eventType, JSON.stringify(payload), new Date().toISOString());
    return true;
  }

  // Idempotency Keys
  public getIdempotency(key: string): unknown | undefined {
    const row = db.prepare("SELECT response FROM idempotency WHERE idempotency_key = ?").get(key) as { response: string } | undefined;
    if (!row) return undefined;
    return JSON.parse(row.response);
  }

  public saveIdempotency(key: string, response: unknown): void {
    const insert = db.prepare("INSERT OR REPLACE INTO idempotency (idempotency_key, response, created_at) VALUES (?, ?, ?)");
    insert.run(key, JSON.stringify(response), new Date().toISOString());
  }

  // Creator Control Room Ledger
  public getLedger(): LedgerEntry[] {
    const rows = db.prepare("SELECT data FROM ledger ORDER BY timestamp DESC").all() as { data: string }[];
    return rows.map((r) => {
      const parsed = JSON.parse(r.data);
      return LedgerEntrySchema.parse(parsed);
    });
  }
}

// Global singleton instance
const globalForStore = globalThis as unknown as {
  ownTermsStore: StoreRepository | undefined;
};

export const store = globalForStore.ownTermsStore ?? new StoreRepository();

if (process.env.NODE_ENV !== "production") {
  globalForStore.ownTermsStore = store;
}
