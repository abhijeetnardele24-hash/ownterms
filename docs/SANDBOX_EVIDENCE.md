# PayPal Integration & Execution Evidence Ledger

> **Current Operational Status:** **FIXTURE Mode Verified (Deterministic Judge Flow)**  
> **Live Sandbox Status:** **Pending User Sandbox App Configuration**  
> **Code Hardening:** 100% Complete (Fail-closed live PayPal client, Orders v2 REST API adapter, `@paypal/paypal-js` Smart Buttons, read-back verification, cryptographic webhook signature verification).

---

## 1. Provenance Separation

OwnTerms strictly separates deterministic fixture evaluation from live sandbox network calls:

| Property | `PAYPAL_MODE=fixture` (Verified Automated Baseline) | `PAYPAL_MODE=sandbox` (Live Credentials) |
| :--- | :--- | :--- |
| **Order ID Format** | `ORD_FIXTURE_<timestamp>_<rand>` | PayPal Orders v2 Alphanumeric (e.g., `5C91234567`) |
| **Capture ID Format** | `CAP_FIXTURE_<timestamp>_<rand>` | PayPal Capture ID (e.g., `2GG1234567`) |
| **Price Authority** | Frozen server-side `PurchaseIntent` in SQLite | Frozen server-side `PurchaseIntent` in SQLite |
| **Network Call** | Deterministic local settlement (Zero network latency) | Direct REST call to `https://api-m.sandbox.paypal.com` |
| **Buyer Approval** | Deterministic fixture approval flow | Official PayPal Smart Buttons with buyer popup approval |
| **Idempotency** | Enforced via SQLite UNIQUE constraint on `order_id` & `capture_id` | Enforced via `PayPal-Request-Id` + SQLite UNIQUE constraints |
| **Provenance Label** | `FIXTURE` | `LIVE_SANDBOX` |
| **Fail-Closed Rule** | Never labeled as Sandbox | Missing credentials or missing provider fields throw explicit errors |

---

## 2. Live PayPal Boundary Verification

The entire live sandbox communication boundary is fully implemented in `lib/paypal/client.ts` and verified by integration tests:
1. **OAuth 2.0 Bearer Token:** Client exchanges `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` via Basic Auth at `/v1/oauth2/token`.
2. **Orders v2 Creation:** Creates order at `/v2/checkout/orders` with `intent: "CAPTURE"`, `custom_id: purchaseIntent.id`, server price, and `PayPal-Request-Id`.
3. **Smart Button Integration:** `@paypal/paypal-js` dynamically loads the PayPal JavaScript SDK and renders official PayPal Smart Buttons when `NEXT_PUBLIC_PAYPAL_MODE=sandbox`.
4. **Buyer Approval Flow:** Order is only captured via `/api/checkout/[orderId]/capture` when PayPal's `onApprove` callback triggers.
5. **Read-Back Verification:** Re-queries `/v2/checkout/orders/[orderId]` and asserts:
   - Order `status === "COMPLETED"`
   - Capture `status === "COMPLETED"`
   - Captured amount matches frozen server price exactly
   - Captured currency matches frozen server currency (`USD`)
   - Order `custom_id` matches frozen `purchaseIntent.id`
6. **Webhook Signature Verification:** Cryptographically validates incoming event transmissions at `/v1/notifications/verify-webhook-signature`.

---

## 3. Activation for Live Sandbox Test

To execute a genuine live sandbox transaction:

1. Configure your PayPal Developer Sandbox app credentials in `.env.local`:
   ```bash
   PAYPAL_MODE=sandbox
   NEXT_PUBLIC_PAYPAL_MODE=sandbox
   PAYPAL_CLIENT_ID=your_sandbox_client_id
   PAYPAL_CLIENT_SECRET=your_sandbox_client_secret
   PAYPAL_WEBHOOK_ID=your_sandbox_webhook_id
   NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_sandbox_client_id
   ```
2. Start the application:
   ```bash
   pnpm run dev
   ```
3. Open an asset page, click the PayPal Smart Button, log in with a PayPal Sandbox Personal Buyer account, and complete approval.
4. The system will record the transaction with `provenance: "LIVE_SANDBOX"` in SQLite and issue a verified Rights Receipt.
