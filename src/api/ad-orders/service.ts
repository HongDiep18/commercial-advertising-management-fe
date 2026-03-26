import { api } from "@/lib/api"
import type { CreateAdOrderInput, CreateAdOrderResponse } from "../../types/types"
import type { ExistingOrderItem } from "./overlap"

export type MyAdOrderItem = {
  id: string
  packageName: string
  pricingName: string
  price: number
  designServiceRequired: boolean
  startDate: string
  adLinkUrl: string
  assetsCount: number
  pricingId?: string
  durationValue?: number | null
  durationUnit?: string | null
}

export type MyAdOrder = {
  id: string
  status: string
  totalAmount: number
  createdAt: string
  updatedAt: string
  submittedAt?: string | null
  items: MyAdOrderItem[]
}

export type MyAdOrdersResponse = {
  orders: MyAdOrder[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

export async function getMyAdOrders(params?: {
  status?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: string
}): Promise<MyAdOrdersResponse> {
  const q = new URLSearchParams()
  if (params?.status) q.set("status", params.status)
  if (params?.page != null) q.set("page", String(params.page))
  if (params?.limit != null) q.set("limit", String(params.limit))
  if (params?.sortBy) q.set("sortBy", params.sortBy)
  if (params?.sortOrder) q.set("sortOrder", params.sortOrder)
  const qs = q.toString()
  return api.request<MyAdOrdersResponse>(`/ad-orders/my-orders${qs ? `?${qs}` : ""}`)
}

async function fetchAllOrderItemsByStatus(status: string): Promise<ExistingOrderItem[]> {
  const items: ExistingOrderItem[] = []
  let page = 1
  let totalPages = 1
  do {
    const res = await getMyAdOrders({ status, page, limit: 100, sortBy: "createdAt", sortOrder: "desc" })
    res.orders.forEach((o) =>
      o.items.forEach((it) =>
        items.push({
          packageName: it.packageName,
          pricingName: it.pricingName,
          startDate: it.startDate,
          pricingId: it.pricingId,
          durationValue: it.durationValue,
          durationUnit: it.durationUnit,
        })
      )
    )
    totalPages = res.pagination.totalPages
    page++
  } while (page <= totalPages)
  return items
}

export async function getMyPendingOrderItems(): Promise<ExistingOrderItem[]> {
  const results = await Promise.all([
    fetchAllOrderItemsByStatus("PENDING"),
    fetchAllOrderItemsByStatus("SUBMITTED"),
    fetchAllOrderItemsByStatus("APPROVED"),
  ])
  return results.flat()
}

function toCreateOrderPayload(input: CreateAdOrderInput): Record<string, unknown> {
  return {
    ...(input.notes != null && input.notes !== "" && { notes: input.notes }),
    items: input.items.map((item) => ({
      pricingId: item.pricingId,
      startDate: item.startDate,
      adLinkUrl: item.adLinkUrl,
      ...(item.quantity !== 1 && { quantity: item.quantity }),
      designServiceRequired: item.designServiceRequired ?? false,
      ...(item.durationValue != null && { durationValue: item.durationValue }),
      ...(item.durationUnit != null && { durationUnit: item.durationUnit }),
    })),
  }
}

export async function createAdOrder(input: CreateAdOrderInput): Promise<CreateAdOrderResponse> {
  const body = toCreateOrderPayload(input)
  return api.request<CreateAdOrderResponse>("/ad-orders", {
    method: "POST",
    body,
  })
}

export type AdOrderAssetToUpload = {
  pricingId: string
  assetType: string
  file: File
}

export async function attachAssetsAndSubmitOrder(
  orderId: string,
  assets: AdOrderAssetToUpload[] = []
): Promise<CreateAdOrderResponse> {
  const form = new FormData()

  assets.forEach((a) => {
    form.append("pricingIds", a.pricingId)
    form.append("assetTypes", a.assetType)
    form.append("files", a.file)
  })

  try {
    return await api.request<CreateAdOrderResponse>(`/ad-orders/${orderId}/assets`, {
      method: "POST",
      body: form,
    })
  } catch (error) {
    console.error("[attachAssetsAndSubmitOrder] Failed to upload assets", {
      orderId,
      assetCount: assets.length,
      error,
    })
    throw error
  }
}
