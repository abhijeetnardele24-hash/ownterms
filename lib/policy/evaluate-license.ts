import {
  LicensePolicy,
  IntendedUseFact,
  CompatibilityResult,
} from "@/lib/types/domain";

export function evaluateLicense(
  policy: LicensePolicy,
  intendedUse: IntendedUseFact
): CompatibilityResult {
  const violations: string[] = [];
  const reasons: string[] = [];

  const { permissions, priceCents } = policy;

  // 1. Commercial Use Check
  if (intendedUse.commercialUse && !permissions.commercialUse) {
    violations.push(
      "Requested commercial use is prohibited by this policy tier (Editorial only)."
    );
  } else if (intendedUse.commercialUse && permissions.commercialUse) {
    reasons.push("Fully cleared for commercial advertising and monetization.");
  }

  // 2. AI Model Training Check
  if (!intendedUse.prohibitAiTraining && !permissions.allowAiTraining) {
    violations.push(
      "Requested AI model training is strictly prohibited by creator policy."
    );
  } else if (intendedUse.prohibitAiTraining) {
    reasons.push("Adheres to strict AI training prohibition clause.");
  }

  // 3. Duration Limits Check
  if (intendedUse.durationDays > permissions.maxDurationDays) {
    violations.push(
      `Requested duration (${intendedUse.durationDays} days) exceeds maximum allowed duration (${permissions.maxDurationDays} days).`
    );
  } else {
    reasons.push(
      `Covers requested duration of ${intendedUse.durationDays} days (allowance: up to ${permissions.maxDurationDays} days).`
    );
  }

  // 4. Territory Limits Check
  const requestedTerritories = intendedUse.territories;
  const isGlobalPolicy = permissions.allowedTerritories.includes("*");

  if (isGlobalPolicy) {
    if (requestedTerritories.includes("*")) {
      if (permissions.maxTerritories < 999) {
        violations.push(
          `Requested global distribution exceeds policy territory cap of ${permissions.maxTerritories} countries.`
        );
      } else {
        reasons.push("Full worldwide territory clearance granted.");
      }
    } else if (requestedTerritories.length > permissions.maxTerritories) {
      violations.push(
        `Requested ${requestedTerritories.length} territories exceeds maximum allowed (${permissions.maxTerritories}).`
      );
    } else {
      reasons.push(
        `Covers requested territories (${requestedTerritories.join(", ")}) within allowance of ${permissions.maxTerritories} countries.`
      );
    }
  } else {
    // Specific allowed countries list
    const unpermitted = requestedTerritories.filter(
      (t) => !permissions.allowedTerritories.includes(t.toUpperCase())
    );
    if (unpermitted.length > 0) {
      violations.push(
        `Territories not permitted by creator policy: ${unpermitted.join(", ")}.`
      );
    } else {
      reasons.push(`Covers specific permitted territories: ${requestedTerritories.join(", ")}.`);
    }
  }

  // 5. Distribution Channels Check
  const policyChannelsLower = permissions.channels.map((c) => c.toLowerCase());
  for (const ch of intendedUse.channels) {
    const chLower = ch.toLowerCase();
    // Allow matching exact or broad channel match
    const matched =
      policyChannelsLower.includes(chLower) ||
      (chLower.includes("ad") && policyChannelsLower.some((pc) => pc.includes("ad"))) ||
      policyChannelsLower.includes("all_digital");

    if (!matched) {
      violations.push(`Channel '${ch}' is not permitted by this policy tier.`);
    }
  }
  if (violations.length === 0) {
    reasons.push(`Permits deployment to ${intendedUse.channels.join(", ")}.`);
  }

  // 6. Budget Check
  const isOverBudget =
    intendedUse.budgetLimitCents !== null && priceCents > intendedUse.budgetLimitCents;

  if (isOverBudget) {
    violations.push(
      `Price ($${(priceCents / 100).toFixed(2)}) exceeds user budget ($${(
        intendedUse.budgetLimitCents! / 100
      ).toFixed(2)}).`
    );
  }

  // Determine Final Compatibility Status
  if (violations.length === 0) {
    return {
      policy,
      compatible: true,
      status: "compatible",
      reasons,
      violations: [],
    };
  }

  // If the ONLY violation is budget, mark as over_budget
  const nonBudgetViolations = violations.filter((v) => !v.includes("budget"));
  if (nonBudgetViolations.length === 0 && isOverBudget) {
    return {
      policy,
      compatible: false,
      status: "over_budget",
      reasons,
      violations,
    };
  }

  return {
    policy,
    compatible: false,
    status: "incompatible",
    reasons,
    violations,
  };
}

