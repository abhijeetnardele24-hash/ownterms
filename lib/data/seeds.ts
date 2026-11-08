import { Asset, LicensePolicy, LedgerEntry } from "@/lib/types/domain";

export const CANONICAL_ASSETS: Asset[] = [
  {
    id: "asset_night_market_01",
    title: "Night Market Signals",
    creatorName: "Mira Rao",
    creatorHandle: "@mirarao.lens",
    creatorEmail: "mira.rao.creator@example.com",
    assetType: "photography",
    description:
      "A cinematic, high-contrast night capture of bustling Bangalore street food stalls reflecting neon rain signage. Rich atmospheric lighting with precise color grading for commercial storytelling.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80",
    previewUrl:
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=2000&q=90",
    specs: {
      resolution: "3840 × 2160 (4K UHD)",
      colorSpace: "DCI-P3 Wide Gamut",
      format: "16-bit TIFF / RAW Master",
      shutterSpeed: "1/125s at f/1.8",
      iso: 800,
    },
    version: "1.0.0",
    createdAt: "2026-11-01T10:00:00.000Z",
  },
  {
    id: "asset_type_monsoon_02",
    title: "Monsoon Display Type Pack",
    creatorName: "Kavi Sundaram",
    creatorHandle: "@kavisundaram",
    creatorEmail: "kavi.type@example.com",
    assetType: "font",
    description:
      "A fluid, modular display typeface drawing inspiration from mid-century South Asian sign-painting. Includes 6 variable optical weights and bespoke ligatures.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?auto=format&fit=crop&w=1200&q=80",
    previewUrl:
      "https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?auto=format&fit=crop&w=2000&q=90",
    specs: {
      glyphs: "680 glyphs per cut",
      formats: "OTF, TTF, WOFF2",
      variableAxes: "Weight (200-900), Slant (0-12deg)",
    },
    version: "1.2.0",
    createdAt: "2026-11-03T14:30:00.000Z",
  },
  {
    id: "asset_data_mobility_03",
    title: "City Pulse Mobility Dataset",
    creatorName: "Urban Dynamics Lab",
    creatorHandle: "@urbandynamics",
    creatorEmail: "data@urbandynamics.org",
    assetType: "dataset",
    description:
      "Anonymized high-frequency multimodal commuter mobility traces across 4 metropolitan transit corridors. 100,000 synthetic journeys with temporal timestamps and energy expenditure metrics.",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=1200&q=80",
    previewUrl:
      "https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=2000&q=90",
    specs: {
      rows: "100,000 trips",
      attributes: "32 structured features",
      format: "Parquet + GeoJSON",
      privacyValidation: "Differential Privacy ε=0.5",
    },
    version: "2.1.0",
    createdAt: "2026-11-05T08:15:00.000Z",
  },
];

export const CANONICAL_POLICIES: Record<string, LicensePolicy[]> = {
  asset_night_market_01: [
    {
      id: "tier_nm_editorial",
      assetId: "asset_night_market_01",
      name: "Editorial Only",
      tier: "editorial",
      priceCents: 1900, // $19.00 USD
      currency: "USD",
      description:
        "For news reporting, non-commercial blogs, and academic commentary. Strictly prohibits paid advertising and AI model training.",
      permissions: {
        channels: [
          "blog",
          "editorial_commentary",
          "news_reporting",
          "academic_publication",
        ],
        maxDurationDays: 365,
        maxTerritories: 999,
        allowedTerritories: ["*"],
        commercialUse: false,
        allowAiTraining: false,
        allowDerivativeModifications: false,
        allowRedistribution: false,
      },
    },
    {
      id: "tier_nm_commercial",
      assetId: "asset_night_market_01",
      name: "Commercial Social",
      tier: "commercial_social",
      priceCents: 6900, // $69.00 USD
      currency: "USD",
      description:
        "Cleared for paid social advertising campaigns (Instagram, TikTok, YouTube Ads, LinkedIn) up to 60 days in up to 5 countries.",
      highlightBadge: "Optimal Match",
      permissions: {
        channels: [
          "instagram_ad",
          "tiktok_ad",
          "youtube_ad",
          "facebook_ad",
          "linkedin_ad",
          "social_organic",
          "web_landing",
        ],
        maxDurationDays: 60,
        maxTerritories: 5,
        allowedTerritories: ["*"],
        commercialUse: true,
        allowAiTraining: false,
        allowDerivativeModifications: true,
        allowRedistribution: false,
      },
    },
    {
      id: "tier_nm_extended",
      assetId: "asset_night_market_01",
      name: "Extended Campaign",
      tier: "extended_campaign",
      priceCents: 14900, // $149.00 USD
      currency: "USD",
      description:
        "Comprehensive rights for multi-channel digital campaigns, broadcast, and print worldwide for up to 1 year.",
      permissions: {
        channels: [
          "instagram_ad",
          "tiktok_ad",
          "youtube_ad",
          "facebook_ad",
          "linkedin_ad",
          "social_organic",
          "web_landing",
          "digital_billboard",
          "broadcast_tv",
          "print",
        ],
        maxDurationDays: 365,
        maxTerritories: 999,
        allowedTerritories: ["*"],
        commercialUse: true,
        allowAiTraining: false,
        allowDerivativeModifications: true,
        allowRedistribution: false,
      },
    },
  ],
  asset_type_monsoon_02: [
    {
      id: "tier_type_personal",
      assetId: "asset_type_monsoon_02",
      name: "Desktop Personal",
      tier: "editorial",
      priceCents: 2900, // $29.00
      currency: "USD",
      description: "For student portfolios, non-profit design, and personal experimentation.",
      permissions: {
        channels: ["personal_project", "student_work", "non_profit"],
        maxDurationDays: 365,
        maxTerritories: 999,
        allowedTerritories: ["*"],
        commercialUse: false,
        allowAiTraining: false,
        allowDerivativeModifications: false,
        allowRedistribution: false,
      },
    },
    {
      id: "tier_type_commercial",
      assetId: "asset_type_monsoon_02",
      name: "Web & App Commercial",
      tier: "commercial_social",
      priceCents: 8900, // $89.00
      currency: "USD",
      description: "Web embed and application distribution up to 500k monthly active users.",
      highlightBadge: "Popular",
      permissions: {
        channels: ["web_embed", "app_ui", "social_media", "marketing_site"],
        maxDurationDays: 365,
        maxTerritories: 999,
        allowedTerritories: ["*"],
        commercialUse: true,
        allowAiTraining: false,
        allowDerivativeModifications: true,
        allowRedistribution: false,
      },
    },
  ],
  asset_data_mobility_03: [
    {
      id: "tier_data_academic",
      assetId: "asset_data_mobility_03",
      name: "Academic Benchmark",
      tier: "editorial",
      priceCents: 4900, // $49.00
      currency: "USD",
      description: "Non-commercial peer-reviewed scientific evaluation and benchmarking.",
      permissions: {
        channels: ["academic_paper", "university_research", "open_benchmark"],
        maxDurationDays: 365,
        maxTerritories: 999,
        allowedTerritories: ["*"],
        commercialUse: false,
        allowAiTraining: false,
        allowDerivativeModifications: false,
        allowRedistribution: false,
      },
    },
    {
      id: "tier_data_inference",
      assetId: "asset_data_mobility_03",
      name: "Commercial Inference",
      tier: "commercial_social",
      priceCents: 19900, // $199.00
      currency: "USD",
      description: "Live routing, fleet optimization, and autonomous delivery navigation.",
      permissions: {
        channels: ["fleet_routing", "autonomous_agent_nav", "production_api"],
        maxDurationDays: 365,
        maxTerritories: 999,
        allowedTerritories: ["*"],
        commercialUse: true,
        allowAiTraining: false,
        allowDerivativeModifications: true,
        allowRedistribution: false,
      },
    },
    {
      id: "tier_data_finetune",
      assetId: "asset_data_mobility_03",
      name: "Model Fine-Tuning Permitted",
      tier: "extended_campaign",
      priceCents: 49900, // $499.00
      currency: "USD",
      description: "Explicit grant permitting training and parameter updates on neural architectures.",
      permissions: {
        channels: ["model_weights", "weights_derivative", "neural_finetuning"],
        maxDurationDays: 9999,
        maxTerritories: 999,
        allowedTerritories: ["*"],
        commercialUse: true,
        allowAiTraining: true,
        allowDerivativeModifications: true,
        allowRedistribution: false,
      },
    },
  ],
};

export const INITIAL_LEDGER_ENTRIES: LedgerEntry[] = [
  {
    id: "ledg_001",
    timestamp: "2026-11-08T14:22:10.000Z",
    assetId: "asset_night_market_01",
    assetTitle: "Night Market Signals",
    licenseTier: "Commercial Social",
    amountUsd: 69.0,
    channel: "Instagram Ads",
    territory: "India, Singapore",
    agentPrompt: "Instagram ad campaign 30d in IN/SG budget $80",
    paypalCaptureId: "CAP_SANDBOX_7912489",
    receiptHash: "a1f8872b49c0d1279a09321ef9a8b92d6e43c8b1a2387140e698ef73214dae19",
    status: "ACTIVE",
  },
  {
    id: "ledg_002",
    timestamp: "2026-11-07T18:05:40.000Z",
    assetId: "asset_night_market_01",
    assetTitle: "Night Market Signals",
    licenseTier: "Editorial Only",
    amountUsd: 19.0,
    channel: "Tech Culture Journal",
    territory: "Global",
    agentPrompt: "Article on South Asian urban night life",
    paypalCaptureId: "CAP_SANDBOX_5109283",
    receiptHash: "b2c9983d50e1f2380b1a432fa0b9c03e7f54d9c2b3498251f709fa84325ebf20",
    status: "ACTIVE",
  },
  {
    id: "ledg_003",
    timestamp: "2026-11-06T09:30:15.000Z",
    assetId: "asset_type_monsoon_02",
    assetTitle: "Monsoon Display Type Pack",
    licenseTier: "Web & App Commercial",
    amountUsd: 89.0,
    channel: "Food Delivery App",
    territory: "Global",
    agentPrompt: "Display typography for mobile app rebranding",
    paypalCaptureId: "CAP_SANDBOX_4091823",
    receiptHash: "c3da094e61f203491c2b5430b1ca014f8065e0d3c4509362a810ab95436fc031",
    status: "ACTIVE",
  },
];
