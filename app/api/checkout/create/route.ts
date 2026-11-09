import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { paypal } from "@/lib/paypal/client";
import { store } from "@/lib/store/repository";
import { evaluateLicense } from "@/lib/policy/evaluate-license";
import { canonicalizeJson } from "@/lib/receipts/canonical-receipt";
import { PurchaseIntent, IntendedUseFactSchema } from "@/lib/types/domain";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { assetId, tierId, intent } = body || {};

    if (!assetId || !tierId) {
      return NextResponse.json(
        { error: "assetId and tierId are required to create a checkout order." },
        { status: 400 }
      );
    }

    const asset = store.getAssetById(assetId);
    if (!asset) {
      return NextResponse.json({ error: `Asset not found: ${assetId}` }, { status: 404 });
    }

    const policy = store.getPolicyById(assetId, tierId);
    if (!policy) {
      return NextResponse.json(
        { error: `License policy not found: ${tierId} for asset ${assetId}` },
        { status: 404 }
      );
    }

    // 1. Validate intent and execute server-side compatibility check
    const normalizedUse = intent
      ? IntendedUseFactSchema.parse(intent)
      : {
          rawRequest: "Direct checkout",
          channels: policy.permissions.channels,
          durationDays: policy.permissions.maxDurationDays,
          territories:
            policy.permissions.maxTerritories < 999 && policy.permissions.allowedTerritories.includes("*")
              ? ["IN", "SG"]
              : policy.permissions.allowedTerritories,
          commercialUse: policy.permissions.commercialUse,
          prohibitAiTraining: !policy.permissions.allowAiTraining,
          budgetLimitCents: policy.priceCents,
          evidenceQuotes: {},
          parsedWithFallback: true,
        };

    const compatibility = evaluateLicense(policy, normalizedUse);
    if (!compatibility.compatible) {
      return NextResponse.json(
        {
          error: "Incompatible license request: " + compatibility.violations.join("; "),
          violations: compatibility.violations,
        },
        { status: 400 }
      );
    }

    // 2. Hash policy terms and frozen purchase payload
    const policyHash = crypto
      .createHash("sha256")
      .update(canonicalizeJson(policy), "utf8")
      .digest("hex");

    const purchasePayloadHash = crypto
      .createHash("sha256")
      .update(
        canonicalizeJson({
          assetId: asset.id,
          assetVersion: asset.version,
          policyId: policy.id,
          priceCents: policy.priceCents,
          normalizedUse,
        }),
        "utf8"
      )
      .digest("hex");

    // 3. Create frozen server PurchaseIntent
    const purchaseIntentId = `pi_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const purchaseIntent: PurchaseIntent = {
      id: purchaseIntentId,
      assetId: asset.id,
      assetVersion: asset.version,
      policyId: policy.id,
      policyVersion: "1.0.0",
      normalizedUse,
      priceCents: policy.priceCents, // Server-locked price in integer minor cents!
      currency: "USD",
      compatibilityResult: compatibility,
      policyHash,
      purchasePayloadHash,
      state: "CREATED",
      createdAt: new Date().toISOString(),
      paypalOrderId: null,
      paypalCaptureId: null,
      paypalRequestId: `req_${purchaseIntentId}`,
      provenance: paypal.getMode() === "sandbox" ? "LIVE_SANDBOX" : "FIXTURE",
    };

    // 4. Create PayPal Order
    const order = await paypal.createOrder(purchaseIntent);

    // 5. Bind order ID and save to SQLite
    purchaseIntent.paypalOrderId = order.orderId;
    purchaseIntent.state = "AUTHORIZED";
    store.savePurchaseIntent(purchaseIntent);

    return NextResponse.json({
      success: true,
      orderId: order.orderId,
      purchaseIntentId: purchaseIntent.id,
      status: order.status,
      priceCents: purchaseIntent.priceCents,
      currency: purchaseIntent.currency,
      provenance: purchaseIntent.provenance,
      isMocked: order.isMocked,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create checkout order.";
    console.error("Error in /api/checkout/create:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
