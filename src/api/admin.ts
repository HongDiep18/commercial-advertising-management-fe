import { api } from "@/lib/api"
import type { CompanyRequest, ProfileRequest } from "@/types/admin"

type GetProfileRequestsResponse = { data: ProfileRequest[] } | ProfileRequest[]

export async function getAllProfileRequests(): Promise<ProfileRequest[]> {
  const res = await api.request<GetProfileRequestsResponse>("/auth/all-profile-requests", {
    method: "GET",
  })
  if (Array.isArray(res)) return res
  if (res?.data && Array.isArray(res.data)) return res.data
  return []
}

/** Map API ProfileRequest to UI CompanyRequest. */
export function mapProfileRequestToCompanyRequest(p: ProfileRequest & { submittedAt?: string; createdAt?: string }): CompanyRequest {
  return {
    id: p.id,
    companyName: p.companyNameVi || p.companyNameCn || "",
    email: p.email,
    contactPerson: p.contactPerson,
    industry: p.industry,
    country: p.country,
    status: p.status as "pending" | "approved" | "rejected",
    submittedAt: p.submittedAt ?? p.createdAt ?? "",
  }
}
