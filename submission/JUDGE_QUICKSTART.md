# Judge Quickstart Guide (2 Minutes)

Welcome to **OwnTerms** — *"Your agent can use it—after it licenses it."*

Follow these instructions to explore the complete autonomous rights settlement flow either locally or via the deployment pipeline.

---

## 1. Quick Local Execution

### Prerequisites
- Node.js 20+
- pnpm 10+ (or npm)

### Setup & Run
```bash
# Clone and enter directory
cd ownterms

# Install dependencies
pnpm install

# Run deployment and persistence verification gate (7/7 gates)
pnpm run verify:deploy

# Run unit, integration & security regression tests (37 tests, ~550ms)
pnpm test

# Run Playwright E2E browser verification
pnpm run test:e2e

# Start the application
pnpm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 2. Canonical Demo Journey

1. **Visit the Catalog (`/`):**
   - Click on the flagship asset: **"Night Market Signals"** by creator persona Mira Rao (`asset_night_market_01`).
   - Notice the original, project-owned artwork loaded locally from `public/demo-assets/`.
2. **Review Creator Licensing Policies:**
   - Observe the 3 tiers:
     - **Editorial Only:** \$19.00 (Blog & news commentary; No paid ads, No AI training)
     - **Commercial Social:** \$69.00 (Paid social campaigns up to 60 days, up to 5 territories)
     - **Extended Campaign:** \$149.00 (Unlimited digital channels, global, 365 days)
3. **Execute Agent Intent Extraction:**
   - Click **"Load Canonical Demo Request"**:
     > *"Use this night-market photograph in a paid Instagram campaign for 30 days in India and Singapore. Budget up to $80. Do not allow AI training."*
   - Click **"Extract Rights Scope with AI"**.
   - Notice the structured chip breakdown: Channel: `instagram_ad`, Duration: `30 days`, Territories: `IN, SG`, Commercial: `true`, Prohibit AI Training: `true`.
4. **Inspect Policy Compatibility Engine:**
   - **Editorial (\$19):** Incompatible (Blocked: paid advertising prohibited).
   - **Commercial Social (\$69):** **COMPATIBLE & OPTIMAL MATCH** (Under \$80 budget, covers Instagram ads and 30-day duration in IN/SG).
   - **Extended Campaign (\$149):** Incompatible (Exceeds \$80 budget).
5. **Checkout & Rights Settlement:**
   - In default Fixture mode, click **"Settle License (Fixture Mode)"** on the Commercial Social tier.
   - The server creates a frozen `PurchaseIntent`, validates the order, executes capture with read-back verification, and mints a tamper-evident Rights Receipt.
6. **Inspect the Tamper-Evident Rights Receipt (`/receipt/[receiptId]`):**
   - Review the canonical SHA-256 digest calculated over lexicographically sorted JSON fields.
   - Test the **Judge Anti-Tampering Sandbox**:
     - Click **"Tamper Price to \$0.00"**: Watch the live validator immediately detect cryptographic tampering!
     - Click **"Restore Authentic State"**: Watch the green checkmark return.
7. **Creator Control Room (`/control-room`):**
   - Review the multi-column **AG Grid Community** ledger with sorting and searching.
   - Inspect the **Rights Coverage Matrix**, showing exact channel-by-territory saturation without cross-contamination.
