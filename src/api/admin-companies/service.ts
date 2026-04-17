import { api } from "@/lib/api"
import type {
  AdminCompaniesStatsResponse,
  AdminCompanyDetail,
  AdminCompanyListItem,
  AdminCompanyListQuery,
  AdminCompanyListResponse,
  AdminCompanyUpdatePayload,
} from "./types"

export type AdminCompanyArchiveResponse = {
  id: string
  status: string
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v)
}

function buildListQuery(params: Record<string, string | number | boolean | undefined>): string {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return
    searchParams.append(key, String(value))
  })
  const qs = searchParams.toString()
  return qs ? `?${qs}` : ""
}

function emptyPagination(page: number, limit: number): AdminCompanyListResponse["pagination"] {
  return { page, limit, total: 0, totalPages: 0 }
}

function parseAdminCompanyListResponse(
  raw: unknown,
  fallbackPage: number,
  fallbackLimit: number
): AdminCompanyListResponse {
  if (!isRecord(raw)) {
    return { companies: [], pagination: emptyPagination(fallbackPage, fallbackLimit) }
  }

  const listRaw =
    (Array.isArray(raw.companies) && raw.companies) ||
    (Array.isArray(raw.data) && raw.data) ||
    (Array.isArray(raw.items) && raw.items) ||
    []

  const companies = listRaw as AdminCompanyListItem[]
  const paginationRaw = raw.pagination

  if (!isRecord(paginationRaw)) {
    return { companies, pagination: emptyPagination(fallbackPage, fallbackLimit) }
  }

  return {
    companies,
    pagination: {
      page: Number(paginationRaw.page) || fallbackPage,
      limit: Number(paginationRaw.limit) || fallbackLimit,
      total: Number(paginationRaw.total) || 0,
      totalPages: Number(paginationRaw.totalPages) || 0,
    },
  }
}

export async function listAdminCompanies(
  query: AdminCompanyListQuery
): Promise<AdminCompanyListResponse> {
  const page = query.page ?? 1
  const limit = query.limit ?? 20
  const qs = buildListQuery({
    search: query.search?.trim() || undefined,
    status: query.status,
    isActive: query.isActive,
    page,
    limit,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
  })
  const raw = await api.request<unknown>(`/admin/companies${qs}`, { method: "GET" })
  return parseAdminCompanyListResponse(raw, page, limit)
}

export async function getAdminCompaniesStats(): Promise<AdminCompaniesStatsResponse> {
  return api.request<AdminCompaniesStatsResponse>("/admin/companies/stats", {
    method: "GET",
  })
}

export async function getAdminCompanyDetail(companyId: string): Promise<AdminCompanyDetail> {
  return api.request<AdminCompanyDetail>(`/admin/companies/${encodeURIComponent(companyId)}`, {
    method: "GET",
  })
}

export async function updateAdminCompany(
  companyId: string,
  payload: AdminCompanyUpdatePayload
): Promise<AdminCompanyDetail> {
  return api.request<AdminCompanyDetail>(`/admin/companies/${encodeURIComponent(companyId)}`, {
    method: "PATCH",
    body: payload,
  })
}

export async function updateAdminCompanyWithLogo(
  companyId: string,
  payload: AdminCompanyUpdatePayload,
  logoFile: File
): Promise<AdminCompanyDetail> {
  const form = new FormData()

  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined) continue
    if (key === "contacts" || key === "industry") {
      form.append(key, JSON.stringify(value))
      continue
    }
    form.append(key, value == null ? "" : String(value))
  }

  form.append("logo_url", logoFile, logoFile.name)

  return api.request<AdminCompanyDetail>(`/admin/companies/${encodeURIComponent(companyId)}`, {
    method: "PATCH",
    body: form,
  })
}

export async function archiveAdminCompany(companyId: string): Promise<AdminCompanyArchiveResponse> {
  return api.request<AdminCompanyArchiveResponse>(
    `/admin/companies/${encodeURIComponent(companyId)}/archive`,
    {
      method: "PATCH",
    }
  )
}
