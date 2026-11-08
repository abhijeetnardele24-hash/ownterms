import { describe, it, expect } from "vitest";
import { POST } from "@/app/api/intent/parse/route";
import { NextRequest } from "next/server";

describe("POST /api/intent/parse - Integration Route Test", () => {
  it("rejects empty prompt requests with 400", async () => {
    const req = new NextRequest("http://localhost:3000/api/intent/parse", {
      method: "POST",
      body: JSON.stringify({ prompt: "" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it("extracts facts and ranks policies for the canonical asset", async () => {
    const req = new NextRequest("http://localhost:3000/api/intent/parse", {
      method: "POST",
      body: JSON.stringify({
        prompt:
          "Use this night-market photograph in a paid Instagram campaign for 30 days in India and Singapore. Budget up to $80. Do not allow AI training.",
        assetId: "asset_night_market_01",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.facts.channels).toContain("instagram_ad");
    expect(data.rankedTiers).toBeDefined();
    expect(data.rankedTiers.length).toBe(3);

    const recommended = data.rankedTiers.find((t: any) => t.status === "recommended");
    expect(recommended).toBeDefined();
    expect(recommended.policy.id).toBe("tier_nm_commercial");
    expect(recommended.policy.priceCents).toBe(6900);
  });
});
