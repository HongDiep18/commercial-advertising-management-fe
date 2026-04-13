export type LoginPayload = {
  email: string
  password: string
}

export type AuthUserFromApi = {
  id: string
  email: string
  name?: string
  role?: string
  membershipTier?: string
  companyId?: string | null
  primaryIndustry?: string | null
  selectedIndustries?: string[]
}

export type LoginResponse = {
  message?: string
  data?: {
    user?: AuthUserFromApi
    token?: string
    accessToken?: string
  }
  token?: string
  accessToken?: string
  user?: AuthUserFromApi
}

export type RegisterPayload = {
  company_name_vi: string
  company_name_zh: string
  phone: string
  tax_id: string
  contact_person: string
  company_address: string
  company_email: string
  country: string
  region: string
  industry: string[]
  website: string
  introduction: string
  note: string
  captchaId: string
  captcha: string
}

export type RegisterResponse = {
  message?: string
  data?: unknown
}

export function normalizeWebsiteHttpScheme(website: string): string {
  const raw = website.trim()
  if (!raw) return raw
  return raw.replace(/^https?:\/\//i, (m) => m.toLowerCase())
}

function normalizeWebsiteForPayload(website: string): string {
  const raw = website.trim()
  if (!raw) return raw
  if (/^https?:\/\//i.test(raw)) {
    return normalizeWebsiteHttpScheme(raw)
  }
  return `https://${raw}`
}

export function formDataToRegisterPayload(form: {
  companyNameVi: string
  companyNameCn: string
  phone: string
  taxId: string
  contactPerson: string
  contactPhone: string
  companyAddress: string
  email: string
  companyEmail: string
  country: string
  industry: string[]
  website: string
  introduction: string
  note?: string
  captchaId: string
  captcha: string
}): RegisterPayload {
  return {
    company_name_vi: form.companyNameVi,
    company_name_zh: form.companyNameCn,
    phone: (form.contactPhone || form.phone).trim(),
    tax_id: form.taxId,
    contact_person: form.contactPerson,
    company_address: form.companyAddress,
    company_email: form.companyEmail,
    country: form.country,
    region: "other-region",
    industry: form.industry,
    website: normalizeWebsiteForPayload(form.website),
    introduction: form.introduction,
    note: form.note ?? "",
    captchaId: form.captchaId,
    captcha: form.captcha,
  }
}

export type UpdateProfilePayload = {
  upload_logo?: string
  company_name_vi: string
  company_name_zh: string
  phone: string
  tax_id: string
  contact_person: string
  company_address: string
  email: string
  country: string
  region: string
  industry: string[]
  website: string
  introduction: string
}

export type UpdateProfileResponse = {
  message?: string
  data?: ProfileData
}

export type ProfileData = {
  logoUrl?: string | null
  [key: string]: unknown
}

export type SetPasswordPayload = {
  token: string
  password: string
}

export type SetPasswordResponse = {
  message?: string
  data?: unknown
}
