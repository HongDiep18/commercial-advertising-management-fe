export enum DurationUnitEnum {
  DAY = "day",
  WEEK = "week",
  MONTH = "month",
  YEAR = "year",
}

export enum AdOrderStatusEnum {
  DRAFT = "draft",
  SUBMITTED = "submitted",
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export enum AdOrderAssetTypeEnum {
  AD_MATERIAL = "ad_material",
  AD_IMAGE = "ad_image",
  AD_VIDEO = "ad_video",
  AD_AUDIO = "ad_audio",
  AD_TEXT = "ad_text",
}

export type CreateAdOrderDto = {
  companyId?: string | null
  notes?: string | null
  items: CreateAdOrderItemDto[]
}

export type CreateAdOrderItemDto = {
  packageId: string
  pricingId: string
  startDate: string
  adLinkUrl: string
  unitPrice: string
  lineTotal: string
  quantity?: number
  designServiceRequired?: boolean
  durationValue?: number | null
  durationUnit?: DurationUnitEnum | null
}

export type AdOrderAssetDto = {
  orderItemId?: string
  assetType: string
  fileUrl?: string
  fileSizeKb?: number
  notes?: string
}

export type CreateAdOrderResponse = {
  id: string
  userId: string
  companyId: string | null
  status: AdOrderStatusEnum
  subtotal: number
  notes: string | null
  submittedAt: string | null
  createdAt: string
  updatedAt: string
  items?: Array<{ id: string; pricingId: string }>
}

export type CreateAdOrderInput = CreateAdOrderDto
export type CreateAdOrderItemInput = CreateAdOrderItemDto
