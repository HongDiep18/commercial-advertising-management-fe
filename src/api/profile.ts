import { api } from "@/lib/api"
import { getStoredToken } from "@/api/auth"
import type { ProfileFormData } from "@/types/account"
import type { UpdateProfileResponse } from "@/types/auth"

export type ProfileResponse = ProfileFormData & { uploadLogo?: string | null }

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

function toProfileResponse(d: Record<string, unknown>): ProfileResponse {
  return {
    ...(d as ProfileResponse),
    contactName: (firstDefined<string>(d, ["contactName", "contactPerson", "contact_person"]) ?? "") as string,
    address: (firstDefined<string>(d, ["address", "companyAddress"]) ?? "") as string,
    description: (firstDefined<string>(d, ["description", "introduction"]) ?? "") as string,
    uploadLogo: firstDefined<string | null>(d, ["logoUrl", "uploadLogo"]) ?? undefined,
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
