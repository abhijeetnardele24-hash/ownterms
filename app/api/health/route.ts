import { NextResponse } from "next/server";
import db from "@/lib/store/db";
import { paypal } from "@/lib/paypal/client";

export async function GET() {
  try {
    // 1. Verify SQLite connectivity and schema presence
    const result = db.prepare("SELECT COUNT(*) as count FROM sqlite_master WHERE type='table'").get() as {
      count: number;
    };

    if (result.count < 4) {
      return NextResponse.json(
        {
          status: "degraded",
          database: "schema_incomplete",
          tableCount: result.count,
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      );
    }

    const mode = paypal.getMode();

    return NextResponse.json(
      {
        status: "ok",
        database: "connected",
        tableCount: result.count,
        mode,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Health check error";
    return NextResponse.json(
      {
        status: "error",
        database: "unhealthy",
        error: message,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
