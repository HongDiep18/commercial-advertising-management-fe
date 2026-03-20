import { useQuery } from "@tanstack/react-query"
import { getPointsBalance, getTierInfo, getPointsHistory } from "./service"
import type { PointsHistoryQuery } from "./types"

const loyaltyKeys = {
  all: ["loyalty"] as const,
  balance: () => [...loyaltyKeys.all, "balance"] as const,
  tierInfo: () => [...loyaltyKeys.all, "tier-info"] as const,
  history: (query: PointsHistoryQuery) =>
    [...loyaltyKeys.all, "history", query] as const,
}

export function usePointsBalance() {
  return useQuery({
    queryKey: loyaltyKeys.balance(),
    queryFn: getPointsBalance,
  })
}

export function useTierInfo(enabled: boolean = true) {
  return useQuery({
    queryKey: loyaltyKeys.tierInfo(),
    queryFn: getTierInfo,
    enabled,
  })
}

export function usePointsHistory(
  query: PointsHistoryQuery = { page: 1, limit: 20 }
) {
  return useQuery({
    queryKey: loyaltyKeys.history(query),
    queryFn: () => getPointsHistory(query),
  })
}
