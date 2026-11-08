# Known Limitations & Edge Cases

## 1. Scope Boundaries
- **Currencies:** The current implementation processes transactions in USD. Multi-currency settlement (EUR, GBP, INR) is architected via the integer minor cents schema but defaults to USD for Sandbox stability.
- **Dispute Resolution:** In this release, refunds are handled via direct PayPal dispute channels. Automated partial-use refund calculations are scheduled for v2.
- **Offline / Low-Connectivity Fallback:** When the external Gemini API is unreachable or rate-limited, the system falls back gracefully to a deterministic heuristic keyword extractor to ensure checkout never fails.

## 2. Sandbox vs Production Nuances
- Transactions are executed on `api-m.sandbox.paypal.com`. Real money is not moved.
- PayPal Sandbox accounts occasionally encounter intermittent sandbox latency or authentication rate limits. The application implements exponential backoff retries.
