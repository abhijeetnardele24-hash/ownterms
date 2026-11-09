import { describe, it, expect } from "vitest";
import { POST as createCheckout } from "@/app/api/checkout/create/route";
import { POST as captureCheckout } from "@/app/api/checkout/[orderId]/capture/route";
import { GET as getReceipt } from "@/app/api/receipt/[receiptId]/route";
import { GET as getLedger } from "@/app/api/control-room/ledger/route";
import { NextRequest } from "next/server";
import { LedgerEntry } from "@/lib/types/domain";

describe("Checkout & Settlement Flow - Integration Test", () => {
  const assetId = "asset_night_market_01";
  const tierId = "tier_nm_commercial";

  it("completes full order creation, capture, receipt minting, and ledger update", async () => {
    // 1. Create order
    const createReq = new NextRequest("http://localhost:3000/api/checkout/create", {
      method: "POST",
      body: JSON.stringify({ assetId, tierId }),
      headers: { "Content-Type": "application/json" },
    });

    const createRes = await createCheckout(createReq);
    expect(createRes.status).toBe(200);
    const createData = await createRes.json();
    expect(createData.success).toBe(true);
    expect(createData.orderId).toBeDefined();
    expect(createData.priceCents).toBe(6900);

    const orderId = createData.orderId;
    const purchaseIntentId = createData.purchaseIntentId;

    // 2. Capture order with frozen purchaseIntentId
    const captureReq = new NextRequest(
      `http://localhost:3000/api/checkout/${orderId}/capture`,
      {
        method: "POST",
        body: JSON.stringify({
          purchaseIntentId,
        }),
        headers: { "Content-Type": "application/json" },
      }
    );

    const captureRes = await captureCheckout(captureReq, {
      params: Promise.resolve({ orderId }),
    });
    expect(captureRes.status).toBe(200);
    const captureData = await captureRes.json();
    expect(captureData.success).toBe(true);
    expect(captureData.receipt).toBeDefined();
    expect(captureData.receipt.canonicalSha256).toHaveLength(64);
    expect(captureData.receipt.pricePaidCents).toBe(6900);

    const receiptId = captureData.receipt.receiptId;

    // 3. Fetch & verify receipt via GET route
    const receiptReq = new NextRequest(`http://localhost:3000/api/receipt/${receiptId}`);
    const receiptRes = await getReceipt(receiptReq, {
      params: Promise.resolve({ receiptId }),
    });
    expect(receiptRes.status).toBe(200);
    const receiptData = await receiptRes.json();
    expect(receiptData.verification.valid).toBe(true);
    expect(receiptData.verification.computedHash).toBe(captureData.receipt.canonicalSha256);

    // 4. Verify ledger update
    const ledgerRes = await getLedger();
    const ledgerData = await ledgerRes.json();
    expect(ledgerData.success).toBe(true);
    expect(ledgerData.ledger.some((l: LedgerEntry) => l.receiptHash === captureData.receipt.canonicalSha256)).toBe(true);
  });
});

