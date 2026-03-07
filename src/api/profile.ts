import { api } from "@/lib/api"
import { getStoredToken } from "@/api/auth"
import type { ProfileFormData } from "@/types/account"

export type ProfileResponse = ProfileFormData & { uploadLogo?: string | null }

export type GetProfileResponse = {
  message?: string
  data?: ProfileResponse | { profile?: ProfileResponse } | null
  profile?: ProfileResponse
}

function toProfileResponse(d: Record<string, unknown>): ProfileResponse {
  const any = d as Record<string, unknown> & {
    address?: string
    description?: string
    companyAddress?: string
    introduction?: string
    uploadLogo?: string | null
    logoUrl?: string | null
  }
  return {
    ...(d as ProfileResponse),
    address: (any.address ?? any.companyAddress ?? "") as string,
    description: (any.description ?? any.introduction ?? "") as string,
  }
}

function pickProfile(raw: GetProfileResponse): ProfileResponse | null {
  if (!raw) return null
  const d = raw.data
  if (d && typeof d === "object" && !Array.isArray(d)) {
    if ("companyNameVi" in d || "address" in d) return toProfileResponse(d as Record<string, unknown>)
    if ("profile" in d && d.profile && typeof d.profile === "object")
      return toProfileResponse(d.profile as Record<string, unknown>)
  }
  if ("companyNameVi" in raw || "address" in raw)
    return toProfileResponse(raw as Record<string, unknown>)
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
