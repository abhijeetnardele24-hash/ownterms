# Truthful Limitations & Architecture Notes

## 1. Cloud Storage & Render Persistent Disk
- **Local Development:** Uses synchronous SQLite (`data/ownterms.db`) powered by `better-sqlite3` with WAL mode enabled and atomic transactions.
- **Render Production:** Configured in `render.yaml` with a paid persistent disk (`mountPath: /var/data`, 1GB) and `OWNTERMS_DB_PATH: /var/data/ownterms.db`.
- **Downtime Note:** Disk-backed web services on Render are single-instance and experience brief downtime during redeployments because persistent disks can only attach to one container instance at a time.

## 2. Cryptographic Tamper Evidence vs Immutability
- OwnTerms generates tamper-evident Rights Receipts using deterministic canonical JSON key sorting and SHA-256 digests.
- This proves that local or transmitted data has not been modified; it does not claim distributed blockchain immutability or decentralized consensus.

## 3. PayPal Sandbox Boundary
- OwnTerms provides a deterministic `PAYPAL_MODE=fixture` mode for automated evaluation and judge testing without credentials.
- In `PAYPAL_MODE=sandbox`, the system requires valid credentials and fails closed. It never pretends fixture transactions are live sandbox transactions.
- Live sandbox transactions require user configuration of Sandbox app credentials in `.env.local`.

## 4. Prototype & Legal Scope
- OwnTerms demonstrates machine-readable licensing and permission rails for AI agents.
- It is a hackathon engineering prototype and does not constitute formal legal counsel, statutory copyright registration, or digital rights management (DRM) file encryption.
