import { api } from "@/lib/api"
import { getStoredToken } from "@/api/auth"
import type { ProfileFormData } from "@/types/account"

export type ProfileResponse = ProfileFormData & { uploadLogo?: string | null }

export type GetProfileResponse = {
  message?: string
  data?: ProfileResponse | { profile?: ProfileResponse } | null
  profile?: ProfileResponse
}

function pickProfile(raw: GetProfileResponse): ProfileResponse | null {
  if (!raw) return null
  const d = raw.data
  if (d && typeof d === "object" && !Array.isArray(d)) {
    if ("companyNameVi" in d) return d as ProfileResponse
    if ("profile" in d && d.profile && typeof d.profile === "object")
      return d.profile as ProfileResponse
  }
  if ("companyNameVi" in raw) return raw as ProfileResponse
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
