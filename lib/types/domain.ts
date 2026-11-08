import { z } from "zod";

// ==============================================================================
// 1. Asset & Media Types
// ==============================================================================

export const AssetTypeSchema = z.enum([
  "photography",
  "font",
  "dataset",
  "audio",
  "code",
]);
export type AssetType = z.infer<typeof AssetTypeSchema>;

export const AssetSchema = z.object({
  id: z.string(),
  title: z.string(),
  creatorName: z.string(),
  creatorHandle: z.string(),
  creatorEmail: z.string(),
  assetType: AssetTypeSchema,
  description: z.string(),
  thumbnailUrl: z.string(),
  previewUrl: z.string(),
  specs: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
  version: z.string().default("1.0.0"),
  createdAt: z.string(),
});
export type Asset = z.infer<typeof AssetSchema>;

// ==============================================================================
// 2. Creator License Policy Types
// ==============================================================================

export const LicensePermissionsSchema = z.object({
  channels: z.array(z.string()),
  maxDurationDays: z.number().int().positive(),
  maxTerritories: z.number().int().positive(),
  allowedTerritories: z.array(z.string()), // ["*"] for global or ISO 3166-1 alpha-2 codes
  commercialUse: z.boolean(),
  allowAiTraining: z.boolean().default(false),
  allowDerivativeModifications: z.boolean().default(true),
  allowRedistribution: z.boolean().default(false),
});
export type LicensePermissions = z.infer<typeof LicensePermissionsSchema>;

export const LicensePolicySchema = z.object({
  id: z.string(),
  assetId: z.string(),
  name: z.string(),
  tier: z.enum(["editorial", "commercial_social", "extended_campaign", "custom"]),
  priceCents: z.number().int().nonnegative(), // integer minor cents (e.g. 6900 = $69.00)
  currency: z.literal("USD"),
  description: z.string(),
  permissions: LicensePermissionsSchema,
  highlightBadge: z.string().optional(),
});
export type LicensePolicy = z.infer<typeof LicensePolicySchema>;

// ==============================================================================
// 3. AI Extracted Intended-Use Facts
// ==============================================================================

export const EvidenceQuotesSchema = z.object({
  channels: z.string().optional(),
  duration: z.string().optional(),
  territories: z.string().optional(),
  budget: z.string().optional(),
  aiPolicy: z.string().optional(),
});
export type EvidenceQuotes = z.infer<typeof EvidenceQuotesSchema>;

export const IntendedUseFactSchema = z.object({
  rawRequest: z.string(),
  channels: z.array(z.string()).min(1),
  durationDays: z.number().int().positive(),
  territories: z.array(z.string()).min(1),
  commercialUse: z.boolean(),
  prohibitAiTraining: z.boolean().default(true),
  budgetLimitCents: z.number().int().positive().nullable(),
  evidenceQuotes: EvidenceQuotesSchema.default({}),
  parsedWithFallback: z.boolean().default(false),
});
export type IntendedUseFact = z.infer<typeof IntendedUseFactSchema>;

// ==============================================================================
// 4. Compatibility Evaluation Results
// ==============================================================================

export const CompatibilityStatusSchema = z.enum([
  "recommended",
  "compatible",
  "incompatible",
  "over_budget",
]);
export type CompatibilityStatus = z.infer<typeof CompatibilityStatusSchema>;

export const CompatibilityResultSchema = z.object({
  policy: LicensePolicySchema,
  compatible: z.boolean(),
  status: CompatibilityStatusSchema,
  reasons: z.array(z.string()),
  violations: z.array(z.string()),
});
export type CompatibilityResult = z.infer<typeof CompatibilityResultSchema>;

// ==============================================================================
// 5. Rights Receipt & Settlement Types
// ==============================================================================

export const RightsReceiptPayloadSchema = z.object({
  receiptId: z.string(),
  assetId: z.string(),
  assetTitle: z.string(),
  creatorName: z.string(),
  creatorHandle: z.string(),
  licenseTier: z.string(),
  licenseName: z.string(),
  pricePaidCents: z.number().int().nonnegative(),
  currency: z.literal("USD"),
  grantedChannels: z.array(z.string()),
  grantedDurationDays: z.number().int().positive(),
  grantedTerritories: z.array(z.string()),
  commercialUse: z.boolean(),
  aiTrainingAllowed: z.boolean(),
  derivativeModificationsAllowed: z.boolean(),
  redistributionAllowed: z.boolean(),
  paypalOrderId: z.string(),
  paypalCaptureId: z.string(),
  payeeEmail: z.string(),
  issuedAt: z.string(),
  validUntil: z.string(),
});
export type RightsReceiptPayload = z.infer<typeof RightsReceiptPayloadSchema>;

export const RightsReceiptSchema = RightsReceiptPayloadSchema.extend({
  canonicalSha256: z.string().length(64),
});
export type RightsReceipt = z.infer<typeof RightsReceiptSchema>;

// ==============================================================================
// 6. Creator Control Room Ledger Entry
// ==============================================================================

export const LedgerEntrySchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  assetId: z.string(),
  assetTitle: z.string(),
  licenseTier: z.string(),
  amountUsd: numberOrString(),
  channel: z.string(),
  territory: z.string(),
  agentPrompt: z.string(),
  paypalCaptureId: z.string(),
  receiptHash: z.string(),
  status: z.enum(["SETTLED", "ACTIVE", "EXPIRED"]),
});
export type LedgerEntry = z.infer<typeof LedgerEntrySchema>;

function numberOrString() {
  return z.union([z.number(), z.string()]);
}
