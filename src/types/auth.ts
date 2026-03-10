export type LoginPayload = {
  email: string
  password: string
}

export type AuthUserFromApi = {
  id: string
  email: string
  name?: string
  role?: string
  contributionPoints?: number
  commercialPoints?: number
  createdAt?: string
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
  company_name_cn: string
  phone: string
  tax_id: string
  contact_person: string
  contact_phone: string
  company_address: string
  email: string
  country: string
  industry: string
  website: string
  introduction: string
  captcha: string
}

export type RegisterResponse = {
  message?: string
  data?: unknown
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
  country: string
  industry: string
  website: string
  introduction: string
  captcha: string
}): RegisterPayload {
  return {
    company_name_vi: form.companyNameVi,
    company_name_cn: form.companyNameCn,
    phone: form.phone,
    tax_id: form.taxId,
    contact_person: form.contactPerson,
    contact_phone: form.contactPhone,
    company_address: form.companyAddress,
    email: form.email,
    country: form.country,
    industry: form.industry,
    website: form.website,
    introduction: form.introduction,
    captcha: form.captcha,
  }
}

export type UpdateProfilePayload = {
  upload_logo?: string
  company_name_vi: string
  company_name_cn: string
  phone: string
  tax_id: string
  contact_person: string
  contact_phone: string
  company_address: string
  email: string
  country: string
  region: string
  industry: string
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
