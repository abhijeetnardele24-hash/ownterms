# OwnTerms — Verified Release Candidate & Codex Submission Handoff

> **Release Candidate Status:** **VERIFIED & READY FOR RECORDING / SUBMISSION**  
> **Timestamp:** 2026-11-09T09:15:00+05:30  
> **Target Competition:** PayPal AI Hackathon on Devpost ("Build what's next with PayPal and AI")  
> **Submission Deadline:** November 12, 2026 at 12:00 PM PT / November 13, 2026 at 1:30 AM IST (~90 hours remaining)

---

## 1. Verified Release Candidate Deliverables

| Deliverable | Location | Verification Status | Evidence Link |
| --- | --- | --- | --- |
| **Next.js 16 Application** | `app/` | `pnpm run build` compiles in 818ms with 0 errors | [TEST_EVIDENCE.md](../docs/TEST_EVIDENCE.md) |
| **Static Code Quality** | Entire repository | `pnpm run lint` passes with 0 errors and 0 warnings | [TEST_EVIDENCE.md](../docs/TEST_EVIDENCE.md) |
| **Policy & Security Test Suite** | `tests/unit/`, `tests/integration/` | 27 / 27 tests passing in 531ms | [TEST_EVIDENCE.md](../docs/TEST_EVIDENCE.md) |
| **Playwright E2E Suite** | `tests/e2e/canonical-journey.test.ts` | 3 / 3 scenarios passing across 1440, 1280, 390 viewports | [TEST_EVIDENCE.md](../docs/TEST_EVIDENCE.md) |
| **Automated Screen Captures** | `docs/screenshots/` | 10 high-resolution PNG captures generated | `docs/screenshots/*.png` |
| **Live Model Evaluation** | `scripts/eval-live-model.ts` | `gemini-2.5-flash` live extraction verified (2941ms) | `pnpm run test:live-ai` |
| **Durable Financial State** | `lib/store/db.ts` | SQLite WAL mode (`data/ownterms.db`) | SQLite tables verified |
| **Infrastructure as Code** | `render.yaml` | Ready for Render web service deployment | `render.yaml` |
| **Canonical Assets** | `lib/data/seeds.ts` | 3 seeded assets and creator license policies | [ASSET_PROVENANCE.md](ASSET_PROVENANCE.md) |

---

## 2. Canonical Demo Journey Walkthrough (For Recording)

1. **Step 1: Catalog (`/`)**
   - Showcase the hero: *"Your agent can use it—after it licenses it."*
   - Scroll through the 3 protected creator works: *Night Market Signals*, *Monsoon Display Type Pack*, and *City Pulse Mobility Dataset*.
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
   - Click the PayPal button on the \$69 Commercial Social card.
   - Show server-side order creation and capture with read-back verification.
5. **Step 5: Verifiable Rights Receipt (`/receipt/[receiptId]`)**
   - Display the official Certificate of Intellectual Property License.
   - Highlight the canonical SHA-256 hash.
   - Run the **Judge Anti-Tampering Sandbox**: Click "Tamper Price to \$0.00", show red alert "Cryptographic Tampering Detected!", then click "Restore Authentic State", show green checkmark "Cryptographic Integrity Verified".
6. **Step 6: AG Grid Creator Control Room (`/control-room`)**
   - Demonstrate the multi-column sort, search, and provenance tags (`SEEDED`, `FIXTURE`).
   - Demonstrate the custom **"Rights Coverage"** visual matrix showing global channel saturation.

---

## 3. Devpost Submission Assets

- **Devpost Text Draft:** Available at [`submission/DEVPOST_DRAFT.md`](DEVPOST_DRAFT.md)
- **Demo Video Script:** Available at [`submission/DEMO_SCRIPT.md`](DEMO_SCRIPT.md)
- **Judge Quickstart:** Available at [`submission/JUDGE_QUICKSTART.md`](JUDGE_QUICKSTART.md)
- **Screenshots:** 10 verified PNG captures in `docs/screenshots/`
- **Sponsor Tags to Select:**
  - `PayPal`
  - `APIMatic`
  - `AG Grid`
  - `Google Gemini`
  - `Render`
