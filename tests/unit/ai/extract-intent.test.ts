import { describe, it, expect } from "vitest";
import { extractIntendedUse, extractWithFallbackHeuristics } from "@/lib/ai/extract-intent";

describe("extractIntendedUse - AI Intent Quarantine Layer (Deterministic)", () => {
  const canonicalPrompt =
    "Use this night-market photograph in a paid Instagram campaign for 30 days in India and Singapore. Budget up to $80. Do not allow AI training.";

  it("extracts factual parameters accurately using fallback heuristics", () => {
    const facts = extractWithFallbackHeuristics(canonicalPrompt);

    expect(facts.channels).toContain("instagram_ad");
    expect(facts.durationDays).toBe(30);
    expect(facts.territories).toEqual(["IN", "SG"]);
    expect(facts.commercialUse).toBe(true);
    expect(facts.prohibitAiTraining).toBe(true);
    expect(facts.budgetLimitCents).toBe(8000); // $80.00 = 8000 cents
  });

  it("handles non-commercial editorial blog requests", () => {
    const editorialPrompt =
      "I want to include this photo in an educational non-profit blog post for 90 days. Budget $25.";
    const facts = extractWithFallbackHeuristics(editorialPrompt);

    expect(facts.channels).toContain("blog");
    expect(facts.durationDays).toBe(90);
    expect(facts.commercialUse).toBe(false);
    expect(facts.budgetLimitCents).toBe(2500);
  });

  it("extracts intended use through extractIntendedUse deterministically", async () => {
    const facts = await extractIntendedUse(canonicalPrompt, { forceFallback: true });
    expect(facts.rawRequest).toBe(canonicalPrompt);
    expect(facts.durationDays).toBe(30);
    expect(facts.budgetLimitCents).toBe(8000);
    expect(facts.commercialUse).toBe(true);
  });
});
