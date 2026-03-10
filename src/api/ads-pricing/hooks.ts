import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type {
  AdminCreatePricingPayload,
  AdminPricingListQuery,
  AdminPricingListResponse,
  AdminPricingResponse,
  AdminUpdatePricingPayload,
  PublicAdPackageCategoryItem,
} from "./types"
import {
  createAdPackagePricing,
  deleteAdPackagePricing,
  getAdPackagePricingById,
  getAvailableAdPackages,
  listAdPackagePricing,
  updateAdPackagePricing,
} from "./service"

const pricingKeys = {
  all: ["admin", "ad-packages", "pricing"] as const,
  list: (query: AdminPricingListQuery) =>
    [...pricingKeys.all, "list", query] as const,
  detail: (pricingId: string) =>
    [...pricingKeys.all, "detail", pricingId] as const,
}

const catalogKeys = {
  all: ["ads", "packages"] as const,
}

export function useAdPackagePricingList(
  query: AdminPricingListQuery
): {
  data?: AdminPricingListResponse
  isLoading: boolean
  isError: boolean
} {
  const { data, isLoading, isError } = useQuery({
    queryKey: pricingKeys.list(query),
    queryFn: () => listAdPackagePricing(query),
  })
  return { data, isLoading, isError }
}

export function useAdPackagePricingDetail(
  pricingId: string | null
): {
  data?: AdminPricingResponse
  isLoading: boolean
  isError: boolean
} {
  const { data, isLoading, isError } = useQuery({
    queryKey: pricingKeys.detail(pricingId ?? ""),
    queryFn: () => getAdPackagePricingById(pricingId as string),
    enabled: pricingId !== null,
  })
  return { data, isLoading, isError }
}

export function useCreateAdPackagePricing() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      packageId,
      payload,
    }: {
      packageId: string
      payload: AdminCreatePricingPayload
    }) => createAdPackagePricing(packageId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pricingKeys.all })
      queryClient.invalidateQueries({ queryKey: catalogKeys.all })
    },
  })
}

export function useUpdateAdPackagePricing() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      pricingId,
      payload,
    }: {
      pricingId: string
      payload: AdminUpdatePricingPayload
    }) => updateAdPackagePricing(pricingId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: pricingKeys.detail(variables.pricingId),
      })
      queryClient.invalidateQueries({ queryKey: pricingKeys.all })
      queryClient.invalidateQueries({ queryKey: catalogKeys.all })
    },
  })
}

export function useDeleteAdPackagePricing() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (pricingId: string) => deleteAdPackagePricing(pricingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pricingKeys.all })
      queryClient.invalidateQueries({ queryKey: catalogKeys.all })
    },
  })
}

export function useAvailableAdPackages(): {
  data?: PublicAdPackageCategoryItem[]
  isLoading: boolean
  isError: boolean
} {
  const { data, isLoading, isError } = useQuery({
    queryKey: catalogKeys.all,
    queryFn: () => getAvailableAdPackages(),
  })
  return { data, isLoading, isError }
}


