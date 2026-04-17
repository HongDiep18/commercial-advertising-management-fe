import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import {
  createCompanyPopupAddon,
  deleteActiveAd,
  getAdminActiveAdsSlotStatus,
  getCompanyActiveAds,
  saveActiveAd,
  type CompanyActiveAdsResponse,
  type CreateCompanyPopupAddonPayload,
  type SaveActiveAdPayload,
} from "./adminService"
import { getBookedDates, isSlotPackageType, type BookedDatesResponse } from "./bookedDates"
import { getPopupPriorityCompanies, getPopupRotationalCompanies } from "./service"
import type { ActiveAdsSlotStatusResponse, PopupCompaniesResponse } from "./types"

const activeAdsKeys = {
  all: ["active-ads"] as const,
  popupPriority: () => [...activeAdsKeys.all, "popup-priority"] as const,
  popupRotational: () => [...activeAdsKeys.all, "popup-rotational"] as const,
  bookedDates: (packageType: string) => ["ads", "booked-dates", packageType] as const,
  companyActiveAds: (companyId: string) => ["admin", "active-ads", "company", companyId] as const,
  adminSlotStatus: () => ["admin", "active-ads", "slot-status"] as const,
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

export function useAdminActiveAdsSlotStatus(): {
  data?: ActiveAdsSlotStatusResponse
  isLoading: boolean
  isError: boolean
} {
  const { data, isLoading, isError } = useQuery({
    queryKey: activeAdsKeys.adminSlotStatus(),
    queryFn: () => getAdminActiveAdsSlotStatus(),
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
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: activeAdsKeys.companyActiveAds(companyId),
      })
      await queryClient.refetchQueries({
        queryKey: activeAdsKeys.companyActiveAds(companyId),
      })
      toast.success(t("admin.activeAds.saveSuccess"))
    },
    onError: (err: unknown) => {
      const apiErr = err as { data?: { code?: string; message?: string } }
      if (apiErr?.data?.code === "ADS_SLOT_NOT_AVAILABLE") {
        toast.error(
          t("admin.advertising.slotNotAvailable", {
            defaultValue: "This ad slot is fully booked for the requested date range.",
          })
        )
        return
      }
      toast.error(t("admin.activeAds.saveError"))
    },
  })
  return { mutateAsync: mutation.mutateAsync, isPending: mutation.isPending }
}

export function useCreateCompanyPopupAddon(companyId: string): {
  mutateAsync: (payload: Omit<CreateCompanyPopupAddonPayload, "companyId">) => Promise<void>
  isPending: boolean
} {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (payload: Omit<CreateCompanyPopupAddonPayload, "companyId">) =>
      createCompanyPopupAddon({ companyId, ...payload }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: activeAdsKeys.companyActiveAds(companyId),
      })
      await queryClient.refetchQueries({
        queryKey: activeAdsKeys.companyActiveAds(companyId),
      })
      toast.success(t("admin.activeAds.createSuccess"))
    },
    onError: (err: unknown) => {
      const apiErr = err as { data?: { code?: string } }
      if (apiErr?.data?.code === "ACTIVE_ADS_INVALID_ADDON_DATE_RANGE") {
        toast.error(t("admin.activeAds.createInvalidRange"))
        return
      }
      toast.error(t("admin.activeAds.createError"))
    },
  })
  return { mutateAsync: mutation.mutateAsync, isPending: mutation.isPending }
}

export function useDeleteActiveAd(companyId: string): {
  mutateAsync: (activeAdId: string) => Promise<void>
  isPending: boolean
} {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (activeAdId: string) => deleteActiveAd(activeAdId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: activeAdsKeys.companyActiveAds(companyId),
      })
      await queryClient.refetchQueries({
        queryKey: activeAdsKeys.companyActiveAds(companyId),
      })
      toast.success(t("admin.activeAds.deleteSuccess", "Active ad deleted successfully"))
    },
    onError: () => {
      toast.error(t("admin.activeAds.deleteError", "Failed to delete active ad"))
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
