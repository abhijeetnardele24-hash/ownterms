# OwnTerms — Verified Release Candidate & Codex Submission Handoff

> **Release Candidate Status:** **VERIFIED, HARDENED & READY FOR RECORDING / SUBMISSION**  
> **Timestamp:** 2026-11-09T10:10:00+05:30  
> **Target Competition:** PayPal AI Hackathon on Devpost ("Build what's next with PayPal and AI")  
> **Submission Deadline:** November 12, 2026 at 12:00 PM PT / November 13, 2026 at 1:30 AM IST (~89 hours remaining)

---

## 1. Verified Release Candidate Deliverables

| Deliverable | Location | Verification Status | Evidence Link |
| :--- | :--- | :--- | :--- |
| **Next.js 16 Application** | `app/` | `pnpm run build` compiles in 806ms with 14 routes generated | [TEST_EVIDENCE.md](../docs/TEST_EVIDENCE.md) |
| **Static Code Quality** | Entire repository | `pnpm run lint` passes with 0 errors and 0 warnings | [TEST_EVIDENCE.md](../docs/TEST_EVIDENCE.md) |
| **Policy & Security Test Suite** | `tests/unit/`, `tests/integration/` | 37 / 37 tests passing in ~550ms | [TEST_EVIDENCE.md](../docs/TEST_EVIDENCE.md) |
| **Playwright E2E Suite** | `tests/e2e/canonical-journey.test.ts` | 3 / 3 scenarios passing across 1440, 1280, 390 viewports | [TEST_EVIDENCE.md](../docs/TEST_EVIDENCE.md) |
| **Deployment & Persistence Gate** | `scripts/verify-deployment.ts` | 7 / 7 gates passed (`pnpm run verify:deploy`) | [TEST_EVIDENCE.md](../docs/TEST_EVIDENCE.md) |
| **Automated Screen Captures** | `docs/screenshots/` | 10 high-resolution PNG captures with original local assets | `docs/screenshots/*.png` |
| **Live Model Evaluation** | `scripts/eval-live-model.ts` | Tested with `gemini-2.5-flash` with graceful fallback on 429 | `pnpm run test:live-ai` |
| **Durable Financial State** | `lib/store/db.ts` | SQLite WAL mode (`data/ownterms.db`), Render persistent disk | [render.yaml](../render.yaml) |
| **Original Project Assets** | `public/demo-assets/` | 3 original AI-generated compositions with SHA-256 digests | [ASSET_PROVENANCE.md](ASSET_PROVENANCE.md) |

---

## 2. Canonical Demo Journey Walkthrough (For Recording)

1. **Step 1: Catalog (`/`)**
   - Showcase the hero: *"Your agent can use it—after it licenses it."*
   - Scroll through the 3 protected creator works: *Night Market Signals*, *Monsoon Display Type Pack*, and *City Pulse Mobility Dataset*.
   - Point out the local, project-owned visual compositions in `public/demo-assets/`.
   - Click **"Launch Flagship Demo"** on *Night Market Signals*.
2. **Step 2: Intent Studio & Quarantined Fact Extraction (`/assets/asset_night_market_01`)**
   - Click **"Load Canonical Demo Request"**:
     > *"Use this night-market photograph in a paid Instagram campaign for 30 days in India and Singapore. Budget up to $80. Do not allow AI training."*
   - Click **"Extract Rights Scope with AI"**.
   - Point out the extracted chips: Channels (`instagram_ad`), Duration (`30 days`), Territories (`IN, SG`), Commercial (`Yes`), AI Training (`Prohibited`), Budget (`$80.00`).
   - Highlight the architectural security boundary: the AI has zero power over prices or permissions.
3. **Step 3: Deterministic Rights Matching Rail**
   - Editorial Only (\$19): Incompatible (Paid advertising prohibited).
   - Commercial Social (\$69): **Optimal Match** (Covers Instagram ads, 30-day duration, India & Singapore within \$80 budget).
   - Extended Campaign (\$149): Over budget (\$149 exceeds \$80).
4. **Step 4: PayPal Settlement**
   - In Fixture mode (judge flow), click **"Settle License (Fixture Mode)"** on the \$69 Commercial Social card.
   - Show server-side order creation and capture with read-back verification and atomic transaction.
5. **Step 5: Verifiable Rights Receipt (`/receipt/[receiptId]`)**
   - Display the Machine-Readable Rights Receipt.
   - Highlight the canonical SHA-256 digest and provenance pill.
   - Run the **Judge Anti-Tampering Sandbox**: Click "Tamper Price to \$0.00", show red alert "Cryptographic Tampering Detected!", then click "Restore Authentic State", show green checkmark "Cryptographic Integrity Verified".
6. **Step 6: AG Grid Creator Control Room (`/control-room`)**
   - Demonstrate the multi-column sort, search, and provenance tags (`SEEDED`, `FIXTURE`).
   - Demonstrate the **"Rights Coverage Matrix"** visual table showing isolated channel-by-territory saturation without cross-contamination.

---

## 3. Optional Next Step: Live PayPal Sandbox Execution

The system currently runs in deterministic **Fixture mode** so judges can evaluate the entire lifecycle without credentials.

To run against a live PayPal Developer Sandbox application:
1. Configure your credentials directly in `.env.local`:
   ```bash
   PAYPAL_MODE=sandbox
   NEXT_PUBLIC_PAYPAL_MODE=sandbox
   PAYPAL_CLIENT_ID=your_sandbox_client_id
   PAYPAL_CLIENT_SECRET=your_sandbox_client_secret
   PAYPAL_WEBHOOK_ID=your_sandbox_webhook_id
   NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_sandbox_client_id
   ```
2. Start the dev server (`pnpm run dev`) and complete checkout with an official PayPal Sandbox personal buyer account.

---

## 4. Submission Package Links

- **Devpost Text Draft:** [`submission/DEVPOST_DRAFT.md`](DEVPOST_DRAFT.md)
- **Demo Video Script:** [`submission/DEMO_SCRIPT.md`](DEMO_SCRIPT.md)
- **Judge Quickstart:** [`submission/JUDGE_QUICKSTART.md`](JUDGE_QUICKSTART.md)
- **Asset Provenance:** [`submission/ASSET_PROVENANCE.md`](ASSET_PROVENANCE.md)
- **Screenshots:** 10 verified PNG captures in `docs/screenshots/`
- **Sponsor Tags:** `PayPal`, `APIMatic`, `AG Grid`, `Google Gemini`, `Render`
