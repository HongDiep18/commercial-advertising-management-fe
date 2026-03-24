import type { AdminCompanyResponse } from "./types"
import type { ProfileFormData } from "@/types/account"

type AnyObj = Record<string, unknown>
type CompanyRowLike = {
  companyName: string
  email: string
  contactName: string
  country: string
  industry: string
}

function read(obj: AnyObj, ...keys: string[]): string {
  for (const k of keys) {
    const v = obj[k]
    if (v != null) return String(v)
  }
  return ""
}

export function pickLogoUrlFromApiResponse(obj: unknown): string | null {
  if (!obj || typeof obj !== "object") return null
  const u = obj as AnyObj
  const v = u.logoUrl ?? u.logo_url
  if (typeof v === "string" && v.trim()) return v.trim()
  return null
}

export const EMPTY_PROFILE_FORM: ProfileFormData = {
  companyNameVi: "",
  companyNameCn: "",
  phone: "",
  taxId: "",
  contactName: "",
  contactPhone: "",
  address: "",
  email: "",
  country: "",
  region: "",
  industry: "",
  website: "",
  description: "",
}

export function profileFormDataToAdminCompanyPatchBody(
  data: ProfileFormData
): Record<string, string> {
  return {
    company_name_vi: data.companyNameVi ?? "",
    company_name_cn: data.companyNameCn ?? "",
    phone: data.phone ?? "",
    tax_id: data.taxId ?? "",
    contact_person: data.contactName ?? "",
    contact_phone: data.contactPhone ?? "",
    company_address: data.address ?? "",
    email: data.email ?? "",
    country: data.country ?? "",
    region: data.region ?? "",
    industry: data.industry ?? "",
    website: data.website ?? "",
    introduction: data.description ?? "",
  }
}

export function adminCompanyResponseToProfileForm(
  res: AdminCompanyResponse,
  fallbackEmail?: string
): ProfileFormData {
  const u = res as AnyObj

  return {
    companyNameVi: read(u, "companyNameVi", "company_name_vi"),
    companyNameCn: read(u, "companyNameCn", "company_name_cn"),
    phone: read(u, "phone"),
    taxId: read(u, "taxId", "tax_id"),
    contactName: read(u, "contactName", "contact_person"),
    contactPhone: read(u, "contactPhone", "contact_phone"),
    address: read(u, "address", "company_address"),
    email: read(u, "email") || fallbackEmail || "",
    country: read(u, "country"),
    region: read(u, "region"),
    industry: read(u, "industry"),
    website: read(u, "website"),
    description: read(u, "description", "introduction"),
  }
}

export function rowToProfileForm(row: CompanyRowLike): ProfileFormData {
  return {
    ...EMPTY_PROFILE_FORM,
    companyNameVi: row.companyName,
    contactName: row.contactName,
    email: row.email,
    country: row.country,
    industry: row.industry,
  }
}

export function companyDetailToProfileForm(
  detail: Record<string, unknown>,
  row: CompanyRowLike
): ProfileFormData {
  return {
    ...EMPTY_PROFILE_FORM,
    companyNameVi: read(detail, "companyNameVi", "company_name_vi") || row.companyName,
    companyNameCn: read(detail, "companyNameCn", "company_name_cn"),
    phone: read(detail, "phone"),
    taxId: read(detail, "taxId", "tax_id"),
    contactName: read(detail, "contactName", "contact_name", "contact_person") || row.contactName,
    contactPhone: read(detail, "contactPhone", "contact_phone"),
    address: read(detail, "address", "company_address"),
    email: read(detail, "email") || row.email,
    country: read(detail, "country") || row.country,
    region: read(detail, "region"),
    industry: read(detail, "industry") || row.industry,
    website: read(detail, "website"),
    description: read(detail, "description", "introduction"),
  }
}

export function companyDetailToRequestRow<T extends CompanyRowLike>(
  detail: Record<string, unknown>,
  row: T
): T {
  return {
    ...row,
    email: read(detail, "email") || row.email,
    contactName: read(detail, "contactName", "contact_name", "contact_person") || row.contactName,
    industry: read(detail, "industry") || row.industry,
    country: read(detail, "country") || row.country,
  }
}
