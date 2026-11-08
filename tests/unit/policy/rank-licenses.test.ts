import { describe, it, expect } from "vitest";
import { rankLicenses } from "@/lib/policy/rank-licenses";
import { CANONICAL_POLICIES } from "@/lib/data/seeds";
import { IntendedUseFact } from "@/lib/types/domain";

describe("rankLicenses - Policy Ranking & Selection", () => {
  const policies = CANONICAL_POLICIES["asset_night_market_01"];

  it("identifies Commercial Social ($69) as 'recommended' and Editorial as 'incompatible' for the canonical request", () => {
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

    const ranked = rankLicenses(policies, canonicalRequest);
    expect(ranked).toHaveLength(3);

    const recommended = ranked.find((r) => r.status === "recommended");
    expect(recommended).toBeDefined();
    expect(recommended?.policy.id).toBe("tier_nm_commercial");
    expect(recommended?.policy.priceCents).toBe(6900);

    const editorial = ranked.find((r) => r.policy.id === "tier_nm_editorial");
    expect(editorial?.compatible).toBe(false);
    expect(editorial?.status).toBe("incompatible");

    const extended = ranked.find((r) => r.policy.id === "tier_nm_extended");
    expect(extended?.status).toBe("over_budget");
  });

  it("recommends Extended Campaign if user has $200 budget and needs 180 days duration", () => {
    const bigRequest: IntendedUseFact = {
      rawRequest: "Paid global digital campaign for 180 days with $200 budget",
      channels: ["instagram_ad", "digital_billboard"],
      durationDays: 180,
      territories: ["*"],
      commercialUse: true,
      prohibitAiTraining: true,
      budgetLimitCents: 20000, // $200.00
      evidenceQuotes: {},
      parsedWithFallback: false,
    };

    const ranked = rankLicenses(policies, bigRequest);
    const recommended = ranked.find((r) => r.status === "recommended");
    expect(recommended?.policy.id).toBe("tier_nm_extended");
  });
});
