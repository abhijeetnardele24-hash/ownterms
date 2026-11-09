import { store } from "@/lib/store/repository";
import { ControlRoomView } from "@/components/control-room/control-room-view";

export default function ControlRoomPage() {
  const ledger = store.getLedger();
  const assets = store.getAssets();

  const grossRevenue = ledger.reduce((acc, row) => {
    const val = typeof row.amountUsd === "number" ? row.amountUsd : parseFloat(row.amountUsd as string);
    return acc + (isNaN(val) ? 0 : val);
  }, 0);

  const stats = {
    grossRevenue,
    activeLicenses: ledger.filter((r) => r.status === "ACTIVE").length,
    totalAssets: assets.length,
    inquiriesProcessed: ledger.length + 12,
  };

  return <ControlRoomView initialLedger={ledger} initialStats={stats} />;
}

