# Test Evidence & Verification Ledger

This ledger records fresh terminal command execution results for OwnTerms across all layers.

---

## 1. Unit & Security Regression Test Suite (`pnpm test`)

- **Command:** `pnpm test` (Vitest v5.1.0)
- **Execution Date:** 2026-11-09T09:09:10+05:30
- **Duration:** 531ms
- **Outcome:** **27 Passed (100%), 0 Failed**

| Test File | Category | Tests Passed | Key Assertions |
| --- | --- | --- | --- |
| `tests/unit/policy/evaluate-license.ts` | Policy Engine | 6 / 6 | Commercial use, duration, territories, AI prohibition, budget cap |
| `tests/unit/policy/rank-licenses.ts` | Policy Engine | 2 / 2 | Deterministic ranking, optimal match recommendation |
| `tests/unit/receipts/canonical-receipt.ts` | Cryptography | 5 / 5 | Canonical JSON key sorting, SHA-256 digest, 4-way anti-tamper |
| `tests/unit/ai/extract-intent.ts` | AI Intent Quarantine | 3 / 3 | Deterministic fact extraction, word boundaries, evidence quotes |
| `tests/integration/intent-route.ts` | API Route | 2 / 2 | `/api/intent/parse` validation and policy evaluation |
| `tests/integration/checkout-flow.ts` | Checkout Engine | 1 / 1 | Full create order -> capture -> receipt mint -> ledger update |
| `tests/integration/security-regressions.ts` | Security & Adversarial | 8 / 8 | Incompatible use reject, client price tamper ignore, missing intent reject, idempotent capture, fixture provenance check, webhook signature reject, webhook deduplication, receipt byte tamper reject |

---

## 2. Playwright End-to-End Suite (`pnpm run test:e2e`)

- **Command:** `pnpm run test:e2e` (Playwright v1.65.0, Chromium Headless Shell v1254)
- **Execution Date:** 2026-11-09T09:13:46+05:30
- **Duration:** 8.8s
- **Outcome:** **3 Passed (100%), 0 Failed**

| Test Scenario | Viewport | Status | Evidence Produced |
| --- | --- | --- | --- |
| **Canonical Hackathon Demo Journey** | 1440 × 900 (Desktop) | **PASSED** | Catalog -> Intent Extraction -> $69 Match -> PayPal Checkout -> Receipt -> Anti-Tamper -> Control Room (`01` through `06` screenshots) |
| **Laptop Viewport Presentation** | 1280 × 720 (Laptop) | **PASSED** | Clean asset layout, responsive chips (`07-asset-detail-1280.png`) |
| **Mobile Viewport Presentation** | 390 × 844 (Mobile) | **PASSED** | Responsive navigation, single-column cards (`08`, `09`, `10` screenshots) |

---

## 3. Live Model Evaluation (`pnpm run test:live-ai`)

- **Command:** `pnpm run test:live-ai` (`scripts/eval-live-model.ts`)
- **Execution Date:** 2026-11-09T09:00:16+05:30
- **Latency:** 2941ms
- **Provenance:** `LIVE_MODEL`
- **Model:** `gemini-2.5-flash`
- **Result:** Successfully extracted `channels: ["instagram_ad"]`, `durationDays: 30`, `territories: ["IN", "SG"]`, `commercialUse: true`, `prohibitAiTraining: true`, `budgetLimitCents: 8000` with verbatim quotation evidence.

---

## 4. Static Analysis & Production Build

- **Linter:** `pnpm run lint` -> **0 errors, 0 warnings**
- **Production Build:** `pnpm run build` (Next.js 16.4.5 Turbopack) -> **Compiled successfully in 818ms, all 13 routes generated**.
