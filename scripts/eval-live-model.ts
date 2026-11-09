import { extractIntendedUse } from "../lib/ai/extract-intent";

async function runLiveModelEvaluation() {
  console.log("================================================================================");
  console.log("🔍 Running Live Gemini Model Intent Extraction Evaluation (LIVE_MODEL)");
  console.log("================================================================================");

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    console.error("❌ Aborting: GEMINI_API_KEY is not configured in environment or .env.local.");
    process.exit(1);
  }

  const prompt =
    "Use this night-market photograph in a paid Instagram campaign for 30 days in India and Singapore. Budget up to $80. Do not allow AI training.";

  console.log(`Input Prompt: "${prompt}"`);
  console.log("Calling Google Gemini live endpoint...");

  const startTime = Date.now();
  try {
    const result = await extractIntendedUse(prompt, { forceFallback: false });
    const elapsed = Date.now() - startTime;

    console.log(`\n✅ Live Model Response received in ${elapsed}ms:`);
    console.log(JSON.stringify(result, null, 2));

    if (result.parsedWithFallback) {
      console.warn("⚠️ Warning: Result was parsed with fallback heuristics, not live model!");
      process.exit(1);
    }

    console.log("\n[PROVENANCE] LIVE_MODEL verification successful.");
  } catch (error) {
    console.error("❌ Live model extraction failed:", error);
    process.exit(1);
  }
}

runLiveModelEvaluation();

