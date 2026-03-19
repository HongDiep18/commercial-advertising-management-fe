import { api } from "@/lib/api"
import type {
  PointsBalanceResponse,
  TierInfoResponse,
  PointsHistoryResponse,
  PointsHistoryQuery,
} from "./types"

export async function getPointsBalance(): Promise<PointsBalanceResponse> {
  return api.request<PointsBalanceResponse>("/loyalty/balance", {
    method: "GET",
  })
}

export async function getTierInfo(): Promise<TierInfoResponse> {
  return api.request<TierInfoResponse>("/loyalty/tier-info", {
    method: "GET",
  })
}

export async function getPointsHistory(
  query: PointsHistoryQuery = {}
): Promise<PointsHistoryResponse> {
  const params = new URLSearchParams()
  if (query.page) params.set("page", String(query.page))
  if (query.limit) params.set("limit", String(query.limit))
  if (query.source) params.set("source", query.source)

  const queryString = params.toString()
  const url = queryString ? `/loyalty/history?${queryString}` : "/loyalty/history"

  return api.request<PointsHistoryResponse>(url, { method: "GET" })
}
