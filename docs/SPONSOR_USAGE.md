# Sponsor Tool Usage & Evidence

This document provides transparent, verifiable evidence for the use of each sponsor's technology in OwnTerms.

## 1. APIMatic (PayPal Context Plugin)

- **Requirement:** Integrate and utilize the APIMatic PayPal Context Plugin (`npx context-plugins install paypal`).
- **Installed Harnesses:**
  - Cursor: `~/.cursor/plugins/local/paypal`
  - VS Code: `~/.context-plugins/vscode/paypal`
  - Codex: `paypal@context-plugins`
- **Plugin Artifacts Verified:**
  - Full TypeScript OpenAPI model mappings: 40 operations, 5 resources, 284 models, 87 open enums.
  - Authoritative reference guides: `typescript-getting-started`, `typescript-authentication`, `typescript-calling-endpoints`, `typescript-models`, `typescript-integrate-paypal`.
- **Implementation in OwnTerms:**
  - Direct alignment with the APIMatic generated SDK signatures for PayPal Orders v2 (`/v2/checkout/orders`).
  - Strict typing of `AmountWithBreakdown`, `PurchaseUnitRequest`, `OrderApplicationContext`, and `OrderCaptureRequest`.

## 2. PayPal Developer Platform (Orders v2 REST API & JS SDK)

- **Server-Side REST Integration:**
  - OAuth 2.0 token exchange with basic authentication client credentials (`/v1/oauth2/token`).
  - Orders v2 Creation with `intent: "CAPTURE"`, strict server-side price binding, and metadata custom_id binding (`/v2/checkout/orders`).
  - Orders v2 Capture (`/v2/checkout/orders/{id}/capture`).
  - Orders v2 Read-back Verification: Re-fetching captured order state directly from PayPal Sandbox to verify payee, currency, captured amount, and status before issuing cryptographic Rights Receipt.
  - Webhook Signature Verification (`/v1/notifications/verify-webhook-signature`).
- **Client-Side JS SDK:**
  - `@paypal/paypal-js` used to render official PayPal Sandbox Smart Buttons.
  - Two-stage flow: `createOrder` calls backend `/api/checkout/create`, and `onApprove` calls backend `/api/checkout/[orderId]/capture`.

## 3. AG Grid / AG Studio (Creator Control Room)

- **Component:** `ag-grid-react` & `ag-grid-community` v36.3.0.
- **Surface:** `/control-room` (Creator Rights & Revenue Control Room).
- **Features Implemented:**
  - Multi-column sort, filter, and quick text search across all license transactions.
  - Custom Cell Renderers: Status badges, verified cryptographic hash pill with click-to-verify.
  - Original Custom Widget: **"Rights Coverage"** visual matrix showing asset licensing saturation across channels and territories.
  - Revenue KPI strip summarizing Gross License Revenue, Active Granted Rights, and Autonomous Agent Inquiries.

## 4. Render Cloud Hosting

- **Configuration:** `render.yaml` infrastructure-as-code descriptor.
- **Service Type:** Web Service running Next.js App Router on Node.js.
- **Build Command:** `pnpm install --frozen-lockfile && pnpm run build`.
- **Start Command:** `pnpm start`.
