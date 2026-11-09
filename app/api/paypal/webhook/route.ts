import { NextRequest, NextResponse } from "next/server";
import { paypal } from "@/lib/paypal/client";
import { store } from "@/lib/store/repository";

export async function POST(req: NextRequest) {
  try {
    const transmissionId = req.headers.get("paypal-transmission-id") || "";
    const transmissionTime = req.headers.get("paypal-transmission-time") || "";
    const transmissionSig = req.headers.get("paypal-transmission-sig") || "";
    const certUrl = req.headers.get("paypal-cert-url") || "";
    const authAlgo = req.headers.get("paypal-auth-algo") || "";

    const rawBody = await req.json();
    const eventId = rawBody?.id || transmissionId;
    const eventType = rawBody?.event_type || "UNKNOWN";

    if (!transmissionId || !transmissionSig) {
      return NextResponse.json(
        { error: "Missing required PayPal transmission signature headers." },
        { status: 400 }
      );
    }

    // 1. Verify cryptographic authenticity of the webhook
    const isValid = await paypal.verifyWebhookSignature({
      transmissionId,
      transmissionTime,
      transmissionSig,
      certUrl,
      authAlgo,
      webhookEvent: rawBody,
    });

    if (!isValid) {
      return NextResponse.json(
        { error: "PayPal webhook signature verification failed." },
        { status: 401 }
      );
    }

    // 2. Enforce event deduplication in SQLite
    const isNewEvent = store.recordWebhookEvent(eventId, eventType, rawBody);
    if (!isNewEvent) {
      return NextResponse.json({
        success: true,
        status: "duplicate_ignored",
        eventId,
      });
    }

    // 3. Process Event Types
    if (eventType === "CHECKOUT.ORDER.APPROVED") {
      const orderId = rawBody?.resource?.id;
      if (orderId) {
        const intent = store.getPurchaseIntentByOrderId(orderId);
        if (intent && (intent.state === "CREATED" || intent.state === "ORDER_CREATED")) {
          intent.state = "PAYER_APPROVED";
          store.savePurchaseIntent(intent);
        }
      }
    } else if (eventType === "PAYMENT.CAPTURE.COMPLETED") {
      const orderId = rawBody?.resource?.supplementary_data?.related_ids?.order_id;
      if (orderId) {
        const intent = store.getPurchaseIntentByOrderId(orderId);
        if (intent && intent.state !== "RECEIPT_ISSUED") {
          intent.state = "CAPTURE_VERIFIED";
          store.savePurchaseIntent(intent);
        }
      }
    }

    return NextResponse.json({
      success: true,
      processed: true,
      eventId,
      eventType,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Webhook processing failed.";
    console.error("Error in /api/paypal/webhook:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
