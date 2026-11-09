# Truthful Sponsor Tool Usage & Evidence

This document provides transparent, verifiable evidence for the use of each sponsor's technology in OwnTerms, strictly conforming to observed realities.

---

## 1. APIMatic (PayPal Context Plugin)

- **Official Context Plugin CLI Version:** `v1.29+` (`npx context-plugins install paypal`).
- **Verified Installed Harnesses:**
  - **Codex:** Verified plugin entry `paypal@context-plugins`.
  - **VS Code:** Verified plugin installation directory at `~/.context-plugins/vscode/paypal`.
  - *Disclosure:* Cursor plugin was not confirmed in this test environment.
- **Authoritative Reference Guides Utilized:**
  - `skills/typescript/typescript-getting-started/SKILL.md`: Analyzed official PayPal TypeScript SDK structure, OAuth 2.0 client credential authentication patterns, and server environment URL overrides (`https://api-m.sandbox.paypal.com`).
  - `skills/typescript/typescript-integrate-paypal/SKILL.md`: Direct integration workflows for PayPal checkout lifecycle.
  - `skills/typescript/typescript-models/reference.md`: Exact schema specifications for Orders v2 requests (`purchase_units`, `amount`, `custom_id`, `items`, and `application_context`).
- **Implementation Strategy:**
  - Rather than importing an unbuilt, non-npm git repository at runtime, OwnTerms implemented a resilient, strictly typed server client in `lib/paypal/client.ts` directly adhering to the APIMatic OpenAPI data contracts and header rules (including `PayPal-Request-Id` idempotency).

---

## 2. PayPal Developer Platform (Orders v2 REST API & Checkout Lifecycle)

- **Runtime Execution Modes:**
  - **`PAYPAL_MODE=fixture` (Default Offline / CI):** Generates deterministic `ORD_FIXTURE_*` and `CAP_FIXTURE_*` records using the exact frozen server price and creator payee details. Strictly labeled with `provenance: "FIXTURE"`. Never claims live execution.
  - **`PAYPAL_MODE=sandbox` (Live Sandbox Verification):** Fails closed if `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` are missing. Executes real OAuth2 exchange (`/v1/oauth2/token`), Orders v2 creation (`POST /v2/checkout/orders`), capture (`POST /v2/checkout/orders/{id}/capture`), read-back verification (`GET /v2/checkout/orders/{id}`), and webhook signature verification (`POST /v1/notifications/verify-webhook-signature`).
- **Architectural Security Guarantees:**
  - **Frozen Purchase Intent:** A server-side `PurchaseIntent` is minted and hashed before order creation. The capture endpoint receives ONLY `{ purchaseIntentId }`—the client has zero authority over price, asset, tier, or granted scope.
  - **Read-Back Verification:** Every capture is verified against the PayPal REST API for order status, exact minor amount, currency, custom reference, and capture ID before a Rights Receipt is minted.
  - **Idempotency:** Protected by `PayPal-Request-Id` and database-level unique order constraints.

---

## 3. AG Grid (Creator Control Room)

- **Installed Framework:** `ag-grid-community` & `ag-grid-react` v36.3.0.
- *Truthful Scope Disclosure:* OwnTerms utilizes **AG Grid Community**, not AG Studio Enterprise. No unverified AG Studio Agent Framework claims are made.
- **Surface:** `/control-room` (Creator Rights & Revenue Control Room).
- **Features Implemented:**
  - Multi-column sort, quick text filter, and custom status pills.
  - **Provenance Column:** Explicitly exposes row-level provenance (`LIVE_SANDBOX`, `FIXTURE`, or `SEEDED`).
  - **Click-to-Verify Cryptographic Hash:** Monospace SHA-256 pills linking directly to the independent receipt verifier.
- **Original Sponsor Widget — "Rights Coverage" Visual Matrix:**
  - Bespoke heatmap matrix mapping distribution channels (Instagram Ads, TikTok Ads, YouTube Ads, Web Embed, Global Campaign) across geographic territories (India, Singapore, US, UK, Global).
  - Dynamically calculates active clearances directly from the SQLite transaction ledger.

---

## 4. Render Cloud Hosting & Persistence

- **Configuration:** `render.yaml` infrastructure-as-code descriptor.
- **Web Service:** Node.js App Router running Next.js.
- **Build Command:** `pnpm install --frozen-lockfile && pnpm run build`.
- **Start Command:** `pnpm start`.
- **Persistence Strategy:**
  - Local / Demo: Synchronous, WAL-mode SQLite database (`data/ownterms.db`) powered by `better-sqlite3`.
  - Cloud Production: Configured for Render persistent disk mount (`/var/data/ownterms.db`) or PostgreSQL migration.
