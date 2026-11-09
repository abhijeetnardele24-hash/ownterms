import { describe, it, expect } from "vitest";
import { evaluateLicense } from "@/lib/policy/evaluate-license";
import { CANONICAL_POLICIES } from "@/lib/data/seeds";
import { IntendedUseFact } from "@/lib/types/domain";

describe("evaluateLicense - Deterministic Rights Compatibility", () => {
  const policies = CANONICAL_POLICIES["asset_night_market_01"];
  const editorial = policies.find((p) => p.tier === "editorial")!;
  const commercialSocial = policies.find((p) => p.tier === "commercial_social")!;
  const extended = policies.find((p) => p.tier === "extended_campaign")!;

  it("rejects Editorial tier when commercial advertising is requested", () => {
    const commercialRequest: IntendedUseFact = {
      rawRequest: "Instagram ad campaign 30 days in India",
      channels: ["instagram_ad"],
      durationDays: 30,
      territories: ["IN"],
      commercialUse: true,
      prohibitAiTraining: true,
      budgetLimitCents: 8000, // $80
      evidenceQuotes: {},
      parsedWithFallback: false,
    };

    const result = evaluateLicense(editorial, commercialRequest);
    expect(result.compatible).toBe(false);
    expect(result.status).toBe("incompatible");
    expect(result.violations.some((v) => v.toLowerCase().includes("commercial"))).toBe(true);
  });

  it("approves Commercial Social tier for the canonical hackathon request", () => {
    const canonicalRequest: IntendedUseFact = {
      rawRequest: "Use this night-market photograph in a paid Instagram campaign for 30 days in India and Singapore. Budget up to $80. Do not allow AI training.",
      channels: ["instagram_ad"],
      durationDays: 30,
      territories: ["IN", "SG"],
      commercialUse: true,
      prohibitAiTraining: true,
      budgetLimitCents: 8000, // $80.00
      evidenceQuotes: {},
      parsedWithFallback: false,
    };

    const result = evaluateLicense(commercialSocial, canonicalRequest);
    expect(result.compatible).toBe(true);
    expect(result.status).toBe("compatible");
    expect(result.violations).toHaveLength(0);
    expect(result.reasons.length).toBeGreaterThan(0);
  });

  it("marks Extended Campaign as over_budget when user budget is $80", () => {
    const canonicalRequest: IntendedUseFact = {
      rawRequest: "Instagram ad campaign 30 days in India and Singapore, budget $80",
      channels: ["instagram_ad"],
      durationDays: 30,
      territories: ["IN", "SG"],
      commercialUse: true,
      prohibitAiTraining: true,
      budgetLimitCents: 8000, // $80.00 max, but Extended is $149.00 (14900 cents)
      evidenceQuotes: {},
      parsedWithFallback: false,
    };

    const result = evaluateLicense(extended, canonicalRequest);
    expect(result.compatible).toBe(false);
    expect(result.status).toBe("over_budget");
    expect(result.violations.some((v) => v.toLowerCase().includes("budget"))).toBe(true);
  });

  it("rejects policy when requested duration exceeds maximum allowed days", () => {
    const longDurationRequest: IntendedUseFact = {
      rawRequest: "Instagram ad campaign for 90 days",
      channels: ["instagram_ad"],
      durationDays: 90, // Commercial Social max is 60 days
      territories: ["IN"],
      commercialUse: true,
      prohibitAiTraining: true,
      budgetLimitCents: 10000,
      evidenceQuotes: {},
      parsedWithFallback: false,
    };

    const result = evaluateLicense(commercialSocial, longDurationRequest);
    expect(result.compatible).toBe(false);
    expect(result.status).toBe("incompatible");
    expect(result.violations.some((v) => v.includes("duration"))).toBe(true);
  });

  it("rejects policy when AI model training is requested on non-training policy", () => {
    const aiTrainingRequest: IntendedUseFact = {
      rawRequest: "Train a text-to-image LoRA on this photograph",
      channels: ["model_weights"],
      durationDays: 365,
      territories: ["US"],
      commercialUse: true,
      prohibitAiTraining: false, // Wants AI training!
      budgetLimitCents: 50000,
      evidenceQuotes: {},
      parsedWithFallback: false,
    };

    const result = evaluateLicense(commercialSocial, aiTrainingRequest);
    expect(result.compatible).toBe(false);
    expect(result.status).toBe("incompatible");
    expect(result.violations.some((v) => v.toLowerCase().includes("training"))).toBe(true);
  });

  it("rejects when requested territory count exceeds maximum allowed territories", () => {
    const multiCountryRequest: IntendedUseFact = {
      rawRequest: "Global campaign across 10 countries",
      channels: ["instagram_ad"],
      durationDays: 30,
      territories: ["IN", "SG", "US", "UK", "JP", "DE", "FR", "AU", "BR", "CA"], // 10 territories > 5
      commercialUse: true,
      prohibitAiTraining: true,
      budgetLimitCents: 10000,
      evidenceQuotes: {},
      parsedWithFallback: false,
    };

    const result = evaluateLicense(commercialSocial, multiCountryRequest);
    expect(result.compatible).toBe(false);
    expect(result.status).toBe("incompatible");
    expect(result.violations.some((v) => v.toLowerCase().includes("territories"))).toBe(true);
  });
});

