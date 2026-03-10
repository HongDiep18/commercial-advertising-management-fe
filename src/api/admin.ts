import { api } from "@/lib/api"
import {
  type ProfileRequest,
  type ProfileRequestRow,
  ProfileRequestStatus,
  type ProfileRequestStatusUpdate,
} from "@/types/admin"

type GetProfileRequestsResponse = { data: ProfileRequest[] } | ProfileRequest[]

export async function getAllProfileRequests(): Promise<ProfileRequest[]> {
  const res = await api.request<GetProfileRequestsResponse>("/auth/all-profile-requests", {
    method: "GET",
  })
  if (Array.isArray(res)) return res
  if (res?.data && Array.isArray(res.data)) return res.data
  return []
}

export async function updateProfileRequestStatus(
  id: string,
  status: ProfileRequestStatusUpdate
): Promise<void> {
  await api.request(`/auth/profile-requests/${id}/status`, {
    method: "PATCH",
    body: { status },
  })
}

export function mapProfileRequestToCompanyRequest(
  p: ProfileRequest & { submittedAt?: string; createdAt?: string }
): ProfileRequestRow {
  return {
    id: p.id,
    companyName: p.companyNameVi || p.companyNameCn || "",
    email: p.email,
    contactName: (p as { contactName?: string }).contactName ?? "",
    industry: p.industry,
    country: p.country,
    status: p.status as ProfileRequestStatus,
    submittedAt: p.submittedAt ?? p.createdAt ?? "",
  }
}
