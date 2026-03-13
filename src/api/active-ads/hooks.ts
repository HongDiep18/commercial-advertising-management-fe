import { useQuery } from "@tanstack/react-query"
import type { PopupCompaniesResponse } from "./types"
import { getPopupPriorityCompanies, getPopupRotationalCompanies } from "./service"

const activeAdsKeys = {
  all: ["active-ads"] as const,
  popupPriority: () => [...activeAdsKeys.all, "popup-priority"] as const,
  popupRotational: () => [...activeAdsKeys.all, "popup-rotational"] as const,
}

export function usePopupPriorityCompanies(): {
  data?: PopupCompaniesResponse
  isLoading: boolean
  isError: boolean
} {
  const { data, isLoading, isError } = useQuery({
    queryKey: activeAdsKeys.popupPriority(),
    queryFn: () => getPopupPriorityCompanies(),
  })

  return { data, isLoading, isError }
}

export function usePopupRotationalCompanies(): {
  data?: PopupCompaniesResponse
  isLoading: boolean
  isError: boolean
} {
  const { data, isLoading, isError } = useQuery({
    queryKey: activeAdsKeys.popupRotational(),
    queryFn: () => getPopupRotationalCompanies(),
  })

  return { data, isLoading, isError }
}

