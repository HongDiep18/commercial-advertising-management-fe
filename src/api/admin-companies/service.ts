import { api } from "@/lib/api"
import type {
  AdminCompaniesStatsResponse,
  AdminCompanyDetail,
  AdminCompanyUpdatePayload,
} from "./types"

export type AdminCompanyArchiveResponse = {
  id: string
  status: string
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

export async function archiveAdminCompany(
  companyId: string
): Promise<AdminCompanyArchiveResponse> {
  return api.request<AdminCompanyArchiveResponse>(
    `/admin/companies/${encodeURIComponent(companyId)}/archive`,
    {
      method: "PATCH",
    }
  )
}
