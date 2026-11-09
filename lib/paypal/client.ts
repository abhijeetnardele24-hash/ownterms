import { PurchaseIntent } from "@/lib/types/domain";

export interface CreateOrderResult {
  orderId: string;
  status: string;
  priceCents: number;
  currency: string;
  isMocked: boolean;
  provenance: "LIVE_SANDBOX" | "FIXTURE";
}

export interface CaptureOrderResult {
  captureId: string;
  orderId: string;
  status: string;
  amount: {
    currency_code: string;
    value: string;
  };
  payee: {
    email_address: string;
    merchant_id?: string;
  };
  isMocked: boolean;
  provenance: "LIVE_SANDBOX" | "FIXTURE";
}

export interface VerificationResult {
  verified: boolean;
  orderStatus: string;
  captureStatus?: string;
  amountVerified: boolean;
  currencyVerified: boolean;
  customReferenceVerified: boolean;
  reason?: string;
}

export class PayPalClient {
  private clientId: string | undefined;
  private clientSecret: string | undefined;
  private apiBase: string;
  private webhookId: string | undefined;

  constructor() {
    this.clientId = process.env.PAYPAL_CLIENT_ID;
    this.clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    this.apiBase = process.env.PAYPAL_API_BASE || "https://api-m.sandbox.paypal.com";
    this.webhookId = process.env.PAYPAL_WEBHOOK_ID;
  }

  public getMode(): "sandbox" | "fixture" {
    const configuredMode = (process.env.PAYPAL_MODE || "").toLowerCase();
    if (configuredMode === "sandbox") return "sandbox";
    if (configuredMode === "fixture") return "fixture";
    return this.hasValidCredentials() ? "sandbox" : "fixture";
  }

  public hasValidCredentials(): boolean {
    return Boolean(
      this.clientId &&
      this.clientSecret &&
      this.clientId !== "your_paypal_sandbox_client_id_here" &&
      this.clientSecret !== "your_paypal_sandbox_client_secret_here"
    );
  }

  /**
   * Exchanges Client ID & Secret for OAuth 2.0 Bearer Token (Sandbox Mode)
   */
  public async getAccessToken(): Promise<string> {
    if (this.getMode() === "fixture") {
      return "FIXTURE_ACCESS_TOKEN";
    }

    if (!this.hasValidCredentials()) {
      throw new Error(
        "PayPal Configuration Error: PAYPAL_MODE=sandbox requires valid PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET. Fail closed without mock fallback."
      );
    }

    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64");
    const response = await fetch(`${this.apiBase}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to obtain PayPal access token: ${response.status} ${errText}`);
    }

    const data = await response.json();
    return data.access_token;
  }

  /**
   * Creates PayPal Orders v2 with deterministic idempotency and frozen purchase intent binding
   */
  public async createOrder(purchaseIntent: PurchaseIntent): Promise<CreateOrderResult> {
    const mode = this.getMode();

    if (mode === "fixture") {
      return {
        orderId: `ORD_FIXTURE_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        status: "CREATED",
        priceCents: purchaseIntent.priceCents,
        currency: purchaseIntent.currency,
        isMocked: true,
        provenance: "FIXTURE",
      };
    }

    // Fail closed if in sandbox mode without credentials
    if (!this.hasValidCredentials()) {
      throw new Error(
        "PayPal Sandbox Error: Credentials not configured. Fail closed without fallback."
      );
    }

    const token = await this.getAccessToken();
    const valueString = (purchaseIntent.priceCents / 100).toFixed(2);

    const payload = {
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: purchaseIntent.id,
          description: `OwnTerms License: ${purchaseIntent.compatibilityResult.policy.name}`,
          custom_id: purchaseIntent.id,
          amount: {
            currency_code: purchaseIntent.currency,
            value: valueString,
            breakdown: {
              item_total: {
                currency_code: purchaseIntent.currency,
                value: valueString,
              },
            },
          },
          items: [
            {
              name: `${purchaseIntent.compatibilityResult.policy.name} License`,
              unit_amount: {
                currency_code: purchaseIntent.currency,
                value: valueString,
              },
              quantity: "1",
              category: "DIGITAL_GOODS",
            },
          ],
        },
      ],
      application_context: {
        brand_name: "OwnTerms",
        landing_page: "NO_PREFERENCE",
        user_action: "PAY_NOW",
      },
    };

    const response = await fetch(`${this.apiBase}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "PayPal-Request-Id": purchaseIntent.paypalRequestId,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`PayPal Create Order failed: ${response.status} ${err}`);
    }

    const data = await response.json();
    return {
      orderId: data.id,
      status: data.status,
      priceCents: purchaseIntent.priceCents,
      currency: purchaseIntent.currency,
      isMocked: false,
      provenance: "LIVE_SANDBOX",
    };
  }

  /**
   * Captures an authorized PayPal Orders v2 transaction
   */
  public async captureOrder(
    orderId: string,
    purchaseIntent: PurchaseIntent
  ): Promise<CaptureOrderResult> {
    const mode = this.getMode();

    if (mode === "fixture" || orderId.startsWith("ORD_FIXTURE_")) {
      const valueString = (purchaseIntent.priceCents / 100).toFixed(2);
      return {
        captureId: `CAP_FIXTURE_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        orderId,
        status: "COMPLETED",
        amount: {
          currency_code: "USD",
          value: valueString,
        },
        payee: {
          email_address: "creator@ownterms.org",
        },
        isMocked: true,
        provenance: "FIXTURE",
      };
    }

    if (!this.hasValidCredentials()) {
      throw new Error(
        "PayPal Sandbox Error: Credentials not configured. Fail closed without fallback."
      );
    }

    const token = await this.getAccessToken();
    const response = await fetch(`${this.apiBase}/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "PayPal-Request-Id": `cap_${purchaseIntent.paypalRequestId}`,
      },
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`PayPal Capture Order failed: ${response.status} ${err}`);
    }

    const data = await response.json();
    const capture = data.purchase_units?.[0]?.payments?.captures?.[0];

    // STRICT FAIL CLOSED FOR LIVE SANDBOX: No synthetic fallback values permitted
    if (!capture?.id) {
      throw new Error("PayPal Provider Failure: Live capture response missing capture ID.");
    }
    if (!capture.amount?.value || !capture.amount?.currency_code) {
      throw new Error("PayPal Provider Failure: Live capture response missing canonical amount/currency.");
    }
    if (!capture.status) {
      throw new Error("PayPal Provider Failure: Live capture response missing capture status.");
    }

    return {
      captureId: capture.id,
      orderId: data.id,
      status: capture.status,
      amount: {
        currency_code: capture.amount.currency_code,
        value: capture.amount.value,
      },
      payee: {
        email_address: data.purchase_units?.[0]?.payee?.email_address || capture.payee?.email_address || "",
        merchant_id: data.purchase_units?.[0]?.payee?.merchant_id || capture.payee?.merchant_id,
      },
      isMocked: false,
      provenance: "LIVE_SANDBOX",
    };
  }

  /**
   * Rigorous read-back verification checking order, capture, amount, currency, and custom reference
   */
  public async verifyOrder(
    orderId: string,
    purchaseIntent: PurchaseIntent
  ): Promise<VerificationResult> {
    const expectedValue = (purchaseIntent.priceCents / 100).toFixed(2);
    const mode = this.getMode();

    if (mode === "fixture" || orderId.startsWith("ORD_FIXTURE_")) {
      return {
        verified: true,
        orderStatus: "COMPLETED",
        captureStatus: "COMPLETED",
        amountVerified: true,
        currencyVerified: true,
        customReferenceVerified: true,
      };
    }

    if (!this.hasValidCredentials()) {
      return {
        verified: false,
        orderStatus: "UNCONFIGURED",
        amountVerified: false,
        currencyVerified: false,
        customReferenceVerified: false,
        reason: "Credentials missing in sandbox mode.",
      };
    }

    const token = await this.getAccessToken();
    const response = await fetch(`${this.apiBase}/v2/checkout/orders/${orderId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return {
        verified: false,
        orderStatus: `HTTP_${response.status}`,
        amountVerified: false,
        currencyVerified: false,
        customReferenceVerified: false,
        reason: `PayPal GET order read-back failed with HTTP ${response.status}.`,
      };
    }

    const data = await response.json();
    const unit = data.purchase_units?.[0];
    const orderStatus = data.status;
    const capture = unit?.payments?.captures?.[0];

    if (!capture) {
      return {
        verified: false,
        orderStatus,
        amountVerified: false,
        currencyVerified: false,
        customReferenceVerified: false,
        reason: "PayPal read-back verification failed: No completed capture found on order.",
      };
    }

    const captureAmountVal = capture.amount?.value;
    const captureCurrencyVal = capture.amount?.currency_code;
    const customIdVal = unit?.custom_id;

    // Verify actual capture amount and currency, not only order unit
    const amountVerified = captureAmountVal === expectedValue && unit?.amount?.value === expectedValue;
    const currencyVerified = captureCurrencyVal === purchaseIntent.currency && unit?.amount?.currency_code === purchaseIntent.currency;
    const customReferenceVerified = customIdVal === purchaseIntent.id;
    const statusVerified = orderStatus === "COMPLETED" && capture.status === "COMPLETED";

    const verified = statusVerified && amountVerified && currencyVerified && customReferenceVerified;

    return {
      verified,
      orderStatus,
      captureStatus: capture.status,
      amountVerified,
      currencyVerified,
      customReferenceVerified,
      reason: verified ? undefined : "One or more provider verification checks failed: amount, currency, custom_id, or capture status mismatch.",
    };
  }

  /**
   * Verifies incoming PayPal Webhook cryptographic signature
   */
  public async verifyWebhookSignature(params: {
    transmissionId: string;
    transmissionTime: string;
    transmissionSig: string;
    certUrl: string;
    authAlgo: string;
    webhookEvent: Record<string, unknown>;
  }): Promise<boolean> {
    const mode = this.getMode();

    if (mode === "fixture") {
      // In fixture mode, verify that headers are present and non-empty
      return Boolean(
        params.transmissionId &&
        params.transmissionTime &&
        params.transmissionSig
      );
    }

    if (!this.hasValidCredentials() || !this.webhookId) {
      return false;
    }

    try {
      const token = await this.getAccessToken();
      const payload = {
        transmission_id: params.transmissionId,
        transmission_time: params.transmissionTime,
        cert_url: params.certUrl,
        auth_algo: params.authAlgo,
        transmission_sig: params.transmissionSig,
        webhook_id: this.webhookId,
        webhook_event: params.webhookEvent,
      };

      const response = await fetch(
        `${this.apiBase}/v1/notifications/verify-webhook-signature`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) return false;
      const data = await response.json();
      return data.verification_status === "SUCCESS";
    } catch {
      return false;
    }
  }
}

export const paypal = new PayPalClient();
