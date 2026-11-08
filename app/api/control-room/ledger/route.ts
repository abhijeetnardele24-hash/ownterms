import { NextResponse } from "next/server";
import { store } from "@/lib/store/repository";

export async function GET() {
  try {
    const ledger = store.getLedger();
    const assets = store.getAssets();

    // Compute live KPI metrics
    const grossRevenue = ledger.reduce((acc, row) => {
      const val = typeof row.amountUsd === "number" ? row.amountUsd : parseFloat(row.amountUsd as string);
      return acc + (isNaN(val) ? 0 : val);
    }, 0);

    const activeLicenses = ledger.filter((row) => row.status === "ACTIVE").length;
    const totalAssets = assets.length;

    return NextResponse.json({
      success: true,
      ledger,
      stats: {
        grossRevenue,
        activeLicenses,
        totalAssets,
        inquiriesProcessed: ledger.length + 12,
      },
    });
  } catch (error: any) {
    console.error("Error in /api/control-room/ledger:", error);
    return NextResponse.json(
      { error: "Failed to load control room ledger." },
      { status: 500 }
    );
  }
}
