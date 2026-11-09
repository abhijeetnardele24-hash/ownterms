import { LedgerEntry } from "@/lib/types/domain";

export const COVERAGE_CHANNELS = [
  "Instagram Ads",
  "TikTok Ads",
  "YouTube Ads",
  "Web Embed",
  "Global Campaign",
] as const;

export const COVERAGE_TERRITORIES = [
  "India (IN)",
  "Singapore (SG)",
  "United States (US)",
  "United Kingdom (GB)",
  "Global (*)",
] as const;

export type CoverageChannel = (typeof COVERAGE_CHANNELS)[number];
export type CoverageTerritory = (typeof COVERAGE_TERRITORIES)[number];

export type CoverageMatrix = Record<CoverageChannel, Record<CoverageTerritory, number>>;

/**
 * Normalizes raw channel tokens into supported matrix channels
 */
export function normalizeChannels(channelStr: string): CoverageChannel[] {
  if (!channelStr) return [];
  const tokens = channelStr
    .toLowerCase()
    .split(/[,;\s]+/)
    .map((t) => t.trim())
    .filter(Boolean);

  const matched = new Set<CoverageChannel>();

  for (const token of tokens) {
    if (token === "instagram_ad" || token === "instagram") {
      matched.add("Instagram Ads");
    } else if (token === "tiktok_ad" || token === "tiktok") {
      matched.add("TikTok Ads");
    } else if (token === "youtube_ad" || token === "youtube") {
      matched.add("YouTube Ads");
    } else if (token === "web_landing" || token === "web" || token === "blog" || token === "embed") {
      matched.add("Web Embed");
    } else if (token === "global_campaign" || token === "broadcast_tv" || token === "print") {
      matched.add("Global Campaign");
    }
  }

  // Also check full string in case of multi-word tokens
  const full = channelStr.toLowerCase();
  if (full.includes("instagram ad") || full.includes("instagram ads")) matched.add("Instagram Ads");
  if (full.includes("tiktok ad") || full.includes("tiktok ads")) matched.add("TikTok Ads");
  if (full.includes("youtube ad") || full.includes("youtube ads")) matched.add("YouTube Ads");
  if (full.includes("web embed") || full.includes("web landing")) matched.add("Web Embed");
  if (full.includes("global campaign") || full.includes("extended campaign")) matched.add("Global Campaign");

  return Array.from(matched);
}

/**
 * Normalizes raw territory tokens into supported matrix territories
 */
export function normalizeTerritories(territoryStr: string): {
  territories: CoverageTerritory[];
  isGlobal: boolean;
} {
  if (!territoryStr) return { territories: [], isGlobal: false };

  const tokens = territoryStr
    .toUpperCase()
    .split(/[,;\s]+/)
    .map((t) => t.trim())
    .filter(Boolean);

  // Check explicit worldwide / global flags
  if (tokens.includes("*") || tokens.includes("GLOBAL") || tokens.includes("WORLDWIDE")) {
    return {
      territories: ["Global (*)"],
      isGlobal: true,
    };
  }

  const matched = new Set<CoverageTerritory>();

  for (const token of tokens) {
    if (token === "IN" || token === "INDIA") {
      matched.add("India (IN)");
    } else if (token === "SG" || token === "SINGAPORE") {
      matched.add("Singapore (SG)");
    } else if (token === "US" || token === "USA" || token === "AMERICA") {
      matched.add("United States (US)");
    } else if (token === "GB" || token === "UK" || token === "BRITAIN") {
      matched.add("United Kingdom (GB)");
    }
  }

  return {
    territories: Array.from(matched),
    isGlobal: false,
  };
}

/**
 * Builds the Rights Coverage Matrix from ledger entries.
 * Enforces strict, isolated cell matching:
 * A license activates ONLY its actual granted channels and territories.
 */
export function buildRightsCoverageMatrix(entries: LedgerEntry[]): CoverageMatrix {
  const matrix: CoverageMatrix = {
    "Instagram Ads": { "India (IN)": 0, "Singapore (SG)": 0, "United States (US)": 0, "United Kingdom (GB)": 0, "Global (*)": 0 },
    "TikTok Ads": { "India (IN)": 0, "Singapore (SG)": 0, "United States (US)": 0, "United Kingdom (GB)": 0, "Global (*)": 0 },
    "YouTube Ads": { "India (IN)": 0, "Singapore (SG)": 0, "United States (US)": 0, "United Kingdom (GB)": 0, "Global (*)": 0 },
    "Web Embed": { "India (IN)": 0, "Singapore (SG)": 0, "United States (US)": 0, "United Kingdom (GB)": 0, "Global (*)": 0 },
    "Global Campaign": { "India (IN)": 0, "Singapore (SG)": 0, "United States (US)": 0, "United Kingdom (GB)": 0, "Global (*)": 0 },
  };

  for (const entry of entries) {
    const channels = normalizeChannels(entry.channel);
    const { territories, isGlobal } = normalizeTerritories(entry.territory);

    for (const channel of channels) {
      if (isGlobal) {
        matrix[channel]["Global (*)"] += 1;
      } else {
        for (const territory of territories) {
          matrix[channel][territory] += 1;
        }
      }
    }
  }

  return matrix;
}
