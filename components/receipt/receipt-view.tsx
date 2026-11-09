"use client";

import { useState } from "react";
import Link from "next/link";
import { RightsReceipt } from "@/lib/types/domain";
import { verifyRightsReceipt } from "@/lib/receipts/canonical-receipt";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Download,
  TableProperties,
  ArrowLeft,
  Layers,
} from "lucide-react";

interface Props {
  initialReceipt: RightsReceipt;
}

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});

export function ReceiptView({ initialReceipt }: Props) {
  const [copied, setCopied] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<RightsReceipt>(initialReceipt);
  const [tamperedField, setTamperedField] = useState<string | null>(null);

  // Compute live verification of the current (possibly tampered) payload
  const verification = verifyRightsReceipt(activeReceipt);
  const isAuthentic = verification.valid;
  const currentComputedHash = verification.computedHash;

  const handleCopyHash = () => {
    navigator.clipboard.writeText(initialReceipt.canonicalSha256);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTamperTier = () => {
    setActiveReceipt({
      ...activeReceipt,
      licenseTier: "extended_campaign",
      licenseName: "Extended Campaign (Tampered)",
    });
    setTamperedField("licenseTier");
  };

  const handleTamperPrice = () => {
    setActiveReceipt({
      ...activeReceipt,
      pricePaidCents: 0,
    });
    setTamperedField("pricePaidCents");
  };

  const handleTamperTerritories = () => {
    setActiveReceipt({
      ...activeReceipt,
      grantedTerritories: ["*"],
    });
    setTamperedField("grantedTerritories");
  };

  const handleRestore = () => {
    setActiveReceipt(initialReceipt);
    setTamperedField(null);
  };

  const handleDownloadJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activeReceipt, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${activeReceipt.receiptId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const provenance = initialReceipt.provenance || "FIXTURE";
  const isLiveSandbox = provenance === "LIVE_SANDBOX";

  return (
    <main id="main-content" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button & Actions */}
      <div className="flex items-center justify-between">
        <Link
          href={`/assets/${initialReceipt.assetId}`}
          className="text-xs font-semibold text-[#64748B] hover:text-[#091A2A] flex items-center gap-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-[#1769E0]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Asset Licensing</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadJson}
            className="px-3 py-1.5 rounded-md border border-[#CBD5E1] bg-white text-xs font-semibold text-[#091A2A] hover:bg-[#F8FAFC] flex items-center gap-1.5 shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-[#1769E0]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download JSON</span>
          </button>
          <Link
            href="/control-room"
            className="px-3 py-1.5 rounded-md bg-[#091A2A] text-white text-xs font-semibold hover:bg-[#1769E0] flex items-center gap-1.5 shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-[#1769E0]"
          >
            <TableProperties className="w-3.5 h-3.5" />
            <span>View in Control Room</span>
          </Link>
        </div>
      </div>

      {/* Main Rights Receipt Card */}
      <div className="rounded-2xl border-2 border-[#E4E2DB] bg-white p-8 sm:p-12 shadow-md relative overflow-hidden space-y-8">
        {/* Decorative Border */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#1769E0] via-[#16805B] to-[#091A2A]" />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[#F1EFEA]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-widest text-[#16805B] flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Tamper-Evident Rights Receipt</span>
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  isLiveSandbox
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                    : "bg-amber-100 text-amber-800 border-amber-300"
                }`}
              >
                {provenance}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#091A2A] tracking-tight">
              Machine-Readable Rights Receipt
            </h1>
            <p className="text-xs text-[#64748B] mt-1 font-mono">
              Receipt ID: {activeReceipt.receiptId}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[11px] text-[#64748B] block">Settled Amount</span>
            <span className="text-2xl sm:text-3xl font-black text-[#091A2A]">
              {usdFormatter.format(activeReceipt.pricePaidCents / 100)}
            </span>
            <span className="text-xs font-bold text-[#16805B] ml-1">USD</span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div className="space-y-4">
            <div>
              <span className="text-[#64748B] font-medium block">Licensed Asset</span>
              <span className="text-sm font-bold text-[#091A2A]">
                {activeReceipt.assetTitle}
              </span>
              <span className="text-[#64748B] font-mono block text-[11px]">
                ID: {activeReceipt.assetId}
              </span>
            </div>

            <div>
              <span className="text-[#64748B] font-medium block">Creator / Licensor</span>
              <span className="font-bold text-[#091A2A]">
                {activeReceipt.creatorName}
              </span>
              <span className="text-[#64748B] block text-[11px]">
                {activeReceipt.creatorHandle} ({activeReceipt.payeeEmail})
              </span>
            </div>

            <div>
              <span className="text-[#64748B] font-medium block">License Tier</span>
              <span className="font-bold text-[#16805B]">
                {activeReceipt.licenseName} ({activeReceipt.licenseTier})
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-[#64748B] font-medium block">PayPal Transaction Proof</span>
              <span className="font-mono text-[#091A2A] block text-[11px]">
                Order: {activeReceipt.paypalOrderId}
              </span>
              <span className="font-mono text-[#091A2A] block text-[11px]">
                Capture: {activeReceipt.paypalCaptureId}
              </span>
            </div>

            <div>
              <span className="text-[#64748B] font-medium block">Validity Window (UTC)</span>
              <span className="text-[#091A2A] block">
                Issued: {dateFormatter.format(new Date(activeReceipt.issuedAt))}
              </span>
              <span className="text-[#091A2A] block">
                Valid Until: {dateFormatter.format(new Date(activeReceipt.validUntil))} ({activeReceipt.grantedDurationDays} days)
              </span>
            </div>

            <div>
              <span className="text-[#64748B] font-medium block">Granted Scope</span>
              <span className="text-[#091A2A] block">
                Channels: <strong>{activeReceipt.grantedChannels.join(", ")}</strong>
              </span>
              <span className="text-[#091A2A] block">
                Territories: <strong>{activeReceipt.grantedTerritories.join(", ")}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* SHA-256 Digest Section */}
        <div className="space-y-2 pt-4 border-t border-[#F1EFEA]">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#091A2A] flex items-center gap-1.5">
              <span>Canonical SHA-256 Digest</span>
              <span className="text-[10px] text-[#64748B] font-normal">
                (Lexicographically Sorted JSON Serialization)
              </span>
            </span>

            <button
              type="button"
              onClick={handleCopyHash}
              className="text-[#1769E0] font-semibold hover:underline flex items-center gap-1 text-[11px] focus-visible:outline-2 focus-visible:outline-[#1769E0]"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-[#16805B]" />
                  <span className="text-[#16805B]">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy Hash</span>
                </>
              )}
            </button>
          </div>

          <div className="p-3.5 rounded-lg bg-[#091A2A] text-white font-mono text-xs break-all shadow-inner">
            {initialReceipt.canonicalSha256}
          </div>
        </div>

        {/* Status Verification Pill with aria-live */}
        <div
          aria-live="polite"
          className={`p-4 rounded-xl border flex items-center gap-3 transition-colors ${
            isAuthentic
              ? "bg-[#EDF7F2] border-[#C6E6D6] text-[#16805B]"
              : "bg-[#FEF2F2] border-[#FECACA] text-[#DC2626]"
          }`}
        >
          {isAuthentic ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden="true" />
          ) : (
            <AlertTriangle className="w-5 h-5 shrink-0" aria-hidden="true" />
          )}

          <div>
            <h2 className="font-bold text-xs sm:text-sm">
              {isAuthentic
                ? "Cryptographic Integrity Verified"
                : "Cryptographic Tampering Detected!"}
            </h2>
            <p className="text-[11px] opacity-90 mt-0.5">
              {isAuthentic
                ? "The receipt data matches the original canonical SHA-256 digest exactly. All terms are authentic."
                : `A byte mismatch occurred on field: [${tamperedField}]. Computed hash (${currentComputedHash.slice(0, 16)}…) does not match the sealed receipt.`}
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Anti-Tamper Testing Sandbox */}
      <div className="rounded-xl border border-[#CBD5E1] bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#1769E0]" />
          <h3 className="font-bold text-sm text-[#091A2A]">
            Judge Anti-Tampering Interactive Sandbox
          </h3>
        </div>

        <p className="text-xs text-[#64748B] leading-relaxed">
          Test cryptographic resilience. Click any modification button below to simulate an adversary altering the local receipt data. The canonical SHA-256 recalculation immediately detects the mismatch.
        </p>

        <div className="flex flex-wrap items-center gap-2 pt-2">
          <button
            type="button"
            onClick={handleTamperTier}
            className="px-3 py-1.5 rounded-md bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-xs font-semibold hover:bg-red-100 transition-colors focus-visible:outline-2 focus-visible:outline-red-600"
          >
            Tamper Tier to Extended
          </button>
          <button
            type="button"
            onClick={handleTamperPrice}
            className="px-3 py-1.5 rounded-md bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-xs font-semibold hover:bg-red-100 transition-colors focus-visible:outline-2 focus-visible:outline-red-600"
          >
            Tamper Price to $0.00
          </button>
          <button
            type="button"
            onClick={handleTamperTerritories}
            className="px-3 py-1.5 rounded-md bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-xs font-semibold hover:bg-red-100 transition-colors focus-visible:outline-2 focus-visible:outline-red-600"
          >
            Tamper Territories to Worldwide
          </button>
          <button
            type="button"
            onClick={handleRestore}
            className="px-3 py-1.5 rounded-md bg-[#EDF7F2] border border-[#C6E6D6] text-[#16805B] text-xs font-semibold hover:bg-green-100 transition-colors focus-visible:outline-2 focus-visible:outline-emerald-600"
          >
            Restore Authentic State
          </button>
        </div>
      </div>
    </main>
  );
}
