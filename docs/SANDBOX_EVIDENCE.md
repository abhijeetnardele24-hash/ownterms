# PayPal Sandbox Transaction Evidence

This document stores raw JSON responses from actual PayPal Sandbox REST API calls executed during verification.

## 1. OAuth2 Bearer Token Exchange
- **Method:** `POST /v1/oauth2/token`
- **Headers:** `Authorization: Basic <base64(client_id:client_secret)>`
- **Status:** Pending live sandbox execution

## 2. Orders v2 Creation (`intent: "CAPTURE"`)
- **Method:** `POST /v2/checkout/orders`
- **Request Payload:**
  - `intent`: `"CAPTURE"`
  - `purchase_units`: amount, breakdown, custom_id
- **Response:** Order ID, status `CREATED`
- **Status:** Pending live sandbox execution

## 3. Orders v2 Capture
- **Method:** `POST /v2/checkout/orders/{id}/capture`
- **Response:** Capture ID, status `COMPLETED`
- **Status:** Pending live sandbox execution

## 4. Orders v2 Read-back
- **Method:** `GET /v2/checkout/orders/{id}`
- **Response:** Full order details matching receipt
- **Status:** Pending live sandbox execution
