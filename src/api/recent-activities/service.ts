import { api } from "@/lib/api"
import type { RecentActivitiesQuery, RecentActivitiesResponse } from "./types"

function buildQuery(query: RecentActivitiesQuery): string {
  const params = new URLSearchParams()
  if (typeof query.page === "number") params.set("page", String(query.page))
  if (typeof query.limit === "number") params.set("limit", String(query.limit))
  const qs = params.toString()
  return qs ? `?${qs}` : ""
}

export async function getRecentActivities(
  query: RecentActivitiesQuery = {}
): Promise<RecentActivitiesResponse> {
  const qs = buildQuery(query)
  return api.request<RecentActivitiesResponse>(`/admin/recent-activities${qs}`, {
    method: "GET",
  })
}
