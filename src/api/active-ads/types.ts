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

