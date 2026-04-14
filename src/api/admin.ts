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

export async function patchCompanyActive(companyId: string, isActive: boolean): Promise<void> {
  await api.request(`/admin/companies/${encodeURIComponent(companyId)}/active`, {
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
  company_name_vi?: string
  company_name_en?: string
  company_name_zh?: string
  companyNameEn?: string
  companyNameZh?: string
  company_email?: string
  contact_person?: string
  contactPerson?: string
  contacts?: unknown
  companyContacts?: unknown
  company_contacts?: unknown
}

type ContactRowInput = {
  type?: unknown
  value?: unknown
  contactName?: unknown
  contact_name?: unknown
}

function cleanString(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
}

function firstString(record: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = cleanString(record[key])
    if (value) return value
  }
  return ""
}

function getContactsFromItem(p: ProfileRequestInput): ContactRowInput[] {
  const sources = [p.contacts, p.companyContacts, p.company_contacts]

  for (const source of sources) {
    if (Array.isArray(source)) return source as ContactRowInput[]
  }

  return []
}

function getCompanyNameFromItem(p: ProfileRequestInput): string {
  return firstString(p as Record<string, unknown>, [
    "companyNameVi",
    "company_name_vi",
    "companyNameZh",
    "company_name_zh",
    "companyNameCn",
    "company_name_cn",
    "companyNameEn",
    "company_name_en",
    "companyName",
  ])
}

function getContactNameFromContacts(contacts: ContactRowInput[]): string {
  for (const contact of contacts) {
    const contactName = firstString(contact as Record<string, unknown>, [
      "contactName",
      "contact_name",
    ])
    if (contactName) return contactName
  }

  return ""
}

function getEmailFromContacts(contacts: ContactRowInput[]): string {
  for (const contact of contacts) {
    const type = cleanString(contact.type).toLowerCase()
    const value = cleanString(contact.value)
    if (type === "email" && value) return value
  }

  return ""
}

function getRegisteredEmailFromItem(p: ProfileRequestInput): string {
  return cleanString(p.email)
}

function getCompanyEmailFromItem(p: ProfileRequestInput): string {
  const direct = firstString(p as Record<string, unknown>, ["companyEmail", "company_email"])
  if (direct) return direct

  return getEmailFromContacts(getContactsFromItem(p))
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
  const statusRaw = p.status ?? p.registrationStatus ?? ""
  const contacts = getContactsFromItem(p)
  const registeredEmail = getRegisteredEmailFromItem(p)
  const companyEmail = getCompanyEmailFromItem(p)
  return {
    id: p.id,
    companyName: getCompanyNameFromItem(p),
    email: registeredEmail || companyEmail,
    registeredEmail,
    companyEmail,
    contactName:
      firstString(p as Record<string, unknown>, ["contactName", "contact_person", "contactPerson"]) ||
      getContactNameFromContacts(contacts),
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
