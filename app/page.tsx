import Link from "next/link";
import Image from "next/image";
import { store } from "@/lib/store/repository";
import {
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Lock,
  FileCheck2,
  TableProperties,
  Cpu,
  BadgeCheck,
} from "lucide-react";

export default function HomePage() {
  const assets = store.getAssets();

  return (
    <main id="main-content" className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F4F3EF] to-[#FBFBFA] border-b border-[#E4E2DB] pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EDF7F2] border border-[#C6E6D6] text-xs font-semibold text-[#16805B] mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>PayPal AI Hackathon Project</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#091A2A] leading-tight">
              Your agent can use it—
              <br />
              <span className="text-[#1769E0]">after it licenses it.</span>
            </h1>

            <p className="mt-5 text-lg sm:text-xl text-[#475569] leading-relaxed">
              Autonomous AI agents are generating campaigns, fine-tuning models, and using creator work. OwnTerms provides machine-readable creator policies, quarantined AI intent extraction, deterministic license matching, and verified <strong>PayPal Orders v2</strong> settlement with tamper-evident Rights Receipts.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/assets/asset_night_market_01"
                className="px-6 py-3.5 rounded-lg bg-[#091A2A] text-white font-semibold text-sm hover:bg-[#1769E0] transition-colors shadow-md flex items-center gap-2 group focus-visible:outline-2 focus-visible:outline-[#1769E0]"
              >
                <span>Launch Flagship Demo</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/control-room"
                className="px-6 py-3.5 rounded-lg bg-white border border-[#CBD5E1] text-[#091A2A] font-semibold text-sm hover:bg-[#F8FAFC] transition-colors shadow-sm flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-[#1769E0]"
              >
                <TableProperties className="w-4 h-4 text-[#1769E0]" />
                <span>Creator Control Room</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pillars of Integrity */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-xl bg-white border border-[#E4E2DB] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#EDF7F2] text-[#16805B] flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#091A2A]">AI Fact Quarantine</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Gemini extracts intended-use facts only (channels, duration, territories). The model is strictly barred from setting prices or granting permissions.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white border border-[#E4E2DB] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#EEF4FE] text-[#1769E0] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#091A2A]">Deterministic Engine</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Zero hallucination. Integer minor cents rule matching guarantees exact compliance against creator-authored permissions and budget constraints.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white border border-[#E4E2DB] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#FEF7ED] text-[#D97706] flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#091A2A]">PayPal Orders v2</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Strict server-held pricing with PayPal Sandbox capture, read-back verification, and webhook signature verification.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white border border-[#E4E2DB] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#F3E8FF] text-[#9333EA] flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#091A2A]">SHA-256 Rights Receipt</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Every completed transaction issues a tamper-evident, canonical JSON receipt bound cryptographically with a SHA-256 digest to the PayPal capture ID.
            </p>
          </div>
        </div>
      </section>

      {/* Canonical Asset Catalog */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-[#091A2A] tracking-tight">
              Protected Creator Works
            </h2>
            <p className="text-sm text-[#64748B] mt-1">
              Select an asset to test autonomous agent intent extraction and PayPal licensing.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-[#F1EFEA] text-[#475569] rounded-full border border-[#E4E2DB]">
            3 Verified Assets Seeded
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {assets.map((asset) => {
            const policies = store.getPoliciesForAsset(asset.id);
            const lowestPrice = Math.min(...policies.map((p) => p.priceCents)) / 100;

            return (
              <div
                key={asset.id}
                className="bg-white rounded-xl border border-[#E4E2DB] overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                  <Image
                    src={asset.thumbnailUrl}
                    alt={asset.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    unoptimized
                  />
                  <div className="absolute top-3 left-3 bg-[#091A2A]/85 backdrop-blur-sm text-white px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wider">
                    {asset.assetType}
                  </div>
                  {asset.id === "asset_night_market_01" && (
                    <div className="absolute top-3 right-3 bg-[#16805B] text-white px-2 py-0.5 rounded text-[11px] font-bold shadow-sm">
                      Flagship Demo
                    </div>
                  )}
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#64748B] mb-1">
                      <span>{asset.creatorName}</span>
                      <span className="font-mono">{asset.creatorHandle}</span>
                    </div>
                    <h3 className="font-extrabold text-lg text-[#091A2A]">
                      {asset.title}
                    </h3>
                    <p className="text-xs text-[#475569] mt-2 line-clamp-2 leading-relaxed">
                      {asset.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#F1EFEA] flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-[#64748B] block">From</span>
                      <span className="text-lg font-bold text-[#091A2A]">
                        ${lowestPrice.toFixed(2)}
                      </span>
                      <span className="text-[11px] text-[#64748B] ml-1">USD</span>
                    </div>

                    <Link
                      href={`/assets/${asset.id}`}
                      className="px-4 py-2 rounded-lg bg-[#091A2A] text-white text-xs font-semibold hover:bg-[#1769E0] transition-colors flex items-center gap-1.5"
                    >
                      <span>License with Agent</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* The Agentic Commerce Problem vs OwnTerms Solution */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#091A2A] rounded-2xl p-8 sm:p-12 text-white space-y-8">
          <div className="max-w-2xl space-y-3">
            <span className="text-xs uppercase font-bold tracking-widest text-[#60A5FA]">
              The White Space
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Why autonomous agents need OwnTerms
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Traditional stock agencies offer annual human contracts. AI chatbots guess prices and hallucinate discounts. OwnTerms provides machine-enforceable certainty.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-700">
            <div className="space-y-3 p-5 rounded-xl bg-slate-800/50 border border-red-500/30">
              <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                <span>✕ The Unlicensed Agent Scrape</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Autonomous marketing agent scrapes a copyrighted image without clear rights. Enterprise client receives a legal cease-and-desist or copyright claim. Creator receives \$0.
              </p>
            </div>

            <div className="space-y-3 p-5 rounded-xl bg-slate-800/50 border border-green-500/30">
              <div className="flex items-center gap-2 text-green-400 font-bold text-sm">
                <BadgeCheck className="w-4 h-4" />
                <span>✓ The OwnTerms Machine-Settled Journey</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Agent submits intended-use parameters. Deterministic engine matches the \$69 Commercial Social tier. PayPal Orders v2 settles funds to creator. Cryptographic Rights Receipt proves compliance.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
