# PayPal Sandbox Execution & Verification Ledger

This document tracks execution evidence for PayPal Sandbox and Fixture transactions in OwnTerms.

---

## 1. Dual Execution Modes

| Property | `PAYPAL_MODE=fixture` (Current Verified Baseline) | `PAYPAL_MODE=sandbox` (Live Credentials) |
| --- | --- | --- |
| **Order ID Format** | `ORD_FIXTURE_<timestamp>_<rand>` | PayPal Orders v2 Alphanumeric (e.g. `5C91234567`) |
| **Capture ID Format** | `CAP_FIXTURE_<timestamp>_<rand>` | PayPal Capture ID (e.g. `2GG1234567`) |
| **Price Authority** | Frozen server-side `PurchaseIntent` | Frozen server-side `PurchaseIntent` |
| **Network Call** | Deterministic local settlement (Zero network latency) | Direct REST call to `api-m.sandbox.paypal.com` |
| **Idempotency** | Supported via SQLite key cache | Enforced via `PayPal-Request-Id` + SQLite |
| **Provenance Label** | `FIXTURE` | `LIVE_SANDBOX` |
| **Fail-Closed Rule** | N/A | Missing credentials throws explicit config error |

---

## 2. Live Sandbox Activation Instructions

When you are ready to execute a live PayPal Sandbox transaction through the official PayPal Sandbox portal:

1. Create a Sandbox REST App in the [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/applications/sandbox).
2. Add your credentials into `.env.local`:
   ```bash
   PAYPAL_MODE=sandbox
   PAYPAL_CLIENT_ID=your_actual_sandbox_client_id
   PAYPAL_CLIENT_SECRET=your_actual_sandbox_client_secret
   PAYPAL_WEBHOOK_ID=your_actual_sandbox_webhook_id
   NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_actual_sandbox_client_id
   ```
3. Run `pnpm run dev` and complete checkout with your sandbox personal buyer account.
4. Save the sanitized raw JSON read-back response from PayPal into this ledger.
