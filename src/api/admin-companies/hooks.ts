import { useQuery } from "@tanstack/react-query"
import { getAdminCompaniesStats } from "./service"
import type { AdminCompaniesStatsResponse } from "./types"

export const adminCompaniesKeys = {
  all: ["admin", "companies"] as const,
  stats: () => [...adminCompaniesKeys.all, "stats"] as const,
}

export function useAdminCompaniesStats(enabled: boolean = true): {
  data?: AdminCompaniesStatsResponse
  isLoading: boolean
  isError: boolean
} {
  const { data, isLoading, isError } = useQuery({
    queryKey: adminCompaniesKeys.stats(),
    queryFn: getAdminCompaniesStats,
    enabled,
  })

  return { data, isLoading, isError }
}
