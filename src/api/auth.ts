import { api } from "@/lib/api"

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  message?: string
  data?: unknown
  token?: string
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  return api.request<LoginResponse>("/api/v1/auth/login", {
    method: "POST",
    body: payload,
  })
}

export interface RegisterPayload {
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
  captcha: string
}

export interface RegisterResponse {
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
  region: string
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
    region: form.region,
    industry: form.industry,
    website: form.website,
    introduction: form.introduction,
    captcha: form.captcha,
  }
}

export async function register(payload: RegisterPayload): Promise<RegisterResponse> {
  return api.request<RegisterResponse>("/api/v1/auth/register", {
    method: "POST",
    body: payload,
  })
}
