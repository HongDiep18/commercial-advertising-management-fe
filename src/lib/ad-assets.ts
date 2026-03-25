type ActiveAdAsset = {
  fileUrl: string
  assetType: string
}

type ActiveAdAssetGroup = {
  adId: string
  packageType: string
  assets: ActiveAdAsset[]
}

type EntityWithActiveAdAssets = {
  metadata?: {
    activeAdAssets?: ActiveAdAssetGroup[]
  }
}

export function getFirstActiveAdAssetImageUrl(
  entity: EntityWithActiveAdAssets,
  fallbackImageUrl: string
): string {
  const activeAdAssets = entity.metadata?.activeAdAssets ?? []
  for (const activeAdAsset of activeAdAssets) {
    if (activeAdAsset.assets.length === 0) continue
    const imageAsset = activeAdAsset.assets.find((asset) => asset.fileUrl.trim().length > 0)
    if (imageAsset) return imageAsset.fileUrl
  }
  return fallbackImageUrl
}
