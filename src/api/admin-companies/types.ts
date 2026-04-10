export type AdminCompaniesStatsResponse = {
  approvedCount: number
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
  contacts?: AdminCompanyContact[]
}
