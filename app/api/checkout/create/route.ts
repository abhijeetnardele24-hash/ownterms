import { NextRequest, NextResponse } from "next/server";
import { paypal } from "@/lib/paypal/client";

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

    const order = await paypal.createOrder(assetId, tierId, intent);

    return NextResponse.json({
      success: true,
      orderId: order.orderId,
      status: order.status,
      priceCents: order.priceCents,
      currency: order.currency,
      isMocked: order.isMocked,
    });
  } catch (error: any) {
    console.error("Error in /api/checkout/create:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create checkout order." },
      { status: 500 }
    );
  }
}
