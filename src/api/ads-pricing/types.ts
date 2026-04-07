export type AdminPricingResponse = {
  id: string
  packageId: string
  packageName: string
  packageType: string
  pricingModel: string
  basePrice: number
  discountRate: number
  finalPrice: number
  durationValue: number | null
  durationUnit: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type AdminPricingListQuery = {
  packageId?: string
  pricingModel?: string
  isActive?: boolean
  page?: number
  limit?: number
}

export type AdminPricingListResponse = {
  items: AdminPricingResponse[]
  total: number
  page: number
  limit: number
}

export type AdminCreatePricingPayload = {
  pricingModel: string
  basePrice: number
  discountRate?: number
  durationValue?: number | null
  durationUnit?: string | null
  isActive?: boolean
}

export type AdminUpdatePricingPayload = Partial<AdminCreatePricingPayload>

export type PublicAdPackagePricingItem = {
  id: string
  pricingModel: string
  durationValue: number | null
  durationUnit: string | null
  basePrice: number
  discountRate: number
  finalPrice: number
  isActive: boolean
}

export type AdPackageFormConfig = {
  requiresStartDate: boolean
  requiresAdLink: boolean
  requiresDesignService: boolean
  requiresAssets: boolean
  requiresActiveToggle?: boolean
}

export type PublicAdPackageItem = {
  id: string
  categoryId: string
  type: string
  name: string
  nameZh: string | null
  description: string | null
  pricingModel: string
  metadata: Record<string, unknown> | null
  sortOrder: number
  isActive: boolean
  pricing: PublicAdPackagePricingItem[]
  formConfig: AdPackageFormConfig
}

export type PublicAdPackageCategoryItem = {
  id: string
  type: string
  name: string
  nameZh: string | null
  description: string | null
  sortOrder: number
  isActive: boolean
  packages: PublicAdPackageItem[]
}

