import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
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

describe("extractIntendedUse - Provider API Handling & Fail-Closed Fallback", () => {
  const canonicalPrompt =
    "Use this night-market photograph in a paid Instagram campaign for 30 days in India and Singapore. Budget up to $80. Do not allow AI training.";

  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.GEMINI_API_KEY = "dummy_valid_test_key";
    process.env.USE_FIXTURE_AI = "false";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it("handles successful live model JSON response with parsedWithFallback: false", async () => {
    const mockGeminiResponse = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: JSON.stringify({
                  channels: ["instagram_ad"],
                  durationDays: 30,
                  territories: ["IN", "SG"],
                  commercialUse: true,
                  prohibitAiTraining: true,
                  budgetLimitCents: 8000,
                  evidenceQuotes: {
                    channels: "paid Instagram campaign",
                    duration: "30 days",
                    territories: "India and Singapore",
                    budget: "$80",
                    aiPolicy: "Do not allow AI training",
                  },
                }),
              },
            ],
          },
        },
      ],
    };

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockGeminiResponse,
    } as Response);

    const facts = await extractIntendedUse(canonicalPrompt);
    expect(facts.parsedWithFallback).toBe(false);
    expect(facts.channels).toEqual(["instagram_ad"]);
    expect(facts.durationDays).toBe(30);
    expect(facts.territories).toEqual(["IN", "SG"]);
    expect(facts.budgetLimitCents).toBe(8000);
  });

  it("handles HTTP 429 rate limiting with graceful fallback and parsedWithFallback: true", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 429,
      statusText: "Too Many Requests",
      json: async () => ({ error: { message: "Rate limit exceeded" } }),
    } as Response);

    const facts = await extractIntendedUse(canonicalPrompt);
    expect(facts.parsedWithFallback).toBe(true);
    expect(facts.channels).toContain("instagram_ad");
    expect(facts.budgetLimitCents).toBe(8000);
  });

  it("handles malformed JSON model output with graceful fallback and parsedWithFallback: true", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [{ text: "THIS_IS_NOT_VALID_JSON" }],
            },
          },
        ],
      }),
    } as Response);

    const facts = await extractIntendedUse(canonicalPrompt);
    expect(facts.parsedWithFallback).toBe(true);
    expect(facts.durationDays).toBe(30);
  });

  it("handles provider timeout / abort error with graceful fallback and parsedWithFallback: true", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(
      new DOMException("The operation was aborted due to timeout", "TimeoutError")
    );

    const facts = await extractIntendedUse(canonicalPrompt, { timeoutMs: 50 });
    expect(facts.parsedWithFallback).toBe(true);
    expect(facts.commercialUse).toBe(true);
  });
});
