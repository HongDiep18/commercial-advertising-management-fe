import { api } from "@/lib/api"
import type {
  CompanyCategoriesResponse,
  CompanyDirectoryQuery,
  CompanyDirectoryResponse,
} from "./types"

function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return
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


