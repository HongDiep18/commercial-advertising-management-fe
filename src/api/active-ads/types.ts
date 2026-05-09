export type ActiveAdAssetItem = {
  fileUrl: string
  assetType: string
}

export type ActiveAdAssetsGroup = {
  adId: string
  packageType: string
  assets: ActiveAdAssetItem[]
}

export type PopupCompanyItem = {
  id: string
  name: string
  logoUrl?: string | null
  email: string
  contactName: string
  phone: string
  industry: string
  address: string
  description: string
  featuredHighlight?: boolean
  companyInfoHighlight?: boolean
  showDetailsButton?: boolean
  adLinkUrl?: string
  metadata?: {
    activeAdAssets?: ActiveAdAssetsGroup[]
  }
  sortPriority?: number
}

export type PopupCompaniesResponse = PopupCompanyItem[]

export type ActiveAdsSlotStatusAdId = string | number | Record<string, unknown> | null

export type ActiveAdsSlotStatusAdItem = {
  source: string
  activeAdId: ActiveAdsSlotStatusAdId
  orderId: ActiveAdsSlotStatusAdId
  orderItemId: ActiveAdsSlotStatusAdId
  companyId: ActiveAdsSlotStatusAdId
  companyName: string
  startDate: string
  endDate: string | null
  adLinkUrl?: string | null
}

export type ActiveAdsSlotStatusItem = {
  packageType: string
  packageName: string
  packageNameZh?: string | null
  hasActiveAds: boolean
  expiresAt: string | null
  activeAds: ActiveAdsSlotStatusAdItem[]
  expiredAds: ActiveAdsSlotStatusAdItem[]
  waitingAds: ActiveAdsSlotStatusAdItem[]
}

export type ActiveAdsSlotStatusResponse = ActiveAdsSlotStatusItem[]

