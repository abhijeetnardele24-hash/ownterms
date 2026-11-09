import { notFound } from "next/navigation";
import { store } from "@/lib/store/repository";
import { ReceiptView } from "@/components/receipt/receipt-view";

interface Props {
  params: Promise<{ receiptId: string }>;
}

export default async function ReceiptPage({ params }: Props) {
  const { receiptId } = await params;
  const receipt = store.getReceiptById(receiptId);

  if (!receipt) {
    notFound();
  }

  return <ReceiptView initialReceipt={receipt} />;
}
