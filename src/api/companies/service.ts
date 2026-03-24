import { api } from "@/lib/api"
import { profileFormDataToAdminCompanyPatchBody } from "./adminCompany.mapper"
import type {
  AdminCompanyResponse,
  CompanyCategoriesResponse,
  CompanyDirectoryQuery,
  CompanyDirectoryResponse,
  CompanyDetail,
  FeaturedCompaniesResponse,
} from "./types"
import type { ProfileFormData } from "@/types/account"

type QueryValue = string | number | boolean | undefined | Array<string | number | boolean>

function buildQuery(params: Record<string, QueryValue>): string {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return
    if (Array.isArray(value)) {
      value.forEach((v) => {
        if (v === undefined || v === null || v === "") return
        searchParams.append(key, String(v))
      })
      return
    }
    searchParams.append(key, String(value))
  })
  const qs = searchParams.toString()
  return qs ? `?${qs}` : ""
}

export async function getCompanyDirectory(
  query: CompanyDirectoryQuery
): Promise<CompanyDirectoryResponse> {
  const qs = buildQuery(query)
  const res = await api.request<CompanyDirectoryResponse>(`/companies${qs}`, {
    method: "GET",
  })
  return res
}

export async function getCompanyCategories(): Promise<CompanyCategoriesResponse> {
  const res = await api.request<CompanyCategoriesResponse>("/companies/categories", {
    method: "GET",
  })
  return res
}

export async function getFeaturedCompanies(): Promise<FeaturedCompaniesResponse> {
  const res = await api.request<FeaturedCompaniesResponse>("/companies/featured", {
    method: "GET",
  })
  return res
}

export async function getCompanyDetail(id: string): Promise<CompanyDetail> {
  const res = await api.request<CompanyDetail>(`/companies/${encodeURIComponent(id)}`, {
    method: "GET",
  })
  return res
}

export async function patchAdminCompany(
  companyId: string,
  body: Record<string, string>
): Promise<AdminCompanyResponse> {
  return api.request<AdminCompanyResponse>(`/admin/companies/${encodeURIComponent(companyId)}`, {
    method: "PATCH",
    body,
  })
}

export async function patchAdminCompanyWithLogo(
  companyId: string,
  data: ProfileFormData,
  logoFile: File
): Promise<AdminCompanyResponse> {
  const form = new FormData()
  const fields = profileFormDataToAdminCompanyPatchBody(data)
  for (const [key, value] of Object.entries(fields)) {
    form.append(key, value)
  }
  form.append("logo_url", logoFile, logoFile.name)
  return api.request<AdminCompanyResponse>(`/admin/companies/${encodeURIComponent(companyId)}`, {
    method: "PATCH",
    body: form,
  })
}
