import fs from "node:fs";
import path from "node:path";
import {
  Asset,
  LicensePolicy,
  RightsReceipt,
  LedgerEntry,
} from "@/lib/types/domain";
import {
  CANONICAL_ASSETS,
  CANONICAL_POLICIES,
  INITIAL_LEDGER_ENTRIES,
} from "@/lib/data/seeds";

export interface StoreData {
  assets: Asset[];
  policies: Record<string, LicensePolicy[]>;
  receipts: Record<string, RightsReceipt>;
  ledger: LedgerEntry[];
}

class StoreRepository {
  private data: StoreData;
  private filePath: string;

  constructor() {
    this.filePath = path.join(process.cwd(), "data", "store.json");
    this.data = this.loadInitialData();
  }

  private loadInitialData(): StoreData {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, "utf-8");
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn("Could not load stored data, initializing from seeds:", e);
    }
    return {
      assets: [...CANONICAL_ASSETS],
      policies: { ...CANONICAL_POLICIES },
      receipts: {},
      ledger: [...INITIAL_LEDGER_ENTRIES],
    };
  }

  public save(): void {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (e) {
      console.warn("Failed to persist store.json to disk:", e);
    }
  }

  public resetToSeeds(): void {
    this.data = {
      assets: [...CANONICAL_ASSETS],
      policies: { ...CANONICAL_POLICIES },
      receipts: {},
      ledger: [...INITIAL_LEDGER_ENTRIES],
    };
    this.save();
  }

  // Assets
  public getAssets(): Asset[] {
    return this.data.assets;
  }

  public getAssetById(id: string): Asset | undefined {
    return this.data.assets.find((a) => a.id === id);
  }

  // Policies
  public getPoliciesForAsset(assetId: string): LicensePolicy[] {
    return this.data.policies[assetId] || [];
  }

  public getPolicyById(assetId: string, policyId: string): LicensePolicy | undefined {
    const policies = this.getPoliciesForAsset(assetId);
    return policies.find((p) => p.id === policyId);
  }

  // Receipts
  public saveReceipt(receipt: RightsReceipt): void {
    this.data.receipts[receipt.receiptId] = receipt;
    // Also append an entry to the creator ledger
    const ledgerEntry: LedgerEntry = {
      id: `ledg_${Date.now()}`,
      timestamp: receipt.issuedAt,
      assetId: receipt.assetId,
      assetTitle: receipt.assetTitle,
      licenseTier: receipt.licenseName,
      amountUsd: receipt.pricePaidCents / 100,
      channel: receipt.grantedChannels.join(", "),
      territory: receipt.grantedTerritories.join(", "),
      agentPrompt: `Licensed via PayPal Sandbox Order ${receipt.paypalOrderId}`,
      paypalCaptureId: receipt.paypalCaptureId,
      receiptHash: receipt.canonicalSha256,
      status: "ACTIVE",
    };
    this.data.ledger.unshift(ledgerEntry);
    this.save();
  }

  public getReceiptById(receiptId: string): RightsReceipt | undefined {
    return this.data.receipts[receiptId];
  }

  public getAllReceipts(): RightsReceipt[] {
    return Object.values(this.data.receipts);
  }

  // Ledger & Control Room
  public getLedger(): LedgerEntry[] {
    return this.data.ledger;
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
