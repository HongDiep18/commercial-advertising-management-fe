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

export async function deleteCompany(userId: string): Promise<void> {
  await api.request(`/auth/users/${userId}`, { method: "DELETE" })
}

export async function patchUserActive(userId: string, isActive: boolean): Promise<void> {
  await api.request(`/auth/users/${userId}/active`, {
    method: "PATCH",
    body: { isActive },
  })
}

type JoinedUserShape = { id: string; isActive?: boolean; deletedAt?: string | null }

type ProfileRequestInput = ProfileRequest & {
  submittedAt?: string
  createdAt?: string
  companyId?: string
  userId?: string
  user?: JoinedUserShape
  isActive?: boolean
  deletedAt?: string | null
  contactName?: string
}

function getUserIdFromItem(p: ProfileRequestInput): string | undefined {
  return p.user?.id ?? p.userId ?? undefined
}

function getIsActiveFromItem(p: ProfileRequestInput): boolean | undefined {
  if (p.user && "isActive" in p.user) return p.user.isActive as boolean | undefined
  return p.isActive
}

function getDeletedAtFromItem(p: ProfileRequestInput): string | null | undefined {
  if (p.user && "deletedAt" in p.user) return (p.user as JoinedUserShape).deletedAt
  return p.deletedAt ?? undefined
}

export function mapProfileRequestToCompanyRequest(p: ProfileRequestInput): ProfileRequestRow {
  return {
    id: p.id,
    companyName: p.companyNameVi || p.companyNameCn || "",
    email: p.email,
    contactName: p.contactName ?? "",
    industry: p.industry,
    country: p.country,
    status: p.status as ProfileRequestStatus,
    submittedAt: p.submittedAt ?? p.createdAt ?? "",
    companyId: p.companyId ?? undefined,
    userId: getUserIdFromItem(p),
    isActive: getIsActiveFromItem(p),
    deletedAt: getDeletedAtFromItem(p),
  }
}
