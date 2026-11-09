# Devpost Project Draft: OwnTerms

## Tagline
*Your agent can use it—after it licenses it.*

## Elevator Pitch
OwnTerms brings machine-readable IP rights licensing to autonomous AI agents. Creators set permission policies; AI extracts intended-use facts; deterministic code matches licenses; and PayPal Orders v2 settles transactions into tamper-evident Rights Receipts.

---

## Inspiration
Autonomous agents are taking over digital production—generating ad campaigns, synthesizing datasets, designing apps, and fine-tuning models. But they operate without permission rails or standardized licensing mechanisms for creator work.

Creators want to monetize their work in AI pipelines without getting exploited. Enterprises deploying AI agents want transparent commercial clearance for their generated media.

We built **OwnTerms** to provide machine-readable permission and settlement rails for agentic commerce: turning digital creations into licensable rights instruments with verified PayPal settlement.

---

## What It Does

1. **Creator-Authored Rights Policies:** Creators attach machine-readable licensing tiers to their digital works (Editorial, Commercial Social, Extended Enterprise) defining permitted channels, maximum duration, geographic boundaries, and strict AI training exclusions.
2. **Quarantined AI Fact Extraction:** When an autonomous agent submits a natural language request, Google Gemini extracts factual parameters (channels, duration, territories, exclusions). By design, the AI model has **zero authority** over pricing, permissions, or payment capture.
3. **Deterministic License Matching Engine:** An integer-math rule engine matches extracted facts against creator policies, calculating exact compatibility and recommending the optimal tier (e.g. Commercial Social at \$69.00 vs Editorial at \$19.00).
4. **PayPal Orders v2 Server-Controlled Settlement:** The transaction is settled via PayPal Orders v2 (supporting both official PayPal Sandbox Smart Buttons and deterministic Fixture mode for automated evaluation). The price is strictly locked on the server; the client cannot manipulate costs. After approval, a server-side read-back check re-verifies capture status, amount, currency, and custom reference ID.
5. **Tamper-Evident Rights Receipts:** Every completed license generates a canonical JSON receipt bound by a SHA-256 digest. If an adversary tampers with a single character or price value, verification fails.
6. **Creator Control Room (AG Grid Community):** An enterprise-grade dashboard featuring AG Grid Community and a custom **Rights Coverage Matrix**, allowing creators to monitor transaction history, active licenses, and cross-territory channel distribution.

---

## How We Built It

- **Frontend & App Framework:** Next.js 16 (App Router), TypeScript, Tailwind CSS, Lucide icons.
- **PayPal Integration:** Official PayPal Orders v2 REST API (OAuth2, create, capture, read-back verification) + `@paypal/paypal-js` for Smart Buttons.
- **APIMatic PayPal Context Plugin:** Certified OpenAPI models and patterns via `npx context-plugins install paypal`.
- **AI Extraction Layer:** Google Gemini (`gemini-2.5-flash`) with Zod structured output schema, evidence quotes, and deterministic fallback heuristics.
- **Data & Grid Analytics:** AG Grid Community (`ag-grid-react`) providing an interactive creator control room and visual Rights Coverage matrix.
- **Durable Persistence:** SQLite with WAL mode (`better-sqlite3`), transactional settlement, and Render disk configuration (`render.yaml`).

---

## Challenges We Overcame

1. **The LLM Pricing Vulnerability:** Allowing an LLM to decide whether a user "deserves" a discount or qualifies for a license is an immense security flaw vulnerable to prompt injection. We established a strict architectural boundary: AI extracts facts; deterministic code enforces policies and prices.
2. **Cryptographic Receipt Canonization:** JSON object key ordering varies across runtimes. We engineered a canonical JSON serializer that normalizes object keys and formats before computing the SHA-256 hash.
3. **Truthful Boundary Reporting:** Built two distinct execution tracks—a deterministic Fixture mode for automated CI/judge testing and an official PayPal Sandbox mode ready for live buyer approval.

---

## Accomplishments That We're Proud Of

- Zero-hallucination licensing: AI never touches the cash or permissions.
- Full end-to-end PayPal Orders v2 integration with read-back verification and webhook integrity.
- AG Grid Community creator dashboard with an isolated Rights Coverage visualization.
- 100% original project-owned demo assets with transparent demo persona attribution.
- 37 / 37 automated tests passing alongside a full Playwright E2E suite across 3 viewports.

---

## Built With
- `paypal`
- `paypal-orders-v2`
- `apimatic`
- `ag-grid`
- `gemini`
- `next.js`
- `typescript`
- `sqlite`
- `render`

---

## Disclaimer
OwnTerms is a prototype demonstration built for the PayPal AI Hackathon; it does not constitute formal legal advice or proof of legal copyright registration.
