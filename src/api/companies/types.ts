export type CompanyDirectorySortBy = "name" | "industry" | "createdAt"
export type CompanyDirectorySortOrder = "asc" | "desc"

export type CompanyDirectoryQuery = {
  search?: string
  industry?: string | string[]
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
  industry: string
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
}

export type FeaturedCompanyItem = {
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
  adLinkUrl?: string
  metadata?: Record<string, unknown>
  sortPriority?: number
}

export type FeaturedCompaniesResponse = FeaturedCompanyItem[]

export type CompanyDetail = {
  id: string
  logoUrl?: string | null
  companyNameVi?: string | null
  companyNameCn?: string | null
  industry: string
  email: string
  phone: string
  address: string
  description: string
  taxId?: string | null
  region?: string | null
  website?: string | null
  contactName: string
}
