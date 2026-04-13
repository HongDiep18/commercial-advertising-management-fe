export type CompanyDirectorySortBy = "name" | "industry" | "createdAt"
export type CompanyDirectorySortOrder = "asc" | "desc"

export type CompanyDirectoryQuery = {
  search?: string
  industry?: string | string[]
  region?: string | string[]
  page?: number
  limit?: number
  sortBy?: CompanyDirectorySortBy
  sortOrder?: CompanyDirectorySortOrder
}

export type CompanyDirectoryItem = {
  id: string
  name: string
  logoUrl?: string | null
  email: string
  contactName: string
  phone: string
  industry: string | string[]
  region?: string
  address: string
  description: string
  companyInfoHighlight: boolean
  sortPriority: number
}

export type CompanyDirectoryResponse = {
  companies: CompanyDirectoryItem[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export type CompanyCategoryItem = {
  industry: string
  count: number
}

export type CompanyCategoriesResponse = {
  categories: CompanyCategoryItem[]
  hasAllAccess: boolean
}

export type FeaturedCompanyItem = {
  id: string
  name: string
  logoUrl?: string | null
  email: string
  contactName: string
  phone: string
  industry: string
  country?: string | null
  address: string
  description: string
  featuredHighlight?: boolean
  companyInfoHighlight?: boolean
  adLinkUrl?: string
  metadata?: {
    activeAdAssets?: Array<{
      adId: string
      packageType: string
      assets: Array<{
        fileUrl: string
        assetType: string
      }>
    }>
  }
  sortPriority?: number
}

export type FeaturedCompaniesResponse = FeaturedCompanyItem[]

export type CompanyChannelContact = {
  type: string
  value: string
  contactName?: string | null
}

export type CompanyDetail = {
  id: string
  logoUrl?: string | null
  companyNameVi?: string | null
  companyNameCn?: string | null
  industry: string | string[]
  email?: string
  emails?: string[]
  phone?: string
  addresses: string[]
  description: string
  taxId?: string | null
  region?: string | null
  website?: string | null
  contactName?: string
  contactPhonesByName?: Array<{
    contactName: string
    contactPhones: string[]
  }>
  channelContacts?: CompanyChannelContact[]
}

export type AdminCompanyResponse = {
  id: string
  email: string
  membershipTier?: string
  role?: string
  logoUrl?: string | null
  companyNameVi?: string
  companyNameCn?: string
  phone?: string
  address?: string
  description?: string
  taxId?: string
  country?: string
  region?: string
  industry?: string
  website?: string
  contactName?: string
  contactPhone?: string
}

export type AddAdminCompanyContactsPayload = {
  emails?: string[]
  contactPhones?: string[]
  contactName?: string
}

export type AddAdminCompanyContactsResponse = {
  added: number
  skippedDuplicates: number
}
