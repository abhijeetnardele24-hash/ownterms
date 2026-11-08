import crypto from "node:crypto";
import {
  RightsReceipt,
  RightsReceiptPayload,
  RightsReceiptPayloadSchema,
} from "@/lib/types/domain";

/**
 * Normalizes an object into a canonical JSON string with sorted keys.
 * Ensures deterministic cryptographic hashing regardless of runtime key order.
 */
export function canonicalizeJson(obj: unknown): string {
  if (obj === null || typeof obj !== "object") {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return "[" + obj.map(canonicalizeJson).join(",") + "]";
  }
  const keys = Object.keys(obj as Record<string, unknown>).sort();
  const pairs = keys.map(
    (key) => `${JSON.stringify(key)}:${canonicalizeJson((obj as Record<string, unknown>)[key])}`
  );
  return "{" + pairs.join(",") + "}";
}

/**
 * Computes SHA-256 digest of canonical JSON string
 */
export function computeCanonicalSha256(payload: RightsReceiptPayload): string {
  const canonicalString = canonicalizeJson(payload);
  return crypto.createHash("sha256").update(canonicalString, "utf8").digest("hex");
}

/**
 * Mints an immutable Rights Receipt
 */
export function mintRightsReceipt(payload: RightsReceiptPayload): RightsReceipt {
  const validatedPayload = RightsReceiptPayloadSchema.parse(payload);
  const hash = computeCanonicalSha256(validatedPayload);
  return {
    ...validatedPayload,
    canonicalSha256: hash,
  };
}

/**
 * Verifies the cryptographic integrity of a Rights Receipt.
 * Detects whether any byte or field has been tampered with.
 */
export function verifyRightsReceipt(receipt: unknown): {
  valid: boolean;
  computedHash: string;
  expectedHash: string;
  tamperedFields: string[];
} {
  if (!receipt || typeof receipt !== "object") {
    return {
      valid: false,
      computedHash: "",
      expectedHash: "",
      tamperedFields: ["invalid_object"],
    };
  }

  const r = receipt as Record<string, unknown>;
  const expectedHash = typeof r.canonicalSha256 === "string" ? r.canonicalSha256 : "";

  // Extract payload without hash
  const payloadCandidate: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(r)) {
    if (k !== "canonicalSha256") {
      payloadCandidate[k] = v;
    }
  }

  try {
    const validated = RightsReceiptPayloadSchema.parse(payloadCandidate);
    const computedHash = computeCanonicalSha256(validated);
    const valid = computedHash.toLowerCase() === expectedHash.toLowerCase();

    return {
      valid,
      computedHash,
      expectedHash,
      tamperedFields: valid ? [] : ["payload_or_signature_mismatch"],
    };
  } catch (err) {
    return {
      valid: false,
      computedHash: "",
      expectedHash,
      tamperedFields: ["schema_validation_failed"],
    };
  }
}
