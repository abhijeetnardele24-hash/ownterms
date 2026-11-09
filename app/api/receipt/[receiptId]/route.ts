import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store/repository";
import { verifyRightsReceipt } from "@/lib/receipts/canonical-receipt";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ receiptId: string }> }
) {
  try {
    const { receiptId } = await params;
    const receipt = store.getReceiptById(receiptId);

    if (!receipt) {
      return NextResponse.json(
        { error: `Receipt not found: ${receiptId}` },
        { status: 404 }
      );
    }

    const verification = verifyRightsReceipt(receipt);

    return NextResponse.json({
      success: true,
      receipt,
      verification,
    });
  } catch (error: unknown) {
    console.error("Error in /api/receipt/[receiptId]:", error);
    return NextResponse.json(
      { error: "Failed to retrieve receipt." },
      { status: 500 }
    );
  }
}

