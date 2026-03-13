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
  adLinkUrl?: string
  sortPriority?: number
}

export type PopupCompaniesResponse = PopupCompanyItem[]

