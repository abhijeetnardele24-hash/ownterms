import { store } from "../lib/store/repository";

console.log("🌱 Seeding OwnTerms canonical demo dataset...");
store.resetToSeeds();

const assets = store.getAssets();
console.log(`✅ Loaded ${assets.length} canonical assets:`);
for (const a of assets) {
  const policies = store.getPoliciesForAsset(a.id);
  console.log(`   - [${a.id}] "${a.title}" by ${a.creatorName} (${policies.length} policies)`);
}

const ledger = store.getLedger();
console.log(`✅ Initialized creator control room ledger with ${ledger.length} historical entries.`);
console.log("🚀 OwnTerms seed complete.");

