"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Asset,
  LicensePolicy,
  CompatibilityResult,
  IntendedUseFact,
} from "@/lib/types/domain";
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Globe,
  Coins,
  Cpu,
  ArrowRight,
  Loader2,
  Quote,
} from "lucide-react";

interface Props {
  asset: Asset;
  initialPolicies: LicensePolicy[];
}

const CANONICAL_PRESET =
  "Use this night-market photograph in a paid Instagram campaign for 30 days in India and Singapore. Budget up to $80. Do not allow AI training.";

export function AssetLicensingView({ asset, initialPolicies }: Props) {
  const router = useRouter();

  const [prompt, setPrompt] = useState(CANONICAL_PRESET);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedFacts, setExtractedFacts] = useState<IntendedUseFact | null>(null);
  const [rankedTiers, setRankedTiers] = useState<CompatibilityResult[] | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Trigger AI Intent Extraction
  const handleExtractIntent = async () => {
    if (!prompt.trim()) return;
    setIsExtracting(true);
    setCheckoutError(null);

    try {
      const res = await fetch("/api/intent/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, assetId: asset.id }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Extraction failed");
      }

      setExtractedFacts(data.facts);
      setRankedTiers(data.rankedTiers);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Could not parse intent.";
      console.error(err);
      setCheckoutError(message);
    } finally {
      setIsExtracting(false);
    }
  };

  // Trigger Direct PayPal Orders v2 Sandbox Checkout
  const handlePayPalCheckout = async (policy: LicensePolicy) => {
    setIsCheckingOut(policy.id);
    setCheckoutError(null);

    try {
      // 1. Create order on server
      const createRes = await fetch("/api/checkout/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetId: asset.id,
          tierId: policy.id,
          intent: extractedFacts,
        }),
      });

      const createData = await createRes.json();
      if (!createRes.ok || !createData.orderId) {
        throw new Error(createData.error || "Order creation failed");
      }

      const orderId = createData.orderId;
      const purchaseIntentId = createData.purchaseIntentId;

      // 2. Capture order on server with frozen purchaseIntentId
      // Notice: The client sends NO authority over price, asset, tier, or intent!
      const captureRes = await fetch(`/api/checkout/${orderId}/capture`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          purchaseIntentId,
        }),
      });

      const captureData = await captureRes.json();
      if (!captureRes.ok || !captureData.receipt) {
        throw new Error(captureData.error || "Order capture failed");
      }

      // Navigate to the tamper-evident Rights Receipt
      router.push(`/receipt/${captureData.receipt.receiptId}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "PayPal checkout failed.";
      console.error("Checkout failed:", err);
      setCheckoutError(message);
    } finally {
      setIsCheckingOut(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Top Breadcrumb & Title */}
      <div>
        <div className="flex items-center gap-2 text-xs text-[#64748B] mb-2">
          <span>Catalog</span>
          <span>/</span>
          <span className="uppercase">{asset.assetType}</span>
          <span>/</span>
          <span className="text-[#091A2A] font-medium">{asset.title}</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-[#091A2A] tracking-tight">
              {asset.title}
            </h1>
            <p className="text-sm text-[#475569] mt-1">
              Created by <strong className="text-[#091A2A]">{asset.creatorName}</strong> ({asset.creatorHandle}) · Version {asset.version}
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#EDF7F2] border border-[#C6E6D6] text-xs font-semibold text-[#16805B]">
            <ShieldCheck className="w-4 h-4" />
            <span>Machine-Licensable Work</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Asset Showcase (Left) & Intent Studio (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Asset Media & Specs (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-xl overflow-hidden border border-[#E4E2DB] bg-white shadow-sm">
            <div className="relative aspect-4/3 w-full bg-slate-900 overflow-hidden">
              <Image
                src={asset.previewUrl}
                alt={asset.title}
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="p-5 space-y-4">
              <p className="text-xs text-[#475569] leading-relaxed">
                {asset.description}
              </p>

              <div className="pt-3 border-t border-[#F1EFEA] space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] block">
                  Technical Provenance
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(asset.specs).map(([key, val]) => (
                    <div key={key} className="p-2 rounded bg-[#F8FAFC] border border-[#E2E8F0]">
                      <span className="text-[10px] text-[#64748B] capitalize block">{key}</span>
                      <span className="font-semibold text-[#091A2A] truncate block">{String(val)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Agent Intent Studio (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Agent Intent Composer Card */}
          <div className="p-6 rounded-xl bg-white border border-[#E4E2DB] shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-[#1769E0]" />
                <h2 className="font-bold text-base text-[#091A2A]">
                  Autonomous Agent Intent Studio
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setPrompt(CANONICAL_PRESET)}
                className="text-xs font-semibold text-[#1769E0] hover:text-[#1255B8] underline underline-offset-2 flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Load Canonical Demo Request</span>
              </button>
            </div>

            <p className="text-xs text-[#64748B] leading-relaxed">
              Enter the intended usage request in natural language. Google Gemini will extract factual parameters into a quarantined schema, while our deterministic rule engine evaluates compatible policies.
            </p>

            <div className="space-y-3">
              <textarea
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe intended channels, duration, geographic territories, commercial scope, and budget..."
                className="w-full p-3.5 rounded-lg border border-[#CBD5E1] text-xs sm:text-sm text-[#091A2A] focus:outline-none focus:ring-2 focus:ring-[#1769E0] focus:border-transparent transition-all font-mono"
              />

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#64748B]">
                  Stage 1: Factual Intent Extraction (Zero Pricing Authority)
                </span>
                <button
                  type="button"
                  onClick={handleExtractIntent}
                  disabled={isExtracting || !prompt.trim()}
                  className="px-5 py-2.5 rounded-lg bg-[#091A2A] text-white text-xs font-bold hover:bg-[#1769E0] disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm"
                >
                  {isExtracting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Extracting Facts...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-[#60A5FA]" />
                      <span>Extract Rights Scope with AI</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Extracted Fact Chips */}
            {extractedFacts && (
              <div className="pt-4 border-t border-[#F1EFEA] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#16805B]">
                    Extracted Use Parameters
                  </span>
                  {extractedFacts.parsedWithFallback && (
                    <span className="text-[10px] text-[#64748B] italic">
                      (Extracted via Heuristic Fallback)
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <div className="px-2.5 py-1 rounded-md bg-[#EEF4FE] border border-[#C6DCFD] text-xs font-semibold text-[#1769E0] flex items-center gap-1.5">
                    <span>Channels:</span>
                    <span className="font-mono">{extractedFacts.channels.join(", ")}</span>
                  </div>

                  <div className="px-2.5 py-1 rounded-md bg-[#F8FAFC] border border-[#CBD5E1] text-xs font-semibold text-[#334155] flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-[#64748B]" />
                    <span>Duration: {extractedFacts.durationDays} days</span>
                  </div>

                  <div className="px-2.5 py-1 rounded-md bg-[#F8FAFC] border border-[#CBD5E1] text-xs font-semibold text-[#334155] flex items-center gap-1.5">
                    <Globe className="w-3 h-3 text-[#64748B]" />
                    <span>Territories: {extractedFacts.territories.join(", ")}</span>
                  </div>

                  <div className="px-2.5 py-1 rounded-md bg-[#EDF7F2] border border-[#C6E6D6] text-xs font-semibold text-[#16805B] flex items-center gap-1.5">
                    <span>Commercial: {extractedFacts.commercialUse ? "Yes" : "No"}</span>
                  </div>

                  <div className="px-2.5 py-1 rounded-md bg-[#FEF2F2] border border-[#FECACA] text-xs font-semibold text-[#DC2626] flex items-center gap-1.5">
                    <span>AI Training: {extractedFacts.prohibitAiTraining ? "Prohibited" : "Permitted"}</span>
                  </div>

                  {extractedFacts.budgetLimitCents && (
                    <div className="px-2.5 py-1 rounded-md bg-[#FEF7ED] border border-[#FED7AA] text-xs font-semibold text-[#D97706] flex items-center gap-1.5">
                      <Coins className="w-3 h-3" />
                      <span>Budget: ${(extractedFacts.budgetLimitCents / 100).toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {/* Evidence Quote Callout */}
                {extractedFacts.evidenceQuotes?.budget && (
                  <div className="p-2.5 rounded bg-[#F8FAFC] border border-[#E2E8F0] text-[11px] text-[#64748B] flex items-start gap-1.5">
                    <Quote className="w-3.5 h-3.5 text-[#94A3B8] shrink-0 mt-0.5" />
                    <span>
                      Evidence quote: <em>&ldquo;{extractedFacts.evidenceQuotes.budget}&rdquo;</em> and <em>&ldquo;{extractedFacts.evidenceQuotes.territories}&rdquo;</em>
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Checkout Error Alert */}
          {checkoutError && (
            <div className="p-4 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#DC2626] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{checkoutError}</span>
            </div>
          )}
        </div>
      </div>

      {/* Evaluated License Tiers Rail */}
      <div className="space-y-6 pt-4">
        <div>
          <h2 className="text-2xl font-black text-[#091A2A] tracking-tight">
            Creator Licensing Policies & Compatibility
          </h2>
          <p className="text-xs text-[#64748B] mt-1">
            Evaluated by the deterministic rule engine against creator-authored permissions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(rankedTiers || initialPolicies.map((p) => ({
            policy: p,
            compatible: true,
            status: "compatible" as const,
            reasons: ["Standard creator licensing tier."],
            violations: [],
          }))).map((item) => {
            const { policy, status, violations, reasons } = item;
            const isRecommended = status === "recommended" || policy.highlightBadge === "Optimal Match";
            const isOverBudget = status === "over_budget";
            const isIncompatible = status === "incompatible";
            const isProcessingThis = isCheckingOut === policy.id;

            return (
              <div
                key={policy.id}
                className={`relative rounded-xl border p-6 flex flex-col justify-between transition-all bg-white ${
                  isRecommended
                    ? "border-2 border-[#16805B] shadow-lg ring-4 ring-[#16805B]/10"
                    : isIncompatible
                    ? "border-[#E2E8F0] opacity-80"
                    : "border-[#E4E2DB] shadow-sm"
                }`}
              >
                {/* Badge Header */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                      {policy.name}
                    </span>

                    {isRecommended && (
                      <span className="px-2.5 py-0.5 rounded-full bg-[#16805B] text-white text-[11px] font-bold flex items-center gap-1 shadow-sm">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Optimal Match</span>
                      </span>
                    )}

                    {isOverBudget && (
                      <span className="px-2 py-0.5 rounded-full bg-[#FEF7ED] border border-[#FED7AA] text-[#D97706] text-[11px] font-bold flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>Over Budget</span>
                      </span>
                    )}

                    {isIncompatible && (
                      <span className="px-2 py-0.5 rounded-full bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-[11px] font-bold flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        <span>Incompatible</span>
                      </span>
                    )}
                  </div>

                  {/* Price Display */}
                  <div>
                    <span className="text-3xl font-black text-[#091A2A]">
                      ${(policy.priceCents / 100).toFixed(2)}
                    </span>
                    <span className="text-xs text-[#64748B] ml-1.5 font-semibold">USD</span>
                  </div>

                  <p className="text-xs text-[#475569] leading-relaxed">
                    {policy.description}
                  </p>

                  {/* Permission List */}
                  <div className="pt-3 border-t border-[#F1EFEA] space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-[#475569]">
                      <span>Max Duration:</span>
                      <span className="font-semibold text-[#091A2A]">
                        {policy.permissions.maxDurationDays} days
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[#475569]">
                      <span>Territories:</span>
                      <span className="font-semibold text-[#091A2A]">
                        {policy.permissions.maxTerritories >= 999
                          ? "Worldwide"
                          : `Up to ${policy.permissions.maxTerritories} countries`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[#475569]">
                      <span>Commercial Use:</span>
                      <span className={`font-semibold ${policy.permissions.commercialUse ? "text-[#16805B]" : "text-[#DC2626]"}`}>
                        {policy.permissions.commercialUse ? "Permitted" : "Prohibited"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[#475569]">
                      <span>AI Model Training:</span>
                      <span className={`font-semibold ${policy.permissions.allowAiTraining ? "text-[#16805B]" : "text-[#DC2626]"}`}>
                        {policy.permissions.allowAiTraining ? "Allowed" : "Prohibited"}
                      </span>
                    </div>
                  </div>

                  {/* Reasons or Violations Box */}
                  {violations.length > 0 && (
                    <div className="p-3 rounded-lg bg-[#FEF2F2] border border-[#FECACA] space-y-1 text-[11px] text-[#DC2626]">
                      <span className="font-bold block">Compatibility Issues:</span>
                      {violations.map((v, i) => (
                        <p key={i}>• {v}</p>
                      ))}
                    </div>
                  )}

                  {reasons.length > 0 && isRecommended && (
                    <div className="p-3 rounded-lg bg-[#EDF7F2] border border-[#C6E6D6] space-y-1 text-[11px] text-[#16805B]">
                      <span className="font-bold block">Why this is recommended:</span>
                      {reasons.slice(0, 2).map((r, i) => (
                        <p key={i}>• {r}</p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Checkout Action Button */}
                <div className="pt-6 mt-4 border-t border-[#F1EFEA]">
                  <button
                    type="button"
                    onClick={() => handlePayPalCheckout(policy)}
                    disabled={isIncompatible || isProcessingThis || Boolean(isCheckingOut)}
                    className={`w-full py-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm ${
                      isRecommended
                        ? "bg-[#0070BA] hover:bg-[#005EA6] text-white"
                        : isIncompatible
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : "bg-[#091A2A] hover:bg-[#1769E0] text-white"
                    }`}
                  >
                    {isProcessingThis ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Authorizing with PayPal...</span>
                      </>
                    ) : (
                      <>
                        <span className="font-extrabold tracking-tight">
                          Pay with <span className="text-[#0079C1] bg-white px-1 py-0.5 rounded text-[10px]">PayPal</span>
                        </span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                  <span className="text-[10px] text-center block text-[#64748B] mt-1.5 font-medium">
                    PayPal Orders v2 · Server-Locked ${(policy.priceCents / 100).toFixed(2)} USD
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

