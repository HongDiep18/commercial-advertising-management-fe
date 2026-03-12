export type CompanyDirectorySortBy = "name" | "industry" | "createdAt"
export type CompanyDirectorySortOrder = "asc" | "desc"

export type CompanyDirectoryQuery = {
  search?: string
  industry?: string
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

