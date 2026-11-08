import {
  LicensePolicy,
  IntendedUseFact,
  CompatibilityResult,
} from "@/lib/types/domain";
import { evaluateLicense } from "./evaluate-license";

export function rankLicenses(
  policies: LicensePolicy[],
  intendedUse: IntendedUseFact
): CompatibilityResult[] {
  const evaluated = policies.map((p) => evaluateLicense(p, intendedUse));

  // Find fully compatible within budget
  const compatibleTiers = evaluated.filter((e) => e.compatible);

  if (compatibleTiers.length > 0) {
    // Sort compatible by price ascending
    compatibleTiers.sort((a, b) => a.policy.priceCents - b.policy.priceCents);
    // The lowest price that meets all criteria is recommended
    compatibleTiers[0].status = "recommended";
    compatibleTiers[0].reasons.unshift(
      "Optimal match: covers all requested channels, duration, and territory at lowest cost."
    );
  }

  // Sort overall results: recommended -> compatible -> over_budget -> incompatible
  const priorityOrder: Record<string, number> = {
    recommended: 1,
    compatible: 2,
    over_budget: 3,
    incompatible: 4,
  };

  return evaluated.sort((a, b) => {
    const diff = (priorityOrder[a.status] || 5) - (priorityOrder[b.status] || 5);
    if (diff !== 0) return diff;
    return a.policy.priceCents - b.policy.priceCents;
  });
}
