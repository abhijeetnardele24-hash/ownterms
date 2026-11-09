# Truthful Limitations & Architecture Notes

## 1. Local Prototype vs Durable Production Storage
- **Current Implementation:** OwnTerms uses a high-performance, synchronous SQLite database (`data/ownterms.db`) powered by `better-sqlite3` with WAL mode enabled.
- **Render Deployment Note:** On ephemeral cloud containers (e.g. basic free-tier Render instances), local disk writes reset on container restart unless a persistent disk is mounted (e.g. `/var/data/ownterms.db`). For enterprise production, migrating to managed PostgreSQL via Drizzle ORM is recommended.

## 2. PayPal Sandbox Credentials Boundary
- OwnTerms provides an explicit `PAYPAL_MODE=fixture` mode for zero-network testing and offline evaluation.
- When `PAYPAL_MODE=sandbox` is enabled, the system fails closed with an informative configuration error if credentials are absent or invalid. It never silently disguises mock data as a live sandbox transaction.

## 3. Supported Currencies
- Transactions are currently evaluated and settled in USD (`currency: "USD"`). Multi-currency support (EUR, GBP, INR) is supported at the integer minor cents schema level, with currency exchange normalization scheduled for v2.
