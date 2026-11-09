import { describe, it, expect } from "vitest";
import {
  canonicalizeJson,
  mintRightsReceipt,
  verifyRightsReceipt,
} from "@/lib/receipts/canonical-receipt";
import { RightsReceiptPayload } from "@/lib/types/domain";

describe("canonical-receipt - Cryptographic Rights Minting & Verification", () => {
  const samplePayload: RightsReceiptPayload = {
    receiptId: "rcpt_test_001",
    assetId: "asset_night_market_01",
    assetTitle: "Night Market Signals",
    creatorName: "Mira Rao",
    creatorHandle: "@mirarao.lens",
    licenseTier: "commercial_social",
    licenseName: "Commercial Social",
    pricePaidCents: 6900,
    currency: "USD",
    grantedChannels: ["instagram_ad"],
    grantedDurationDays: 30,
    grantedTerritories: ["IN", "SG"],
    commercialUse: true,
    aiTrainingAllowed: false,
    derivativeModificationsAllowed: true,
    redistributionAllowed: false,
    paypalOrderId: "ORD_SANDBOX_12345",
    paypalCaptureId: "CAP_SANDBOX_67890",
    payeeEmail: "mira.rao.creator@example.com",
    issuedAt: "2026-11-09T02:00:00.000Z",
    validUntil: "2026-12-09T02:00:00.000Z",
  };

  it("produces identical canonical JSON strings regardless of key declaration order", () => {
    const objA = { z: 1, a: 2, m: { b: 3, a: 4 } };
    const objB = { a: 2, m: { a: 4, b: 3 }, z: 1 };
    expect(canonicalizeJson(objA)).toBe(canonicalizeJson(objB));
    expect(canonicalizeJson(objA)).toBe('{"a":2,"m":{"a":4,"b":3},"z":1}');
  });

  it("mints a valid Rights Receipt with a 64-character SHA-256 hash", () => {
    const receipt = mintRightsReceipt(samplePayload);
    expect(receipt.canonicalSha256).toHaveLength(64);
    expect(receipt.pricePaidCents).toBe(6900);

    const verification = verifyRightsReceipt(receipt);
    expect(verification.valid).toBe(true);
    expect(verification.computedHash).toBe(receipt.canonicalSha256);
  });

  it("detects tampering when license tier is modified", () => {
    const receipt = mintRightsReceipt(samplePayload);
    // Tamper with license tier
    const tampered = { ...receipt, licenseTier: "extended_campaign" };

    const verification = verifyRightsReceipt(tampered);
    expect(verification.valid).toBe(false);
    expect(verification.computedHash).not.toBe(tampered.canonicalSha256);
  });

  it("detects tampering when price is modified", () => {
    const receipt = mintRightsReceipt(samplePayload);
    // Tamper with price: change $69 (6900 cents) to $19 (1900 cents)
    const tampered = { ...receipt, pricePaidCents: 1900 };

    const verification = verifyRightsReceipt(tampered);
    expect(verification.valid).toBe(false);
  });

  it("detects tampering when granted territories are modified", () => {
    const receipt = mintRightsReceipt(samplePayload);
    // Tamper: expand territories from ["IN", "SG"] to ["*"]
    const tampered = { ...receipt, grantedTerritories: ["*"] };

    const verification = verifyRightsReceipt(tampered);
    expect(verification.valid).toBe(false);
  });
});

