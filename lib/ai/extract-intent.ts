import { IntendedUseFact, IntendedUseFactSchema } from "@/lib/types/domain";

const SYSTEM_PROMPT = `You are the Intent Extraction Quarantine Layer for OwnTerms.
Your SOLE duty is to extract factual intended-use parameters from natural language license requests.

CRITICAL SECURITY AND ARCHITECTURAL RULES:
1. You are strictly forbidden from deciding whether a license should be granted.
2. You are strictly forbidden from calculating or altering license pricing or granting discounts.
3. You must extract only factual parameters with exact verbatim quotation evidence.
4. Output valid JSON strictly conforming to this schema:
{
  "channels": ["instagram_ad" | "tiktok_ad" | "youtube_ad" | "social_organic" | "web_landing" | "blog" | "digital_billboard" | "broadcast_tv" | "print"],
  "durationDays": <integer, default 30 if unspecified>,
  "territories": [<ISO country code uppercase like "IN", "SG", "US", "GB" or "*" for global>],
  "commercialUse": <boolean, true if paid ads, sales, monetization, or commercial promotion>,
  "prohibitAiTraining": <boolean, true unless the user explicitly requested AI model training permissions>,
  "budgetLimitCents": <integer minor cents, e.g. $80 is 8000, or null if unspecified>,
  "evidenceQuotes": {
    "channels": "<exact verbatim quote from prompt>",
    "duration": "<exact verbatim quote from prompt>",
    "territories": "<exact verbatim quote from prompt>",
    "budget": "<exact verbatim quote from prompt>",
    "aiPolicy": "<exact verbatim quote from prompt>"
  }
}`;

export async function extractIntendedUse(
  rawPrompt: string,
  options: { forceFallback?: boolean; timeoutMs?: number } = {}
): Promise<IntendedUseFact> {
  const apiKey = process.env.GEMINI_API_KEY;
  const useFixture =
    options.forceFallback ||
    process.env.USE_FIXTURE_AI === "true" ||
    !apiKey ||
    apiKey === "your_gemini_api_key_here";

  if (useFixture) {
    return extractWithFallbackHeuristics(rawPrompt);
  }

  try {
    const model = process.env.AI_EXTRACTION_MODEL || "gemini-2.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const timeoutMs = options.timeoutMs ?? 10000;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(timeoutMs),
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: `Extract license request parameters for:\n"${rawPrompt}"` }],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      }),
    });

    if (!response.ok) {
      console.warn(`Gemini API returned status ${response.status}, falling back to heuristics`);
      return extractWithFallbackHeuristics(rawPrompt);
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      return extractWithFallbackHeuristics(rawPrompt);
    }

    const parsedJson = JSON.parse(candidateText);

    // Validate and build full IntendedUseFact
    const structured: IntendedUseFact = {
      rawRequest: rawPrompt,
      channels:
        Array.isArray(parsedJson.channels) && parsedJson.channels.length > 0
          ? parsedJson.channels
          : ["social_organic"],
      durationDays:
        typeof parsedJson.durationDays === "number" && parsedJson.durationDays > 0
          ? Math.round(parsedJson.durationDays)
          : 30,
      territories:
        Array.isArray(parsedJson.territories) && parsedJson.territories.length > 0
          ? parsedJson.territories
          : ["*"],
      commercialUse: Boolean(parsedJson.commercialUse),
      prohibitAiTraining:
        parsedJson.prohibitAiTraining !== undefined
          ? Boolean(parsedJson.prohibitAiTraining)
          : true,
      budgetLimitCents:
        typeof parsedJson.budgetLimitCents === "number"
          ? Math.round(parsedJson.budgetLimitCents)
          : null,
      evidenceQuotes: parsedJson.evidenceQuotes || {},
      parsedWithFallback: false,
    };

    return IntendedUseFactSchema.parse(structured);
  } catch (error) {
    console.warn("Intent extraction network/parse error, using fallback:", error);
    return extractWithFallbackHeuristics(rawPrompt);
  }
}

/**
 * Deterministic heuristic extraction for offline runs, zero-network tests, or API failover
 */
export function extractWithFallbackHeuristics(rawPrompt: string): IntendedUseFact {
  const pLower = rawPrompt.toLowerCase();

  // 1. Channels
  const channels: string[] = [];
  let channelQuote = "";
  if (pLower.includes("instagram")) {
    channels.push(pLower.includes("ad") || pLower.includes("campaign") ? "instagram_ad" : "social_organic");
    channelQuote = "Instagram";
  }
  if (pLower.includes("tiktok")) {
    channels.push("tiktok_ad");
    channelQuote = channelQuote ? `${channelQuote}, TikTok` : "TikTok";
  }
  if (pLower.includes("youtube")) {
    channels.push("youtube_ad");
  }
  if (pLower.includes("blog") || pLower.includes("article") || pLower.includes("editorial")) {
    channels.push("blog");
  }
  if (channels.length === 0) {
    channels.push("social_organic");
  }

  // 2. Duration
  let durationDays = 30;
  let durationQuote = "";
  const durationMatch = rawPrompt.match(/(\d+)\s*(day|days|month|months|year|years)/i);
  if (durationMatch) {
    const num = parseInt(durationMatch[1], 10);
    const unit = durationMatch[2].toLowerCase();
    durationQuote = durationMatch[0];
    if (unit.startsWith("month")) durationDays = num * 30;
    else if (unit.startsWith("year")) durationDays = num * 365;
    else durationDays = num;
  }

  // 3. Territories
  const territories: string[] = [];
  const territoryQuotes: string[] = [];
  if (pLower.includes("india")) {
    territories.push("IN");
    territoryQuotes.push("India");
  }
  if (pLower.includes("singapore")) {
    territories.push("SG");
    territoryQuotes.push("Singapore");
  }
  if (/\b(us|usa|united states|america)\b/i.test(rawPrompt)) {
    territories.push("US");
    territoryQuotes.push("US");
  }
  if (/\b(uk|united kingdom|britain|gb)\b/i.test(rawPrompt)) {
    territories.push("GB");
    territoryQuotes.push("UK");
  }
  if (pLower.includes("global") || pLower.includes("worldwide")) {
    territories.push("*");
    territoryQuotes.push("global");
  }
  if (territories.length === 0) {
    territories.push("*");
  }

  // 4. Commercial Use
  const isCommercial =
    pLower.includes("paid") ||
    pLower.includes("ad") ||
    pLower.includes("campaign") ||
    pLower.includes("commercial") ||
    pLower.includes("sponsored") ||
    pLower.includes("monetiz");

  // 5. AI Training Prohibition
  const hasNegativeAi =
    pLower.includes("do not allow ai") ||
    pLower.includes("no ai training") ||
    pLower.includes("prohibit ai") ||
    pLower.includes("without ai training") ||
    pLower.includes("not allow ai training");

  const hasPositiveAi =
    !hasNegativeAi &&
    (pLower.includes("allow ai training") ||
      pLower.includes("permit ai training") ||
      pLower.includes("fine-tune") ||
      pLower.includes("train a model") ||
      pLower.includes("model training"));

  const prohibitAiTraining = !hasPositiveAi;

  // 6. Budget
  let budgetLimitCents: number | null = null;
  let budgetQuote = "";
  const budgetMatch = rawPrompt.match(/(?:\$|usd\s*)(\d+(?:\.\d{2})?)/i) ||
                      rawPrompt.match(/budget\s*(?:up\s*to\s*)?(?:\$|usd\s*)?(\d+)/i);
  if (budgetMatch) {
    budgetLimitCents = Math.round(parseFloat(budgetMatch[1]) * 100);
    budgetQuote = budgetMatch[0];
  }

  return {
    rawRequest: rawPrompt,
    channels,
    durationDays,
    territories,
    commercialUse: isCommercial,
    prohibitAiTraining,
    budgetLimitCents,
    evidenceQuotes: {
      channels: channelQuote || undefined,
      duration: durationQuote || undefined,
      territories: territoryQuotes.join(", ") || undefined,
      budget: budgetQuote || undefined,
      aiPolicy: prohibitAiTraining ? "Do not allow AI training" : undefined,
    },
    parsedWithFallback: true,
  };
}
