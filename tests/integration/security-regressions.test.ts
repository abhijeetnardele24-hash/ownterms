import { describe, it, expect } from "vitest";
import { POST as createCheckout } from "@/app/api/checkout/create/route";
import { POST as captureCheckout } from "@/app/api/checkout/[orderId]/capture/route";
import { POST as handleWebhook } from "@/app/api/paypal/webhook/route";
import { NextRequest } from "next/server";
import { verifyRightsReceipt } from "@/lib/receipts/canonical-receipt";

describe("Security & Adversarial Regression Test Suite", () => {
  const assetId = "asset_night_market_01";

  // Regression 1: Incompatible use attempts checkout directly through API
  it("rejects direct checkout when commercial ads are requested on Editorial tier", async () => {
    const req = new NextRequest("http://localhost:3000/api/checkout/create", {
      method: "POST",
      body: JSON.stringify({
        assetId,
        tierId: "tier_nm_editorial",
        intent: {
          rawRequest: "Direct commercial ad campaign",
          channels: ["instagram_ad"],
          durationDays: 30,
          territories: ["IN"],
          commercialUse: true, // Prohibited on Editorial!
          prohibitAiTraining: true,
          budgetLimitCents: 5000,
          evidenceQuotes: {},
          parsedWithFallback: true,
        },
      }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await createCheckout(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Incompatible license request");
    expect(data.violations.some((v: string) => v.toLowerCase().includes("commercial"))).toBe(true);
  });

  // Regression 2: Client price tampering is completely ignored
  it("ignores client-supplied price and enforces server-held policy price", async () => {
    const req = new NextRequest("http://localhost:3000/api/checkout/create", {
      method: "POST",
      body: JSON.stringify({
        assetId,
        tierId: "tier_nm_commercial",
        priceCents: 1, // Attacker attempts to pay 1 cent ($0.01) instead of 6900 cents ($69.00)
        pricePaid: 0.01,
      }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await createCheckout(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.priceCents).toBe(6900); // Strictly $69.00 from server policy!
    expect(data.priceCents).not.toBe(1);
  });

  // Regression 3: Capture without valid purchaseIntentId fails closed
  it("rejects capture requests with invalid or missing purchaseIntentId", async () => {
    const fakeOrderId = "ORD_FAKE_99999";
    const req = new NextRequest(`http://localhost:3000/api/checkout/${fakeOrderId}/capture`, {
      method: "POST",
      body: JSON.stringify({
        purchaseIntentId: "pi_non_existent",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await captureCheckout(req, {
      params: Promise.resolve({ orderId: fakeOrderId }),
    });
    expect(res.status).toBe(404);
  });

  // Regression 4: Idempotent capture (calling capture twice returns same receipt without duplicate ledger)
  it("enforces idempotent capture and prevents double receipt issuance", async () => {
    // Step 1: Create
    const createReq = new NextRequest("http://localhost:3000/api/checkout/create", {
      method: "POST",
      body: JSON.stringify({
        assetId,
        tierId: "tier_nm_commercial",
      }),
      headers: { "Content-Type": "application/json" },
    });
    const createRes = await createCheckout(createReq);
    const createData = await createRes.json();
    const orderId = createData.orderId;
    const purchaseIntentId = createData.purchaseIntentId;

    // Step 2: First Capture
    const captureReq1 = new NextRequest(`http://localhost:3000/api/checkout/${orderId}/capture`, {
      method: "POST",
      body: JSON.stringify({ purchaseIntentId }),
      headers: { "Content-Type": "application/json" },
    });
    const captureRes1 = await captureCheckout(captureReq1, {
      params: Promise.resolve({ orderId }),
    });
    const data1 = await captureRes1.json();
    expect(data1.success).toBe(true);
    expect(data1.receipt).toBeDefined();

    // Step 3: Second Capture (Duplicate Replay)
    const captureReq2 = new NextRequest(`http://localhost:3000/api/checkout/${orderId}/capture`, {
      method: "POST",
      body: JSON.stringify({ purchaseIntentId }),
      headers: { "Content-Type": "application/json" },
    });
    const captureRes2 = await captureCheckout(captureReq2, {
      params: Promise.resolve({ orderId }),
    });
    const data2 = await captureRes2.json();
    expect(data2.success).toBe(true);
    expect(data2.idempotent).toBe(true);
    expect(data2.receipt.receiptId).toBe(data1.receipt.receiptId);
    expect(data2.receipt.canonicalSha256).toBe(data1.receipt.canonicalSha256);
  });

  // Regression 5: Fixture transaction is labeled FIXTURE, never LIVE_SANDBOX
  it("strictly labels fixture transactions with provenance FIXTURE", async () => {
    const createReq = new NextRequest("http://localhost:3000/api/checkout/create", {
      method: "POST",
      body: JSON.stringify({ assetId, tierId: "tier_nm_commercial" }),
      headers: { "Content-Type": "application/json" },
    });
    const createRes = await createCheckout(createReq);
    const createData = await createRes.json();
    expect(createData.provenance).toBe("FIXTURE");
    expect(createData.orderId).toContain("ORD_FIXTURE_");
  });

  // Regression 6: Webhook signature verification fails without valid transmission headers
  it("rejects webhook calls missing PayPal transmission headers with 400", async () => {
    const req = new NextRequest("http://localhost:3000/api/paypal/webhook", {
      method: "POST",
      body: JSON.stringify({ event_type: "CHECKOUT.ORDER.APPROVED" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await handleWebhook(req);
    expect(res.status).toBe(400);
  });

  // Regression 7: Webhook event deduplication
  it("deduplicates identical webhook event IDs", async () => {
    const eventId = `WH_EVT_${Date.now()}`;
    const payload = {
      id: eventId,
      event_type: "PAYMENT.CAPTURE.COMPLETED",
      resource: { id: "CAP_123" },
    };

    const headers = {
      "Content-Type": "application/json",
      "paypal-transmission-id": `trans_${Date.now()}`,
      "paypal-transmission-time": new Date().toISOString(),
      "paypal-transmission-sig": "test_sig_fixture",
      "paypal-cert-url": "https://api.sandbox.paypal.com/v1/certs",
      "paypal-auth-algo": "SHA256withRSA",
    };

    // First delivery
    const req1 = new NextRequest("http://localhost:3000/api/paypal/webhook", {
      method: "POST",
      body: JSON.stringify(payload),
      headers,
    });
    const res1 = await handleWebhook(req1);
    const data1 = await res1.json();
    expect(res1.status).toBe(200);
    expect(data1.processed).toBe(true);

    // Second delivery (duplicate replay)
    const req2 = new NextRequest("http://localhost:3000/api/paypal/webhook", {
      method: "POST",
      body: JSON.stringify(payload),
      headers,
    });
    const res2 = await handleWebhook(req2);
    const data2 = await res2.json();
    expect(res2.status).toBe(200);
    expect(data2.status).toBe("duplicate_ignored");
  });

  // Regression 8: Anti-tamper verification detects any modified field
  it("invalidates receipt verification when any field is altered", async () => {
    const createReq = new NextRequest("http://localhost:3000/api/checkout/create", {
      method: "POST",
      body: JSON.stringify({ assetId, tierId: "tier_nm_commercial" }),
      headers: { "Content-Type": "application/json" },
    });
    const createRes = await createCheckout(createReq);
    const { orderId, purchaseIntentId } = await createRes.json();

    const captureReq = new NextRequest(`http://localhost:3000/api/checkout/${orderId}/capture`, {
      method: "POST",
      body: JSON.stringify({ purchaseIntentId }),
      headers: { "Content-Type": "application/json" },
    });
    const captureRes = await captureCheckout(captureReq, { params: Promise.resolve({ orderId }) });
    const { receipt } = await captureRes.json();

    // Verify original is valid
    const origCheck = verifyRightsReceipt(receipt);
    expect(origCheck.valid).toBe(true);

    // Tamper 1: Price
    const tamperedPrice = { ...receipt, pricePaidCents: 0 };
    expect(verifyRightsReceipt(tamperedPrice).valid).toBe(false);

    // Tamper 2: Channels
    const tamperedChannels = { ...receipt, grantedChannels: ["broadcast_tv", "print"] };
    expect(verifyRightsReceipt(tamperedChannels).valid).toBe(false);

    // Tamper 3: AI training
    const tamperedAi = { ...receipt, aiTrainingAllowed: true };
    expect(verifyRightsReceipt(tamperedAi).valid).toBe(false);
  });
});
