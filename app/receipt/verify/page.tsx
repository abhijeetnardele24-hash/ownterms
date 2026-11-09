"use client";

import { useState } from "react";
import { verifyRightsReceipt } from "@/lib/receipts/canonical-receipt";
import { ShieldCheck, CheckCircle2, AlertTriangle, FileSearch } from "lucide-react";

export default function VerifyPage() {
  const [jsonInput, setJsonInput] = useState("");
  const [result, setResult] = useState<{
    tested: boolean;
    valid?: boolean;
    computedHash?: string;
    expectedHash?: string;
    error?: string;
  }>({ tested: false });

  const handleVerify = () => {
    try {
      if (!jsonInput.trim()) {
        setResult({ tested: true, error: "Please paste a JSON receipt object to verify." });
        return;
      }
      const parsed = JSON.parse(jsonInput);
      const res = verifyRightsReceipt(parsed);
      setResult({
        tested: true,
        valid: res.valid,
        computedHash: res.computedHash,
        expectedHash: res.expectedHash,
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Malformed JSON input";
      setResult({ tested: true, error: "Invalid JSON format: " + message });
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#1769E0] mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>Independent Verifier</span>
        </div>
        <h1 className="text-3xl font-black text-[#091A2A] tracking-tight">
          Verify Rights Receipt Authenticity
        </h1>
        <p className="text-sm text-[#475569] mt-1">
          Paste any Rights Receipt JSON to re-calculate its canonical SHA-256 signature and test for tampering.
        </p>
      </div>

      <div className="p-6 rounded-xl bg-white border border-[#E4E2DB] shadow-sm space-y-4">
        <label className="text-xs font-bold text-[#091A2A] block">
          Paste Raw Receipt JSON
        </label>
        <textarea
          rows={8}
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder={`{\n  "receiptId": "rcpt_...",\n  "canonicalSha256": "...",\n  "licenseTier": "commercial_social",\n  ...\n}`}
          className="w-full p-3 rounded-lg border border-[#CBD5E1] text-xs font-mono text-[#091A2A] focus:outline-none focus:ring-2 focus:ring-[#1769E0]"
        />

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleVerify}
            className="px-5 py-2.5 rounded-lg bg-[#091A2A] text-white text-xs font-bold hover:bg-[#1769E0] transition-colors flex items-center gap-2 shadow-sm"
          >
            <FileSearch className="w-4 h-4" />
            <span>Verify Cryptographic Signature</span>
          </button>
        </div>

        {result.tested && (
          <div className="pt-4 border-t border-[#F1EFEA]">
            {result.error ? (
              <div className="p-4 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#DC2626]">
                {result.error}
              </div>
            ) : result.valid ? (
              <div className="p-4 rounded-xl bg-[#EDF7F2] border border-[#C6E6D6] text-[#16805B] flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-sm">Cryptographic Verification Passed!</h4>
                  <p className="text-xs opacity-90">
                    The receipt payload matches the embedded SHA-256 hash perfectly. No modifications or tampering detected.
                  </p>
                  <p className="font-mono text-[11px] break-all pt-1">
                    Digest: {result.computedHash}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-sm">Verification Failed — Receipt Has Been Tampered!</h4>
                  <p className="text-xs opacity-90">
                    The recalculated hash of the payload does not match the signed hash. At least one field (price, tier, scope, or capture ID) was altered.
                  </p>
                  <p className="font-mono text-[11px] break-all pt-1">
                    Expected: {result.expectedHash}
                    <br />
                    Computed: {result.computedHash}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

