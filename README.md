# OwnTerms

> *"Your agent can use it—after it licenses it."*

**OwnTerms** brings machine-readable intellectual property licensing and payment rails to autonomous AI agents. Creators set granular permission policies; Google Gemini extracts intended-use facts in a strictly quarantined layer; our deterministic rule engine matches compatible licenses; and **PayPal Orders v2** settles transactions into tamper-evident Rights Receipts sealed with a canonical SHA-256 digest.

Built for the **PayPal AI Hackathon** on Devpost.

---

## ⚡ The Architecture: 4 Pillars of Integrity

```
[Agent Natural Language Request]
             │
             ▼
┌────────────────────────────────────────┐
│ Stage 1: AI Intent Fact Quarantine     │ ──► Extracts factual use parameters (Channels,
│ (Google Gemini 2.5 Flash)              │     Duration, Territories, AI restrictions).
└────────────────────────────────────────┘     Zero pricing authority. Zero permissions power.
             │
             ▼
┌────────────────────────────────────────┐
│ Stage 2: Deterministic Rule Engine     │ ──► Compares extracted facts against creator
│ (Integer Math & Policy Matcher)        │     policies. Enforces budget caps.
└────────────────────────────────────────┘     Zero hallucination.
             │
             ▼
┌────────────────────────────────────────┐
│ Stage 3: PayPal Orders v2 Settlement   │ ──► Creates server-locked Orders v2 with
│ (REST API & Idempotency)               │     PayPal-Request-Id, buyer approval,
└────────────────────────────────────────┘     server capture, and read-back verification.
             │
             ▼
┌────────────────────────────────────────┐
│ Stage 4: Cryptographic Settlement      │ ──► Serializes canonical JSON and computes
│ (SHA-256 Rights Receipt & AG Grid)     │     tamper-evident digest. Verifiable anywhere.
└────────────────────────────────────────┘
```

---

## 🏆 Sponsor Tool Implementations

- **PayPal Platform:** Direct integration with PayPal Orders v2 REST API (`/v2/checkout/orders`), OAuth2 client credentials, server-controlled capture, read-back verification, and webhook signature verification (`/v1/notifications/verify-webhook-signature`).
- **APIMatic:** Installed and referenced official PayPal context plugin artifacts (`npx context-plugins install paypal`) in VS Code and Codex to conform strictly to PayPal TypeScript OpenAPI schemas.
- **AG Grid Community:** Powers the Creator Rights & Revenue Control Room (`/control-room`) featuring an original custom widget: **"Rights Coverage Matrix"** tracking cross-territory channel saturation.
- **Google Gemini:** Quarantined structured intent extraction using Gemini structured output with verbatim quotation citations and deterministic fallback failover.
- **Render:** Cloud web service deployment configured via `render.yaml` with persistent disk and health check.

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- Node.js 20+
- pnpm 10+ (or npm)

### 2. Setup
```bash
# Clone and navigate to repository
cd ownterms

# Install dependencies
pnpm install

# Seed canonical demo assets & creator policies
pnpm run seed
```

### 3. Verify the Entire Test Suite
```bash
# Run unit, integration & security regression tests (37 tests, ~550ms)
pnpm test

# Run deployment and persistence verification gate (7/7 gates)
pnpm run verify:deploy

# Run Playwright E2E browser verification across viewports
pnpm run test:e2e

# Run linter
pnpm run lint

# Run production build
pnpm run build
```

### 4. Start Development Server
```bash
pnpm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔒 Security & Anti-Tamper Guarantees

1. **Zero Financial Hallucination:** The AI model is strictly quarantined in Stage 1. It extracts factual parameters only. It cannot alter pricing, grant discounts, or authorize licenses.
2. **Server-Side Price Authority:** Internal prices are calculated in integer minor cents (USD) and injected directly into PayPal Orders v2 payloads on the server. Client-supplied prices are strictly ignored.
3. **Tamper-Evident Rights Receipts:** Every transaction generates a JSON receipt bound by a canonical SHA-256 digest. Modifying any byte (e.g. changing tier or price) immediately causes verification failure.
4. **Idempotent Capture & Webhook Deduplication:** Enforced by `PayPal-Request-Id` and database-level unique constraints.

---

## 📄 Documentation Directory

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — Detailed system design and component flowcharts.
- [`docs/THREAT_MODEL.md`](docs/THREAT_MODEL.md) — Adversarial threat vectors and mitigations.
- [`docs/PAYPAL_INTEGRATION.md`](docs/PAYPAL_INTEGRATION.md) — PayPal Orders v2 architecture and read-back verification.
- [`docs/SPONSOR_USAGE.md`](docs/SPONSOR_USAGE.md) — Evidence of APIMatic, PayPal, AG Grid, and Render integrations.
- [`docs/TEST_EVIDENCE.md`](docs/TEST_EVIDENCE.md) — Raw test outputs and verification proofs.
- [`docs/SANDBOX_EVIDENCE.md`](docs/SANDBOX_EVIDENCE.md) — Dual execution modes (`fixture` vs `sandbox`).
- [`submission/ASSET_PROVENANCE.md`](submission/ASSET_PROVENANCE.md) — 100% original project-owned demo assets with SHA-256 digests.
- [`submission/JUDGE_QUICKSTART.md`](submission/JUDGE_QUICKSTART.md) — 2-minute judge evaluation guide.
- [`submission/DEMO_SCRIPT.md`](submission/DEMO_SCRIPT.md) — Canonical demo walkthrough script.
- [`submission/DEVPOST_DRAFT.md`](submission/DEVPOST_DRAFT.md) — Complete Devpost submission draft.
- [`submission/HANDOFF.md`](submission/HANDOFF.md) — Final verified release candidate handoff for Codex.

---

## ⚖️ License & Disclaimer

- Distributed under the Apache License, Version 2.0. See [`LICENSE`](LICENSE) for details.
- OwnTerms is a demonstration prototype developed for the PayPal AI Hackathon; it does not constitute formal legal advice or statutory copyright registration.
