import { api } from "@/lib/api"
import { industryFromUnknown } from "@/api/companies/adminCompany.mapper"
import {
  type ProfileRequest,
  type ProfileRequestRow,
  ProfileRequestStatus,
  type ProfileRequestStatusUpdate,
} from "@/types/admin"

export type ApiPagination = {
  page: number
  limit: number
  total: number
  totalPages: number
  sortBy?: string
  sortOrder?: "asc" | "desc" | string
}

export type AdminListProfileRequestsQuery = {
  page?: number
  limit?: number
  status?: ProfileRequestStatus | string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export type AdminListProfileRequestsResponse = {
  data: ProfileRequest[]
  pagination?: ApiPagination
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v)
}

export function parseAllProfileRequestsResponse(raw: unknown): AdminListProfileRequestsResponse {
  if (Array.isArray(raw)) {
    return { data: raw as ProfileRequest[], pagination: undefined }
  }
  if (!isRecord(raw)) {
    return { data: [] }
  }

  const pagination = raw.pagination as ApiPagination | undefined

  if (Array.isArray(raw.requests)) {
    return {
      data: raw.requests as ProfileRequest[],
      pagination,
    }
  }

  if (Array.isArray(raw.data)) {
    return {
      data: raw.data as ProfileRequest[],
      pagination,
    }
  }

  if (isRecord(raw.data) && Array.isArray(raw.data.data)) {
    const inner = raw.data as Record<string, unknown> & {
      data: ProfileRequest[]
      pagination?: ApiPagination
    }
    return {
      data: inner.data,
      pagination: inner.pagination ?? pagination,
    }
  }

  if (isRecord(raw.data) && Array.isArray(raw.data.requests)) {
    const inner = raw.data as Record<string, unknown> & {
      requests: ProfileRequest[]
      pagination?: ApiPagination
    }
    return {
      data: inner.requests,
      pagination: inner.pagination ?? pagination,
    }
  }

  if (Array.isArray(raw.items)) {
    return {
      data: raw.items as ProfileRequest[],
      pagination,
    }
  }

  return { data: [] }
}

function buildQuery(query?: AdminListProfileRequestsQuery): string {
  if (!query) return ""
  const params = new URLSearchParams()
  if (query.page) params.set("page", String(query.page))
  if (query.limit) params.set("limit", String(query.limit))
  if (query.status) params.set("status", String(query.status))
  if (query.sortBy) params.set("sortBy", query.sortBy)
  if (query.sortOrder) params.set("sortOrder", query.sortOrder)
  const qs = params.toString()
  return qs ? `?${qs}` : ""
}

export async function getAllProfileRequests(
  query?: AdminListProfileRequestsQuery
): Promise<AdminListProfileRequestsResponse> {
  const qs = buildQuery(query)
  const res = await api.request<unknown>(`/auth/all-profile-requests${qs}`, {
    method: "GET",
  })
  return parseAllProfileRequestsResponse(res)
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
  registrationStatus?: string
  industries?: unknown
  companyEmail?: string
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

function getEmailFromItem(p: ProfileRequestInput): string {
  const direct = typeof p.email === "string" ? p.email.trim() : ""
  if (direct) return direct
  const fallback = p.companyEmail as unknown
  return typeof fallback === "string" ? fallback.trim() : ""
}

export function mapProfileRequestToCompanyRequest(p: ProfileRequestInput): ProfileRequestRow {
  const statusRaw = p.status ?? p.registrationStatus ?? ""
  return {
    id: p.id,
    companyName: p.companyNameVi || p.companyNameCn || "",
    email: getEmailFromItem(p),
    contactName: p.contactName ?? "",
    industry: industryFromUnknown(p.industries ?? p.industry).join(", "),
    country: p.country,
    status: statusRaw as ProfileRequestStatus,
    submittedAt: p.submittedAt ?? p.createdAt ?? "",
    companyId: p.companyId ?? undefined,
    userId: getUserIdFromItem(p),
    isActive: getIsActiveFromItem(p),
    deletedAt: getDeletedAtFromItem(p),
  }
}
