# Test Evidence & Verification Ledger

> **Last Updated:** 2026-11-09T10:05:00+05:30  
> **Release Target:** PayPal AI Hackathon  
> **Commit Verified:** Release Hardening Phase

---

## 1. Unit & Security Regression Test Suite (`pnpm test`)

- **Command:** `pnpm test` (Vitest v5.1.0)
- **Outcome:** **37 Passed (100%), 0 Failed** across 8 test suites
- **Execution Duration:** ~550ms

| Test File | Category | Tests | Key Invariants Asserted |
| :--- | :--- | :--- | :--- |
| `tests/unit/analytics/coverage-matrix.test.ts` | Analytics Isolation | 4 / 4 | Isolated cell matching, territory normalization, explicit worldwide coverage |
| `tests/unit/policy/evaluate-license.test.ts` | Deterministic Policy Engine | 6 / 6 | Commercial use, duration, territories, AI training prohibition, budget cap |
| `tests/unit/policy/rank-licenses.test.ts` | Deterministic Policy Engine | 2 / 2 | Deterministic tier ranking, optimal match selection |
| `tests/unit/receipts/canonical-receipt.test.ts` | Cryptography & Minting | 5 / 5 | Canonical JSON key sorting, SHA-256 digest, 4-way anti-tampering detection |
| `tests/unit/ai/extract-intent.test.ts` | AI Intent Quarantine | 7 / 7 | Fallback heuristics, live JSON parsing, HTTP 429 failover, malformed JSON handling, timeout abort |
| `tests/integration/intent-route.test.ts` | API Route | 2 / 2 | `/api/intent/parse` validation and ranking |
| `tests/integration/checkout-flow.test.ts` | Checkout Engine | 1 / 1 | Full create order -> capture -> receipt mint -> ledger update |
| `tests/integration/security-regressions.test.ts` | Adversarial Security | 10 / 10 | Commercial ad reject on Editorial, client price tamper ignore, missing intent reject, idempotent capture, fixture provenance check, webhook signature reject, webhook deduplication, receipt byte tamper reject, ORDER_CREATED initial state, concurrent capture idempotency |

---

## 2. Playwright End-to-End Suite (`pnpm run test:e2e`)

- **Command:** `pnpm run test:e2e` (Playwright v1.65.0, Chromium Headless Shell)
- **Duration:** 6.6s
- **Outcome:** **3 Passed (100%), 0 Failed**
- **Provenance Standard:** `FIXTURE` (Deterministic Judge Flow)

| Scenario | Viewport | Status | Evidence Produced |
| :--- | :--- | :--- | :--- |
| **Canonical Demo Journey** | 1440 × 900 (Desktop) | **PASSED** | Catalog -> Intent Extraction -> $69 Match -> Settle License -> Machine-Readable Receipt -> Anti-Tamper -> Control Room (`01` through `06` screenshots) |
| **Laptop Viewport Presentation** | 1280 × 720 (Laptop) | **PASSED** | Clean asset layout, responsive chips (`07-asset-detail-1280.png`) |
| **Mobile Viewport Presentation** | 390 × 844 (Mobile) | **PASSED** | Responsive navigation, single-column cards (`08`, `09`, `10` screenshots) |

---

## 3. Deployment & Persistence Verification Gate (`pnpm run verify:deploy`)

- **Command:** `pnpm run verify:deploy` (`scripts/verify-deployment.ts`)
- **Outcome:** **7 / 7 Gates PASSED**

1. `[1] Runtime Mode:` FIXTURE (Deterministic Judge Fixture Flow active)
2. `[2] SQLite Database Path:` Verified at `data/ownterms.db` (configurable via `OWNTERMS_DB_PATH`)
3. `[3] Persistent Directory Writable:` PASSED (Write/unlink check succeeded)
4. `[4] Database Schema Integrity:` PASSED (All 5 tables verified: `idempotency`, `ledger`, `purchase_intents`, `receipts`, `webhook_events`)
5. `[5] Receipt Uniqueness & Fail-Closed Overwrite Prevention:` PASSED (SQLite `UNIQUE(order_id)` constraint prevents duplicate or silent replacement)
6. `[6] Ledger Provenance Tags Recorded:` `[SEEDED, FIXTURE]`
7. `[7] Public Health Endpoint (/api/health):` PASSED (HTTP 200, status: ok)

---

## 4. Live Model Evaluation (`pnpm run test:live-ai`)

- **Command:** `pnpm run test:live-ai` (`scripts/eval-live-model.ts`)
- **Model:** `gemini-2.5-flash`
- **Behavior Standard:** Fails gracefully with normal nonzero exit code and `LIVE_MODEL_UNAVAILABLE` label when rate-limited (HTTP 429), never claiming fallback is a live response.
- **Dated Live Success Record:** 2026-11-09T09:44:59+05:30 (Elapsed: 4278ms, `parsedWithFallback: false`).

---

## 5. Static Code Quality & Production Build

- **ESLint:** `pnpm run lint` -> **0 errors, 0 warnings**
- **Production Build:** `pnpm run build` (Next.js 16.4.5 Turbopack) -> **Compiled successfully in 806ms, TypeScript finished in 2.7s, all 14 routes generated**.
