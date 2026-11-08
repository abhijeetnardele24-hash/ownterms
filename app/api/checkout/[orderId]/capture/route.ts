import { NextRequest, NextResponse } from "next/server";
import { paypal } from "@/lib/paypal/client";
import { store } from "@/lib/store/repository";
import { mintRightsReceipt } from "@/lib/receipts/canonical-receipt";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const body = await req.json();
    const { assetId, tierId, intent } = body || {};

    if (!orderId || !assetId || !tierId) {
      return NextResponse.json(
        { error: "orderId, assetId, and tierId are required to capture an order." },
        { status: 400 }
      );
    }

    const asset = store.getAssetById(assetId);
    const policy = store.getPolicyById(assetId, tierId);

    if (!asset || !policy) {
      return NextResponse.json(
        { error: "Asset or license policy not found." },
        { status: 404 }
      );
    }

    // 1. Capture order via PayPal
    const capture = await paypal.captureOrder(orderId);

    // 2. Perform read-back verification against PayPal API
    const verification = await paypal.verifyOrder(orderId);
    if (!verification.verified && !capture.isMocked) {
      return NextResponse.json(
        { error: "Read-back verification failed: order is not in COMPLETED status." },
        { status: 400 }
      );
    }

    // 3. Calculate validity date
    const issuedDate = new Date();
    const validUntilDate = new Date();
    validUntilDate.setDate(issuedDate.getDate() + policy.permissions.maxDurationDays);

    // 4. Mint cryptographic Rights Receipt
    const receipt = mintRightsReceipt({
      receiptId: `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      assetId: asset.id,
      assetTitle: asset.title,
      creatorName: asset.creatorName,
      creatorHandle: asset.creatorHandle,
      licenseTier: policy.tier,
      licenseName: policy.name,
      pricePaidCents: policy.priceCents,
      currency: "USD",
      grantedChannels: intent?.channels || policy.permissions.channels,
      grantedDurationDays: intent?.durationDays || policy.permissions.maxDurationDays,
      grantedTerritories: intent?.territories || policy.permissions.allowedTerritories,
      commercialUse: policy.permissions.commercialUse,
      aiTrainingAllowed: policy.permissions.allowAiTraining,
      derivativeModificationsAllowed: policy.permissions.allowDerivativeModifications,
      redistributionAllowed: policy.permissions.allowRedistribution,
      paypalOrderId: orderId,
      paypalCaptureId: capture.captureId,
      payeeEmail: capture.payee.email_address,
      issuedAt: issuedDate.toISOString(),
      validUntil: validUntilDate.toISOString(),
    });

    // 5. Store in repository and ledger
    store.saveReceipt(receipt);

    return NextResponse.json({
      success: true,
      capture,
      receipt,
      receiptUrl: `/receipt/${receipt.receiptId}`,
    });
  } catch (error: any) {
    console.error("Error in /api/checkout/[orderId]/capture:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to capture checkout order." },
      { status: 500 }
    );
  }
}
