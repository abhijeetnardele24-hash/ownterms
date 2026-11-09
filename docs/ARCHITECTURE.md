# OwnTerms Architecture & System Design

> *"Your agent can use it—after it licenses it."*

```mermaid
flowchart TD
    subgraph Client ["Autonomous Agent / User"]
        AgentPrompt["Natural Language Request<br/>(Channel, Duration, Territory, Budget)"]
        UI["Web Interface / API Caller"]
    end

    subgraph Extraction ["Stage 1: Intent Extraction (AI)"]
        Gemini["Google Gemini Model<br/>(gemini-2.5-flash)"]
        Schema["Zod Strict Fact Schema<br/>(Evidence-Grounded Extraction)"]
        ExtractedFacts["Extracted Use Profile<br/>(Exclusions, Channels, Duration, Territory)"]
        
        AgentPrompt --> Gemini
        Gemini --> Schema
        Schema --> ExtractedFacts
    end

    subgraph PolicyEngine ["Stage 2: Deterministic Compatibility Engine"]
        CreatorPolicy["Creator Asset Policy<br/>(Source of Truth: Editorial, Commercial, Extended)"]
        Matcher["Rule-Based Compatibility Matrix<br/>(Zero Hallucination, Integer Minor Cents)"]
        RankedTiers["Ranked License Offers<br/>(Exact Server-Held Price & Suitability Reason)"]

        ExtractedFacts --> Matcher
        CreatorPolicy --> Matcher
        Matcher --> RankedTiers
    end

    subgraph PaymentRails ["Stage 3: Verified Financial Rails (PayPal)"]
        ServerCheckout["Backend Checkout Route<br/>(/api/checkout/create)"]
        PayPalOrders["PayPal Sandbox Orders v2<br/>(Server-Controlled Capture)"]
        Capture["Order Capture & Read-back<br/>(/api/checkout/{id}/capture)"]

        RankedTiers --> ServerCheckout
        ServerCheckout --> PayPalOrders
        PayPalOrders --> Capture
    end

    subgraph CryptographicTruth ["Stage 4: Cryptographic Settlement"]
        CanonicalSerializer["Canonical JSON Normalizer"]
        SHA256Hasher["SHA-256 Digest Generator"]
        Receipt["Verifiable Rights Receipt<br/>(Immutable Machine-Readable Contract)"]
        ControlRoom["AG Grid Creator Control Room<br/>(Real-time Audit Ledger & Rights Coverage)"]

        Capture --> CanonicalSerializer
        CanonicalSerializer --> SHA256Hasher
        SHA256Hasher --> Receipt
        Receipt --> ControlRoom
    end
```

## System Guarantees

1. **Zero Financial Hallucination:** The AI model is strictly quarantined in Stage 1. It extracts structured facts only. It never receives pricing parameters or permission overrides.
2. **Server-Side Price Authority:** Every price is stored in integer minor cents (USD) on the creator's policy and verified on the server before dispatching to PayPal Orders v2.
3. **Cryptographic Nonce & Hash:** Each Rights Receipt produces a deterministic canonical SHA-256 digest binding order ID, capture ID, asset ID, tier, and granted scope.

