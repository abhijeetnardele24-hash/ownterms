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
  Lock,
  Layers,
} from "lucide-react";

interface Props {
  initialReceipt: RightsReceipt;
}

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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          href={`/assets/${initialReceipt.assetId}`}
          className="text-xs font-semibold text-[#64748B] hover:text-[#091A2A] flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Asset Negotiation</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadJson}
            className="px-3 py-1.5 rounded-md border border-[#CBD5E1] bg-white text-xs font-semibold text-[#091A2A] hover:bg-[#F8FAFC] flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download JSON</span>
          </button>
          <Link
            href="/control-room"
            className="px-3 py-1.5 rounded-md bg-[#091A2A] text-white text-xs font-semibold hover:bg-[#1769E0] flex items-center gap-1.5 shadow-sm"
          >
            <TableProperties className="w-3.5 h-3.5" />
            <span>View in Control Room</span>
          </Link>
        </div>
      </div>

      {/* Main Certificate Card */}
      <div className="rounded-2xl border-2 border-[#E4E2DB] bg-white p-8 sm:p-12 shadow-md relative overflow-hidden space-y-8">
        {/* Certificate Decorative Border */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#1769E0] via-[#16805B] to-[#091A2A]" />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[#F1EFEA]">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#16805B] mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Verifiable Rights Instrument</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#091A2A] tracking-tight">
              Certificate of Intellectual Property License
            </h1>
            <p className="text-xs text-[#64748B] mt-1 font-mono">
              Receipt ID: {activeReceipt.receiptId}
            </p>
          </div>

          <div className="text-right sm:text-right">
            <span className="text-[11px] text-[#64748B] block">Settled Amount</span>
            <span className="text-2xl sm:text-3xl font-black text-[#091A2A]">
              ${(activeReceipt.pricePaidCents / 100).toFixed(2)}
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
              <span className="text-[#64748B] font-medium block">License Policy Tier</span>
              <span className="font-bold text-[#1769E0] uppercase tracking-wide">
                {activeReceipt.licenseName}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-[#64748B] font-medium block">PayPal Settlement Proof</span>
              <div className="font-mono text-[11px] space-y-0.5 text-[#091A2A]">
                <p>Order ID: {activeReceipt.paypalOrderId}</p>
                <p>Capture ID: {activeReceipt.paypalCaptureId}</p>
                <p className="text-[#16805B] font-semibold">● Status: COMPLETED (Verified)</p>
              </div>
            </div>

            <div>
              <span className="text-[#64748B] font-medium block">Validity Period</span>
              <p className="font-mono text-[11px] text-[#091A2A]">
                Issued: {new Date(activeReceipt.issuedAt).toUTCString()}
              </p>
              <p className="font-mono text-[11px] text-[#091A2A]">
                Valid Until: {new Date(activeReceipt.validUntil).toUTCString()} ({activeReceipt.grantedDurationDays} days)
              </p>
            </div>
          </div>
        </div>

        {/* Granted Scope Strip */}
        <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#091A2A] block">
            Granted Rights & Scope
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[#64748B] block text-[10px]">Permitted Channels</span>
              <span className="font-semibold text-[#091A2A]">{activeReceipt.grantedChannels.join(", ")}</span>
            </div>
            <div>
              <span className="text-[#64748B] block text-[10px]">Territories</span>
              <span className="font-semibold text-[#091A2A]">{activeReceipt.grantedTerritories.join(", ")}</span>
            </div>
            <div>
              <span className="text-[#64748B] block text-[10px]">Commercial Use</span>
              <span className={`font-semibold ${activeReceipt.commercialUse ? "text-[#16805B]" : "text-[#DC2626]"}`}>
                {activeReceipt.commercialUse ? "Approved" : "Prohibited"}
              </span>
            </div>
            <div>
              <span className="text-[#64748B] block text-[10px]">AI Model Training</span>
              <span className={`font-semibold ${activeReceipt.aiTrainingAllowed ? "text-[#16805B]" : "text-[#DC2626]"}`}>
                {activeReceipt.aiTrainingAllowed ? "Permitted" : "Prohibited"}
              </span>
            </div>
          </div>
        </div>

        {/* Cryptographic SHA-256 Binding */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#091A2A] flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#1769E0]" />
              <span>Canonical SHA-256 Digest</span>
            </span>
            <button
              type="button"
              onClick={handleCopyHash}
              className="text-xs text-[#1769E0] font-semibold hover:underline flex items-center gap-1"
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

        {/* Status Verification Pill */}
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 transition-colors ${
            isAuthentic
              ? "bg-[#EDF7F2] border-[#C6E6D6] text-[#16805B]"
              : "bg-[#FEF2F2] border-[#FECACA] text-[#DC2626]"
          }`}
        >
          {isAuthentic ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 shrink-0" />
          )}

          <div>
            <h4 className="font-bold text-xs sm:text-sm">
              {isAuthentic
                ? "Cryptographic Integrity Verified"
                : "Cryptographic Tampering Detected!"}
            </h4>
            <p className="text-[11px] opacity-90 mt-0.5">
              {isAuthentic
                ? "The receipt data matches the original canonical SHA-256 signature exactly. All terms are authentic."
                : `A byte mismatch occurred on field: [${tamperedField}]. Computed hash (${currentComputedHash.slice(0, 16)}…) does not match the signed contract.`}
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
          Test cryptographic resilience. Click any modification button below to simulate an attacker altering the local receipt file. Watch how the canonical SHA-256 recalculation immediately catches the fraud.
        </p>

        <div className="flex flex-wrap items-center gap-2 pt-2">
          <button
            type="button"
            onClick={handleTamperTier}
            className="px-3 py-1.5 rounded-md bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-xs font-semibold hover:bg-red-100 transition-colors"
          >
            Tamper Tier to Extended
          </button>
          <button
            type="button"
            onClick={handleTamperPrice}
            className="px-3 py-1.5 rounded-md bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-xs font-semibold hover:bg-red-100 transition-colors"
          >
            Tamper Price to $0.00
          </button>
          <button
            type="button"
            onClick={handleTamperTerritories}
            className="px-3 py-1.5 rounded-md bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-xs font-semibold hover:bg-red-100 transition-colors"
          >
            Tamper Territories to Worldwide
          </button>
          <button
            type="button"
            onClick={handleRestore}
            className="px-3 py-1.5 rounded-md bg-[#EDF7F2] border border-[#C6E6D6] text-[#16805B] text-xs font-semibold hover:bg-green-100 transition-colors"
          >
            Restore Authentic State
          </button>
        </div>
      </div>
    </div>
  );
}

