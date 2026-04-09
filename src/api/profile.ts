import { getStoredToken } from "@/api/auth"
import { categories } from "@/components/directory/DirectorySidebar"
import { api } from "@/lib/api"
import type { ProfileFormData } from "@/types/account"
import type { UpdateProfileResponse } from "@/types/auth"
import { categoryNameToIdMap } from "@/utils/companyHelpers"

const VALID_INDUSTRY_IDS = new Set(categories.map((c) => c))

const INDUSTRY_KEYS = [
  "industry",
  "industryId",
  "industry_id",
  "industry_Name",
  "industry_name",
  "category",
  "categoryId",
  "category_id",
  "category_Name",
  "category_name",
]

export type ProfileResponse = ProfileFormData & {
  uploadLogo?: string | null
  membershipTier?: string
}

export type GetProfileResponse = {
  message?: string
  data?: ProfileResponse | { profile?: ProfileResponse } | null
  profile?: ProfileResponse
}

function firstDefined<T>(record: Record<string, unknown>, keys: string[]): T | undefined {
  for (const k of keys) {
    const v = record[k]
    if (v !== undefined && v !== null) return v as T
  }
  return undefined
}

function normalizeIndustryId(value: unknown): string {
  if (value === undefined || value === null) return ""
  const v = String(value).trim()
  if (!v) return ""
  if (VALID_INDUSTRY_IDS.has(v)) return v
  const fromMap = categoryNameToIdMap[v]
  if (fromMap) return fromMap
  const lower = v.toLowerCase()
  if (VALID_INDUSTRY_IDS.has(lower)) return lower
  const matchedId = categories.find((c) => c.toLowerCase() === lower)
  if (matchedId) return matchedId
  return ""
}

function normalizeIndustryArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((x) => normalizeIndustryId(x)).filter(Boolean)
  }
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value) as unknown
      if (Array.isArray(parsed)) {
        return parsed.map((x) => normalizeIndustryId(x)).filter(Boolean)
      }
    } catch {
      /* not JSON */
    }
    const one = normalizeIndustryId(value)
    return one ? [one] : []
  }
  return []
}

function getIndustryRaw(d: Record<string, unknown>): unknown {
  if (Array.isArray(d.industry)) return d.industry
  if (Array.isArray(d.industries)) return d.industries
  if (Array.isArray(d.selectedIndustries)) return d.selectedIndustries
  return firstDefined<unknown>(d, INDUSTRY_KEYS)
}

function toProfileResponse(d: Record<string, unknown>): ProfileResponse {
  const rawIndustry = getIndustryRaw(d)
  return {
    ...(d as ProfileResponse),
    contactName: (firstDefined<string>(d, ["contactName", "contactPerson", "contact_person"]) ??
      "") as string,
    address: (firstDefined<string>(d, ["address", "companyAddress"]) ?? "") as string,
    description: (firstDefined<string>(d, ["description", "introduction"]) ?? "") as string,
    uploadLogo: firstDefined<string | null>(d, ["logoUrl", "uploadLogo"]) ?? undefined,
    membershipTier: (firstDefined<string>(d, ["membershipTier", "membership_tier", "membership"]) ??
      undefined) as string | undefined,
    industry: normalizeIndustryArray(rawIndustry),
  }
}

export function getProfileAndLogoFromUpdateData(data: UpdateProfileResponse["data"]): {
  profile: ProfileResponse | null
  logoUrl: string | null
} {
  if (!data || typeof data !== "object") return { profile: null, logoUrl: null }

  const d = data as Record<string, unknown>
  const logoUrl =
    (d.logoUrl as string | null | undefined) ?? (d.logo_url as string | null | undefined) ?? null
  const profile = toProfileResponse(d)

  return { profile, logoUrl: logoUrl ?? null }
}

function pickProfile(raw: GetProfileResponse): ProfileResponse | null {
  if (!raw) return null
  const candidate = (raw as { data?: unknown }).data ?? raw
  if (candidate && typeof candidate === "object" && !Array.isArray(candidate))
    return toProfileResponse(candidate as Record<string, unknown>)
  return null
}

export async function getProfile(): Promise<ProfileResponse | null> {
  const token = getStoredToken()
  const headers: HeadersInit = {}
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  const res = await api.request<GetProfileResponse>("/auth/profile", {
    method: "GET",
    headers,
  })
  return pickProfile(res)
}
