# Test Evidence & Verification Ledger

This ledger tracks the verifiable test execution for OwnTerms across all vertical slices.

## Test Matrix

| Slice | Test Target | Framework | Status | Evidence Log |
| --- | --- | --- | --- | --- |
| **Slice 1: Policy Engine** | `tests/unit/policy/evaluate-license.test.ts` | Vitest | Pending | Will record command & assertions |
| **Slice 1: Policy Engine** | `tests/unit/policy/rank-licenses.test.ts` | Vitest | Pending | Will record command & assertions |
| **Slice 2: AI Intent Parser** | `tests/unit/ai/extract-intent.test.ts` | Vitest | Pending | Will record command & assertions |
| **Slice 3: Receipt Hasher** | `tests/unit/receipts/canonical-receipt.test.ts` | Vitest | Pending | Will record command & assertions |
| **Slice 4: PayPal API Client** | `tests/integration/paypal-client.test.ts` | Vitest | Pending | Will record command & assertions |
| **Slice 5: End-to-End Flow** | `tests/e2e/canonical-journey.test.ts` | Playwright | Pending | Will record command & assertions |

## Evidence Verification Policy
Every entry in this ledger must be backed by raw terminal execution logs from `pnpm test` and `pnpm run test:e2e`.
No simulated or mocked test outputs may be reported as live without explicit disclosure.
