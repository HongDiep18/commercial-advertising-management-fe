import { ProfileRequestStatus, type ProfileRequestFilterId } from "@/types/admin"

export type AdminCompaniesStatsResponse = {
  activeCount: number
}

export type AdminCompanyContactType =
  | "email"
  | "tel"
  | "contact_person"
  | "fax"
  | "website"
  | "hotline"
  | "wechat"
  | "line"
  | "skype"
  | "zalo"
  | "facebook"
  | "viber"
  | "address"

export type AdminCompanyContact = {
  type: AdminCompanyContactType | string
  value: string
  contactName?: string | null
}

export type AdminCompanyContactPhoneGroup = {
  contactName?: string | null
  contactPhones: string[]
}

export type AdminCompanyMember = {
  userName?: string | null
  registeredEmail?: string | null
  registerEmail?: string | null
  memberSince?: string | null
  membershipTier?: string | null
}

export type AdminCompanyDetail = {
  id: string
  logoUrl?: string | null
  companyNameVi?: string | null
  companyNameEn?: string | null
  companyNameZh?: string | null
  industry?: string[] | string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  description?: string | null
  note?: string | null
  taxId?: string | null
  country?: string | null
  region?: string | null
  website?: string | null
  contactName?: string | null
  contactPhone?: string | null
  emails?: string[]
  contactPhonesByName?: AdminCompanyContactPhoneGroup[]
  contacts?: AdminCompanyContact[]
  member?: AdminCompanyMember | null
}

export type AdminCompanyUpdatePayload = {
  logoUrl?: string | null
  companyNameVi?: string | null
  companyNameEn?: string | null
  companyNameZh?: string | null
  taxId?: string | null
  country?: string | null
  region?: string | null
  industry?: string[]
  description?: string | null
  note?: string | null
  contacts?: AdminCompanyContact[]
}

export type AdminCompanyListSortBy = "createdAt" | "updatedAt" | "companyNameVi"

export type AdminCompanyListItem = {
  id: string
  userId?: string | null
  companyNameVi?: string | null
  companyNameEn?: string | null
  companyNameZh?: string | null
  industry?: string[] | null
  status?: string | null
  isActive?: boolean
  primaryEmail?: string | null
  primaryPhone?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

export type AdminCompanyListQuery = {
  search?: string
  status?: ProfileRequestStatus
  isActive?: boolean
  page?: number
  limit?: number
  sortBy?: AdminCompanyListSortBy
  sortOrder?: "asc" | "desc"
}

export type AdminCompanyAccountFilter = "all" | "active" | "inactive"

export function adminCompanyListSupportsAccountFilter(
  statusFilter: ProfileRequestFilterId
): boolean {
  return statusFilter === "all" || statusFilter === ProfileRequestStatus.APPROVED
}

export function adminCompanyListIsActiveFromAccountFilter(
  statusFilter: ProfileRequestFilterId,
  accountFilter: AdminCompanyAccountFilter
): boolean | undefined {
  if (!adminCompanyListSupportsAccountFilter(statusFilter)) return undefined
  if (accountFilter === "all") return undefined
  return accountFilter === "active"
}

export type AdminCompanyListPagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type AdminCompanyListResponse = {
  companies: AdminCompanyListItem[]
  pagination: AdminCompanyListPagination
}

export type AdminCompanyExportLocale = "en" | "vi" | "zh"

export type AdminCompanyExportFormat = "excel" | "csv"

export type AdminCompanyExportQuery = {
  type: AdminCompanyExportFormat
  locale: AdminCompanyExportLocale
  search?: string
  status?: ProfileRequestStatus
  isActive?: boolean
}

export type AdminCompanyExportResult = {
  blob: Blob
  filename: string
}

export type AdminUnlinkedCompanyStatus = "PENDING" | "APPROVED" | "REJECTED" | "DELETED"

export type AdminUnlinkedCompanyContact = {
  id: string
  type: string
  value: string
  contactName?: string | null
  createdAt: string
}

export type AdminUnlinkedCompanyItem = {
  id: string
  companyNameVi?: string | null
  companyNameEn?: string | null
  companyNameZh?: string | null
  taxId?: string | null
  industry?: string[]
  description: string
  logoUrl?: string | null
  country?: string | null
  region?: string | null
  status: AdminUnlinkedCompanyStatus
  isActive: boolean
  createdAt: string
  updatedAt: string
  contacts: AdminUnlinkedCompanyContact[]
}

export type AdminUnlinkedCompaniesResponse = {
  companies: AdminUnlinkedCompanyItem[]
}

export type AssignUserPayload = {
  email: string
  name?: string
}

export type AssignUserResponse = {
  userId: string
  email: string
  name: string
  role: string
  companyId: string
  action: "created" | "linked"
  setPasswordEmailSent: boolean
}

export type AdminCreateCompanyPayload = {
  company_name_vi: string
  company_name_zh: string
  company_name_en?: string
  phone: string
  tax_id: string
  contact_person: string
  company_address: string
  register_email: string
  company_email: string
  country: string
  region?: string
  industry: string[]
  website: string
  introduction: string
  note?: string
  fax?: string
  skype?: string
}

export type AdminCreateCompanyResponse = {
  companyId: string
  userId: string
  email: string
  role: string
  companyStatus: string
  setPasswordEmailSent: boolean
}
