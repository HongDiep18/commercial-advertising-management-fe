import { api } from "@/lib/api"
import type {
  AdminCreatePricingPayload,
  AdminPricingListQuery,
  AdminPricingListResponse,
  AdminPricingResponse,
  AdminUpdatePricingPayload,
  PublicAdPackageCategoryItem,
} from "./types"

const BASE_PATH = "/admin/ad-packages"

export async function createAdPackagePricing(
  packageId: string,
  payload: AdminCreatePricingPayload
): Promise<AdminPricingResponse> {
  return api.request<AdminPricingResponse>(`${BASE_PATH}/${packageId}/pricing`, {
    method: "POST",
    body: payload,
  })
}

export async function listAdPackagePricing(
  query: AdminPricingListQuery
): Promise<AdminPricingListResponse> {
  const search = new URLSearchParams()
  if (query.packageId) search.set("packageId", query.packageId)
  if (query.pricingModel) search.set("pricingModel", query.pricingModel)
  if (typeof query.isActive === "boolean") search.set("isActive", String(query.isActive))
  if (query.page !== undefined) search.set("page", String(query.page))
  if (query.limit !== undefined) search.set("limit", String(query.limit))

  const qs = search.toString()
  const path = qs ? `${BASE_PATH}/pricing?${qs}` : `${BASE_PATH}/pricing`

  return api.request<AdminPricingListResponse>(path, {
    method: "GET",
  })
}

export async function getAdPackagePricingById(
  pricingId: string
): Promise<AdminPricingResponse> {
  return api.request<AdminPricingResponse>(`${BASE_PATH}/pricing/${pricingId}`, {
    method: "GET",
  })
}

export async function updateAdPackagePricing(
  pricingId: string,
  payload: AdminUpdatePricingPayload
): Promise<AdminPricingResponse> {
  return api.request<AdminPricingResponse>(`${BASE_PATH}/pricing/${pricingId}`, {
    method: "PUT",
    body: payload,
  })
}

export async function deleteAdPackagePricing(
  pricingId: string
): Promise<{ message: string }> {
  return api.request<{ message: string }>(`${BASE_PATH}/pricing/${pricingId}`, {
    method: "DELETE",
  })
}

export async function getAvailableAdPackages(): Promise<PublicAdPackageCategoryItem[]> {
  return api.request<PublicAdPackageCategoryItem[]>("/ad-packages", {
    method: "GET",
  })
}


