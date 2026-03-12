import { api } from "@/lib/api"
import type { CreateAdOrderInput, CreateAdOrderResponse } from "../../types/types"

function toCreateOrderPayload(input: CreateAdOrderInput): Record<string, unknown> {
  return {
    ...(input.companyId != null && input.companyId !== "" && { companyId: input.companyId }),
    ...(input.notes != null && input.notes !== "" && { notes: input.notes }),
    items: input.items.map((item) => ({
      packageId: item.packageId,
      pricingId: item.pricingId,
      startDate: item.startDate,
      adLinkUrl: item.adLinkUrl,
      unitPrice: item.unitPrice,
      lineTotal: item.lineTotal,
      ...(item.quantity !== 1 && { quantity: item.quantity }),
      ...(item.designServiceRequired && { designServiceRequired: true }),
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

  return api.request<CreateAdOrderResponse>(`/ad-orders/${orderId}/assets`, {
    method: "POST",
    body: form,
  })
}
