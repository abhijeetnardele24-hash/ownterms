# Devpost Submission Draft: OwnTerms

## Tagline
*Your agent can use it—after it licenses it.*

## Elevator Pitch
OwnTerms brings machine-readable IP rights licensing to autonomous AI agents. Creators set permission policies; AI extracts intended-use facts; deterministic code matches licenses; and PayPal Orders v2 settles transactions into tamper-evident Rights Receipts.

---

## Inspiration
Autonomous agents are taking over digital production—generating ad campaigns, synthesizing datasets, designing apps, and fine-tuning models. But they operate in a copyright wasteland: scraping creator work without permission, licenses, or payment rails.

Creators want to monetize their work in AI pipelines without getting exploited. Enterprises deploying AI agents want legal certainty that their generated media has verified commercial clearance.

We built **OwnTerms** to provide the missing economic and legal rails for agentic commerce: turning digital creations into machine-licensable rights instruments with instant PayPal settlement.

---

## What It Does

1. **Creator-Authored Rights Policies:** Creators attach machine-readable licensing tiers to their digital works (Editorial, Commercial Social, Extended Enterprise) defining permitted channels, maximum duration, geographic boundaries, and strict AI training exclusions.
2. **Quarantined AI Fact Extraction:** When an autonomous agent submits a natural language request, Google Gemini extracts factual parameters (channels, duration, territories, exclusions). By design, the AI model has **zero authority** over pricing, permissions, or payment capture.
3. **Deterministic License Matching Engine:** An integer-math rule engine matches extracted facts against creator policies, calculating exact compatibility and recommending the optimal tier (e.g. Commercial Social at \$69.00 vs Editorial at \$19.00).
4. **PayPal Orders v2 Server-Controlled Settlement:** The transaction is settled via PayPal Sandbox Orders v2. The price is strictly locked on the server; the client cannot manipulate costs. After approval, a server-side read-back check re-verifies capture status.
5. **Cryptographic Rights Receipts:** Every completed license generates a canonical JSON receipt bound by a SHA-256 hash. If an agent tampers with a single character, verification fails.
6. **Creator Control Room (AG Grid):** An enterprise-grade dashboard featuring AG Grid and our original **"Rights Coverage"** custom widget, allowing creators to monitor live agent inquiries, active licenses, and global channel distribution.

---

## How We Built It

- **Frontend & App Framework:** Next.js 16 (App Router), TypeScript, Tailwind CSS, Lucide icons.
- **PayPal Integration:** Official PayPal Orders v2 REST API (OAuth2, create, capture, read-back verification) + `@paypal/paypal-js` for Smart Buttons.
- **APIMatic PayPal Context Plugin:** Certified OpenAPI models and patterns via `npx context-plugins install paypal`.
- **AI Extraction Layer:** Google Gemini with Zod structured output schema and strict factual grounding.
- **Data & Grid Analytics:** AG Grid Community (`ag-grid-react`) providing an interactive creator control room and visual Rights Coverage matrix.
- **Deployment:** Render cloud web service configured via `render.yaml`.

---

## Challenges We Overcame

1. **The LLM Pricing Vulnerability:** Early in design, we realized that allowing an LLM to decide whether a user "deserves" a discount or qualifies for a license is an immense security flaw vulnerable to prompt injection. We established a strict architectural boundary: AI extracts facts; deterministic code enforces policies and prices.
2. **Cryptographic Receipt Canonization:** JSON object key ordering varies across runtimes. We engineered a canonical JSON serializer that normalizes object keys and formats before computing the SHA-256 hash.

---

## Accomplishments That We're Proud Of

- Zero-hallucination licensing: AI never touches the cash or permissions.
- Full end-to-end PayPal Orders v2 integration with read-back verification and webhook integrity.
- Real-time AG Grid creator dashboard with an intuitive Rights Coverage visualization.
- Complete test suite across policy rules, receipt verification, and PayPal APIs.

---

## Built With
- `paypal`
- `paypal-orders-v2`
- `apimatic`
- `ag-grid`
- `gemini-api`
- `next.js`
- `typescript`
- `tailwind-css`
- `render`
- `vitest`

