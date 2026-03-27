import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import {
  getCompanyActiveAds,
  saveActiveAd,
  type CompanyActiveAdsResponse,
  type SaveActiveAdPayload,
} from "./adminService"
import { getBookedDates, isSlotPackageType, type BookedDatesResponse } from "./bookedDates"
import { getPopupPriorityCompanies, getPopupRotationalCompanies } from "./service"
import type { PopupCompaniesResponse } from "./types"

const activeAdsKeys = {
  all: ["active-ads"] as const,
  popupPriority: () => [...activeAdsKeys.all, "popup-priority"] as const,
  popupRotational: () => [...activeAdsKeys.all, "popup-rotational"] as const,
  bookedDates: (packageType: string) => ["ads", "booked-dates", packageType] as const,
  companyActiveAds: (companyId: string) => ["admin", "active-ads", "company", companyId] as const,
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

export function useCompanyActiveAds(companyId: string | null): {
  data?: CompanyActiveAdsResponse
  isLoading: boolean
  isError: boolean
} {
  const { data, isLoading, isError } = useQuery({
    queryKey: activeAdsKeys.companyActiveAds(companyId ?? ""),
    queryFn: () => getCompanyActiveAds(companyId!),
    enabled: !!companyId,
  })
  return { data, isLoading, isError }
}

export function useSaveActiveAd(companyId: string): {
  mutateAsync: (args: { activeAdId: string; payload: SaveActiveAdPayload }) => Promise<void>
  isPending: boolean
} {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: ({ activeAdId, payload }: { activeAdId: string; payload: SaveActiveAdPayload }) =>
      saveActiveAd(activeAdId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: activeAdsKeys.companyActiveAds(companyId),
      })
      toast.success(t("admin.activeAds.saveSuccess", "Changes saved"))
    },
    onError: () => {
      toast.error(t("admin.activeAds.saveError", "Failed to save changes"))
    },
  })
  return { mutateAsync: mutation.mutateAsync, isPending: mutation.isPending }
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
