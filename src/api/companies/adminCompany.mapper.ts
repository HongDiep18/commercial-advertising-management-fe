import type { AdminCompanyResponse } from "./types"
import type { ProfileFormData } from "@/types/account"
import { normalizeWebsiteHttpScheme } from "@/types/auth"

type AnyObj = Record<string, unknown>
type CompanyRowLike = {
  companyName: string
  email: string
  contactName: string
  country: string
  industry: string
}

/** Normalize API / row industry to id list (string[]). */
export function industryFromUnknown(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean)
  if (typeof value === "string" && value.trim()) {
    try {
      const p = JSON.parse(value) as unknown
      if (Array.isArray(p)) return p.map(String).filter(Boolean)
    } catch {
      /* not JSON */
    }
    return [value.trim()]
  }
  return []
}

function industryToRowDisplay(value: unknown): string {
  return industryFromUnknown(value).join(", ")
}

/** Table/label text: arrays, JSON array strings, or plain strings (incl. comma‑separated from list APIs). */
export function formatIndustryForDisplay(value: unknown): string {
  if (value == null || value === "") return ""
  if (Array.isArray(value)) return industryFromUnknown(value).join(", ")
  if (typeof value === "string") {
    const s = value.trim()
    if (!s) return ""
    try {
      const p = JSON.parse(s) as unknown
      if (Array.isArray(p)) return industryFromUnknown(p).join(", ")
    } catch {
      return s
    }
    return s
  }
  return industryToRowDisplay(value)
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
  industry: [],
  website: "",
  description: "",
}

export type AdminCompanyPatchFields = Record<string, string | string[]>

export function profileFormDataToAdminCompanyPatchBody(
  data: ProfileFormData
): AdminCompanyPatchFields {
  return {
    company_name_vi: data.companyNameVi ?? "",
    company_name_zh: data.companyNameCn ?? "",
    phone: data.phone ?? "",
    tax_id: data.taxId ?? "",
    contact_person: data.contactName ?? "",
    contact_phone: data.contactPhone ?? "",
    company_address: data.address ?? "",
    email: data.email ?? "",
    country: data.country ?? "",
    region: data.region ?? "",
    industry: data.industry ?? [],
    website: normalizeWebsiteHttpScheme(data.website ?? ""),
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
    companyNameCn: read(u, "companyNameCn", "companyNameZh", "company_name_zh"),
    phone: read(u, "phone"),
    taxId: read(u, "taxId", "tax_id"),
    contactName: read(u, "contactName", "contact_person"),
    contactPhone: read(u, "contactPhone", "contact_phone"),
    address: read(u, "address", "company_address"),
    email: read(u, "email") || fallbackEmail || "",
    country: read(u, "country"),
    region: read(u, "region"),
    industry: industryFromUnknown(u.industry ?? u.industries),
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
    industry: industryFromUnknown(row.industry),
  }
}

export function companyDetailToProfileForm(
  detail: Record<string, unknown>,
  row: CompanyRowLike
): ProfileFormData {
  return {
    ...EMPTY_PROFILE_FORM,
    companyNameVi: read(detail, "companyNameVi", "company_name_vi") || row.companyName,
    companyNameCn: read(detail, "companyNameCn", "companyNameZh", "company_name_zh"),
    phone: read(detail, "phone"),
    taxId: read(detail, "taxId", "tax_id"),
    contactName: read(detail, "contactName", "contact_name", "contact_person") || row.contactName,
    contactPhone: read(detail, "contactPhone", "contact_phone"),
    address: read(detail, "address", "company_address"),
    email: read(detail, "email") || row.email,
    country: read(detail, "country") || row.country,
    region: read(detail, "region"),
    industry: (() => {
      const fromDetail = industryFromUnknown(detail.industry ?? detail.industries)
      return fromDetail.length > 0 ? fromDetail : industryFromUnknown(row.industry)
    })(),
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
    industry:
      industryToRowDisplay(detail.industry ?? detail.industries) ||
      industryToRowDisplay(row.industry),
    country: read(detail, "country") || row.country,
  }
}
