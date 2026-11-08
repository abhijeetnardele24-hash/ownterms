import { NextRequest, NextResponse } from "next/server";
import { extractIntendedUse } from "@/lib/ai/extract-intent";
import { store } from "@/lib/store/repository";
import { rankLicenses } from "@/lib/policy/rank-licenses";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
    const assetId = typeof body?.assetId === "string" ? body.assetId.trim() : undefined;

    if (!prompt) {
      return NextResponse.json(
        { error: "A valid 'prompt' string is required for intent extraction." },
        { status: 400 }
      );
    }

    const facts = await extractIntendedUse(prompt);

    let rankedTiers = null;
    if (assetId) {
      const policies = store.getPoliciesForAsset(assetId);
      if (policies.length > 0) {
        rankedTiers = rankLicenses(policies, facts);
      }
    }

    return NextResponse.json({
      success: true,
      facts,
      rankedTiers,
      assetId,
    });
  } catch (error) {
    console.error("Error in /api/intent/parse:", error);
    return NextResponse.json(
      { error: "Failed to parse license request intent." },
      { status: 500 }
    );
  }
}
