# Judge Quickstart Guide (2 Minutes)

Welcome to **OwnTerms** — *"Your agent can use it—after it licenses it."*

Follow these instructions to explore the complete autonomous rights settlement flow either locally or via the deployed release.

---

## 1. Quick Local Execution

### Prerequisites
- Node.js 20+ (recommended Node 24)
- pnpm 10+ (or npm)

### Setup & Run
```bash
# Clone and enter directory
cd ownterms

# Install dependencies
pnpm install

# Run database seeds
pnpm run seed

# Run unit & policy tests
pnpm test

# Start the application
pnpm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 2. Canonical 3-Minute Demo Journey

1. **Visit the Catalog (`/`):**
   - Click on the flagship asset: **"Night Market Signals"** by creator Mira Rao (`asset_night_market_01`).
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
   - **Commercial Social (\$69):** **COMPATIBLE & RECOMMENDED** (Under \$80 budget, covers Instagram ads and 30-day duration).
   - **Extended Campaign (\$149):** Incompatible (Exceeds \$80 budget).
5. **Instant PayPal Sandbox Checkout:**
   - Click the PayPal button on the \$69 Commercial Social tier.
   - Complete sandbox approval.
   - Observe server capture and read-back verification against PayPal Sandbox.
6. **Inspect Cryptographic Rights Receipt:**
   - View the generated Rights Receipt with its canonical SHA-256 hash.
   - Click **"Test Anti-Tampering"** to see how modifying 1 character instantly breaks the verification hash.
7. **Creator Control Room (`/control-room`):**
   - Explore the AG Grid audit ledger.
   - View the live transaction recorded in real-time.
   - Explore the **"Rights Coverage"** custom visual widget showing channel and regional rights saturation.
