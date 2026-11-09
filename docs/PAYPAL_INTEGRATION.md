# PayPal Orders v2 Integration & Verification Architecture

## 1. Overview

OwnTerms integrates directly with the **PayPal REST API v2** (Sandbox environment) using the official patterns certified by the APIMatic PayPal Context Plugin.

```
Client (Smart Buttons)          Next.js Backend (/api)          PayPal Sandbox API
       │                                  │                              │
       ├──── 1. POST /api/checkout/create ┼──────────────────────────────┤
       │     (assetId, tierId, intent)    │                              │
       │                                  ├──── 2. POST /v2/checkout/orders
       │                                  │     (Server-held price, USD) ├─────┐
       │                                  │                              │     │ Create Order
       │                                  │<─── 3. Return orderID ───────┼─────┘
       │<─── 4. Return orderID ───────────┤                              │
       │                                  │                              │
       ├──── 5. User / Agent Approves ────┼──────────────────────────────┤
       │                                  │                              │
       ├──── 6. onApprove: POST /capture ─┼──────────────────────────────┤
       │     (orderID)                    │                              │
       │                                  ├──── 7. POST /orders/{id}/capture
       │                                  │<─── 8. Capture completed ────┤
       │                                  │                              │
       │                                  ├──── 9. GET /orders/{id} ─────┤
       │                                  │<─── 10. Read-back verified ──┤
       │                                  │                              │
       │                                  ├──── 11. Mint Rights Receipt ─┤
       │<─── 12. Return Rights Receipt ───┤                              │
```

## 2. API Endpoints Used

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/v1/oauth2/token` | `POST` | Exchange `PAYPAL_CLIENT_ID` + `PAYPAL_CLIENT_SECRET` for an OAuth2 Bearer token |
| `/v2/checkout/orders` | `POST` | Create order with intent `CAPTURE` and server-determined amount |
| `/v2/checkout/orders/{id}/capture` | `POST` | Capture the authorized funds |
| `/v2/checkout/orders/{id}` | `GET` | Read-back verification of captured order details |
| `/v1/notifications/verify-webhook-signature` | `POST` | Verify cryptographic authenticity of incoming PayPal webhooks |

## 3. Server-Enforced Invariants

1. **Integer Minor Cents Representation:** All internal prices are tracked as integers (e.g., \$69.00 = `6900` cents). Conversion to PayPal's string decimal format (`"69.00"`) occurs only at the final API serialization boundary.
2. **Metadata Binding via `custom_id`:** The PayPal order carries `custom_id` encoding `{ assetId, tierId, intentHash }`, binding the payment to the exact rights contract.
3. **Read-Back Verification:** Before a Rights Receipt is minted, the server performs a `GET` request to PayPal Sandbox to verify that the capture amount, currency, and payee correspond precisely to the internal policy.

