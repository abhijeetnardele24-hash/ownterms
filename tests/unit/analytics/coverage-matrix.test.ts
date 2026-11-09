import { describe, it, expect } from "vitest";
import {
  buildRightsCoverageMatrix,
  normalizeChannels,
  normalizeTerritories,
} from "@/lib/analytics/coverage-matrix";
import { LedgerEntry } from "@/lib/types/domain";

describe("coverage-matrix - Analytics Isolation & Strict Matching", () => {
  it("normalizes channels without cross-matching unintended channels", () => {
    const channels = normalizeChannels("instagram_ad");
    expect(channels).toEqual(["Instagram Ads"]);
    expect(channels).not.toContain("TikTok Ads");
    expect(channels).not.toContain("Global Campaign");
  });

  it("normalizes territories without cross-matching unintended countries", () => {
    const { territories, isGlobal } = normalizeTerritories("IN, SG");
    expect(territories).toEqual(["India (IN)", "Singapore (SG)"]);
    expect(territories).not.toContain("United States (US)");
    expect(isGlobal).toBe(false);
  });

  it("treats explicit global territories as Global (*)", () => {
    const { territories, isGlobal } = normalizeTerritories("*");
    expect(territories).toEqual(["Global (*)"]);
    expect(isGlobal).toBe(true);
  });

  it("populates only the exact cells corresponding to granted license terms", () => {
    const mockEntries: LedgerEntry[] = [
      {
        id: "ledg_001",
        timestamp: "2026-11-09T02:00:00.000Z",
        assetId: "asset_night_market_01",
        assetTitle: "Night Market Signals",
        licenseTier: "Commercial Social",
        amountUsd: 69,
        channel: "instagram_ad",
        territory: "IN, SG",
        agentPrompt: "Instagram ad in India & SG",
        paypalCaptureId: "CAP_001",
        receiptHash: "a".repeat(64),
        provenance: "FIXTURE",
        status: "ACTIVE",
      },
    ];

    const matrix = buildRightsCoverageMatrix(mockEntries);

    // Active cells
    expect(matrix["Instagram Ads"]["India (IN)"]).toBe(1);
    expect(matrix["Instagram Ads"]["Singapore (SG)"]).toBe(1);

    // Completely inactive cells
    expect(matrix["Instagram Ads"]["United States (US)"]).toBe(0);
    expect(matrix["Instagram Ads"]["United Kingdom (GB)"]).toBe(0);
    expect(matrix["Instagram Ads"]["Global (*)"]).toBe(0);
    expect(matrix["TikTok Ads"]["India (IN)"]).toBe(0);
    expect(matrix["YouTube Ads"]["India (IN)"]).toBe(0);
    expect(matrix["Web Embed"]["India (IN)"]).toBe(0);
  });
});
