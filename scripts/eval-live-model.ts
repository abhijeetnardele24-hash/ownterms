import { extractIntendedUse } from "../lib/ai/extract-intent";

async function runLiveModelEvaluation(): Promise<void> {
  console.log("================================================================================");
  console.log("🔍 Running Live Gemini Model Intent Extraction Evaluation (LIVE_MODEL)");
  console.log("================================================================================");

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    console.error("❌ Aborting: GEMINI_API_KEY is not configured in environment or .env.local.");
    process.exitCode = 1;
    return;
  }

  const prompt =
    "Use this night-market photograph in a paid Instagram campaign for 30 days in India and Singapore. Budget up to $80. Do not allow AI training.";

  console.log(`Input Prompt: "${prompt}"`);
  console.log("Calling Google Gemini live endpoint...");

  const startTime = Date.now();
  try {
    const result = await extractIntendedUse(prompt, { forceFallback: false, timeoutMs: 10000 });
    const elapsed = Date.now() - startTime;

    if (result.parsedWithFallback) {
      console.warn(`\n⚠️ [PROVENANCE] LIVE_MODEL_UNAVAILABLE: Gemini live provider returned fallback heuristics (elapsed: ${elapsed}ms).`);
      console.warn("Reason: The live model endpoint is unavailable, timed out, or returned HTTP 429 rate limiting.");
      console.warn("Heuristic Fallback Result (FIXTURE / FALLBACK mode):");
      console.log(JSON.stringify(result, null, 2));
      process.exitCode = 1;
      return;
    }

    console.log(`\n✅ Live Model Response received in ${elapsed}ms:`);
    console.log(JSON.stringify(result, null, 2));
    console.log("\n[PROVENANCE] LIVE_MODEL verification successful.");
    process.exitCode = 0;
  } catch (error) {
    console.error("\n❌ [PROVENANCE] LIVE_MODEL_UNAVAILABLE: Unhandled error in live model evaluation:", error);
    process.exitCode = 1;
  }
}

void runLiveModelEvaluation();
