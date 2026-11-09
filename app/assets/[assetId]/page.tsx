import { notFound } from "next/navigation";
import { store } from "@/lib/store/repository";
import { AssetLicensingView } from "@/components/licensing/asset-licensing-view";
import { CANONICAL_ASSETS } from "@/lib/data/seeds";

export function generateStaticParams() {
  return CANONICAL_ASSETS.map((asset) => ({
    assetId: asset.id,
  }));
}

interface Props {
  params: Promise<{ assetId: string }>;
}

export default async function AssetPage({ params }: Props) {
  const { assetId } = await params;
  const asset = store.getAssetById(assetId);

  if (!asset) {
    notFound();
  }

  const initialPolicies = store.getPoliciesForAsset(assetId);

  return <AssetLicensingView asset={asset} initialPolicies={initialPolicies} />;
}
