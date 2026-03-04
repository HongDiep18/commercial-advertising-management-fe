import { api } from "@/lib/api"
import type { UpdateProfilePayload } from "@/types/auth"

export type GetProfileResponse = {
  message?: string
  data?: UpdateProfilePayload | null
}

export async function getProfile(): Promise<UpdateProfilePayload | null> {
  const res = await api.request<GetProfileResponse>("/auth/profile", {
    method: "GET",
  })
  return (res.data as UpdateProfilePayload | null) ?? null
}

