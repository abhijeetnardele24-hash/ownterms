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
    const { purchaseIntentId } = body || {};

    if (!orderId) {
      return NextResponse.json(
        { error: "orderId is required to capture an order." },
        { status: 400 }
      );
    }

    // 1. Idempotency check: if receipt already minted for this order, return it immediately
    const existingReceipt = store.getReceiptByOrderId(orderId);
    if (existingReceipt) {
      return NextResponse.json({
        success: true,
        idempotent: true,
        receipt: existingReceipt,
        receiptUrl: `/receipt/${existingReceipt.receiptId}`,
      });
    }

    // 2. Fetch the frozen server-side PurchaseIntent
    // NEVER trust client-supplied price, tier, or intended use at capture time!
    let purchaseIntent = purchaseIntentId ? store.getPurchaseIntent(purchaseIntentId) : undefined;
    if (!purchaseIntent) {
      purchaseIntent = store.getPurchaseIntentByOrderId(orderId);
    }

    if (!purchaseIntent) {
      return NextResponse.json(
        { error: "Purchase intent not found or order has expired." },
        { status: 404 }
      );
    }

    if (purchaseIntent.paypalOrderId && purchaseIntent.paypalOrderId !== orderId) {
      return NextResponse.json(
        { error: "Mismatched order ID on frozen purchase intent." },
        { status: 400 }
      );
    }

    const asset = store.getAssetById(purchaseIntent.assetId);
    const policy = store.getPolicyById(purchaseIntent.assetId, purchaseIntent.policyId);

    if (!asset || !policy) {
      return NextResponse.json(
        { error: "Referenced asset or policy not found in store." },
        { status: 404 }
      );
    }

    // 3. Mark capture pending on frozen purchase intent
    purchaseIntent.state = "CAPTURE_PENDING";
    store.savePurchaseIntent(purchaseIntent);

    // 4. Capture order via PayPal (or deterministic fixture)
    const capture = await paypal.captureOrder(orderId, purchaseIntent);

    // 5. Perform rigorous read-back verification against PayPal Orders v2 API
    const verification = await paypal.verifyOrder(orderId, purchaseIntent);
    if (!verification.verified) {
      purchaseIntent.state = "FAILED";
      store.savePurchaseIntent(purchaseIntent);
      return NextResponse.json(
        {
          error: "Read-back verification failed: " + (verification.reason || "Provider fact mismatch."),
          details: verification,
        },
        { status: 400 }
      );
    }

    // 6. Calculate license validity dates
    const issuedDate = new Date();
    const validUntilDate = new Date();
    validUntilDate.setDate(issuedDate.getDate() + purchaseIntent.normalizedUse.durationDays);

    // 7. Mint cryptographic Rights Receipt using frozen server records & hashes
    const receipt = mintRightsReceipt({
      receiptId: `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      assetId: asset.id,
      assetTitle: asset.title,
      creatorName: asset.creatorName,
      creatorHandle: asset.creatorHandle,
      licenseTier: policy.tier,
      licenseName: policy.name,
      pricePaidCents: purchaseIntent.priceCents, // Server-held frozen price!
      currency: "USD",
      grantedChannels: purchaseIntent.normalizedUse.channels,
      grantedDurationDays: purchaseIntent.normalizedUse.durationDays,
      grantedTerritories: purchaseIntent.normalizedUse.territories,
      commercialUse: policy.permissions.commercialUse,
      aiTrainingAllowed: policy.permissions.allowAiTraining,
      derivativeModificationsAllowed: policy.permissions.allowDerivativeModifications,
      redistributionAllowed: policy.permissions.allowRedistribution,
      paypalOrderId: orderId,
      paypalCaptureId: capture.captureId,
      payeeEmail: capture.payee.email_address,
      policyHash: purchaseIntent.policyHash,
      purchasePayloadHash: purchaseIntent.purchasePayloadHash,
      provenance: purchaseIntent.provenance,
      issuedAt: issuedDate.toISOString(),
      validUntil: validUntilDate.toISOString(),
    });

    // 8. Atomically settle purchase intent, insert receipt, and append ledger
    const settlementResult = store.settlePurchaseAndMintReceipt(receipt, purchaseIntent);

    return NextResponse.json({
      success: true,
      capture,
      receipt: settlementResult.receipt,
      idempotent: settlementResult.idempotent,
      receiptUrl: `/receipt/${settlementResult.receipt.receiptId}`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to capture checkout order.";
    console.error("Error in /api/checkout/[orderId]/capture:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
