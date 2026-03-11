export type DurationUnit = "day" | "week" | "month" | "year"

export type PricingModel = "duration" | "one_time" | "per_action"

export type AdOrderStatus = "draft" | "submitted" | "pending" | "approved" | "rejected"

export type CreateAdOrderItemInput = {
  packageId: string
  pricingId: string
  durationValue?: number | null
  durationUnit?: DurationUnit | null
  startDate: string
  designServiceRequired: boolean
  adLinkUrl: string
  unitPrice: string
  quantity: number
}

export type CreateAdOrderInput = {
  companyId?: string | null
  notes?: string | null
  items: CreateAdOrderItemInput[]
}

export type CreateAdOrderResponse = {
  message?: string
  data?: {
    orderId: string
    status: AdOrderStatus
    subtotal: string
    items?: Array<{
      id: string
      pricingId: string
    }>
  }
}
