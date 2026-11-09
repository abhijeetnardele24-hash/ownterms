# Security Policy

## Core Security Tenets

OwnTerms treats intellectual property transactions, agentic commerce, and payment security as mission-critical systems.

### 1. The Autonomous Agent Security Boundary
- **Zero Financial Authority for LLMs:** AI models extract *intended-use facts only* (channels, duration, territory, exclusions). AI **never** decides pricing, currency, payee, payment capture, or licensing authorization.
- **Server-Side Price Authority:** All license fee calculations are evaluated deterministically on the server in integer cents. The client or autonomous agent cannot inject or modify the license fee.
- **Server-Side PayPal Order Creation:** Orders are created directly against the PayPal Orders v2 REST API from authenticated backend routes.

### 2. Cryptographic Rights Receipts
- Every completed transaction generates an immutable **Rights Receipt**.
- The receipt is hashed using canonical JSON serialization and SHA-256.
- The hash binds the exact transaction details: `orderId`, `captureId`, `assetId`, `licenseTier`, `payee`, `timestamp`, `scope`, and `sha256Hash`.
- Tampering with any byte invalidates the cryptographic signature.

### 3. API Key & Secret Protection
- Secret credentials (`PAYPAL_CLIENT_SECRET`, `GEMINI_API_KEY`, `PAYPAL_WEBHOOK_ID`) are never exposed to the frontend browser bundle.
- Only public identifiers (`NEXT_PUBLIC_PAYPAL_CLIENT_ID`) are accessible to the browser client.

## Reporting a Vulnerability

If you discover a security vulnerability in OwnTerms, please open a private GitHub security advisory or email the maintainers directly. Please do not report security issues through public issue trackers.

