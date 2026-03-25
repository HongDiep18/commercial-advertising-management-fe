import { useQuery } from "@tanstack/react-query"
import type { PopupCompaniesResponse } from "./types"
import { getPopupPriorityCompanies, getPopupRotationalCompanies } from "./service"
import { getBookedDates, isSlotPackageType, type BookedDatesResponse } from "./bookedDates"

const activeAdsKeys = {
  all: ["active-ads"] as const,
  popupPriority: () => [...activeAdsKeys.all, "popup-priority"] as const,
  popupRotational: () => [...activeAdsKeys.all, "popup-rotational"] as const,
  bookedDates: (packageType: string) => ["ads", "booked-dates", packageType] as const,
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

export function useBookedDates(packageType: string | undefined): {
  data?: BookedDatesResponse
  isLoading: boolean
} {
  const enabled = isSlotPackageType(packageType)
  const { data, isLoading } = useQuery({
    queryKey: activeAdsKeys.bookedDates(packageType ?? ""),
    queryFn: () => getBookedDates(packageType!),
    enabled,
    staleTime: 60_000,
  })
  return { data, isLoading }
}

