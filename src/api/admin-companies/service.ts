import { api } from "@/lib/api"
import type { AdminCompaniesStatsResponse } from "./types"

export async function getAdminCompaniesStats(): Promise<AdminCompaniesStatsResponse> {
  return api.request<AdminCompaniesStatsResponse>("/admin/companies/stats", {
    method: "GET",
  })
}
