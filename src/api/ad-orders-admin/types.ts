export type AdminOrderStatus = "DRAFT" | "SUBMITTED" | "PENDING" | "APPROVED" | "REJECTED"

export type AdminListOrdersQuery = {
  status?: AdminOrderStatus
  search?: string
  page?: number
  limit?: number
  sortBy?: "createdAt" | "updatedAt" | "totalAmount"
  sortOrder?: "asc" | "desc"
}

export type AdminOrderItemDto = {
  id: string
  pricingId: string
  packageId: string
  packageName: string
  packageType: string
  pricingName: string
  pricingModel: string
  categoryType: string | null
  durationValue: number | null
  durationUnit: string | null
  price: number
  designServiceRequired: boolean
  startDate: string
  adLinkUrl?: string
  assets: Array<{
    id: string
    fileUrl: string
    fileSizeKb: number
    assetType: string
  }>
  packageMetadata?: Record<string, unknown> | null
}

export type AdminOrderDto = {
  id: string
  status: AdminOrderStatus
  totalAmount: number
  notes: string | null
  createdAt: string
  updatedAt: string
  user: {
    id: string
    email: string
    firstName?: string
    lastName?: string
  }
  company?: {
    id: string
    nameVi: string | null
    nameCn: string | null
    email: string
    contactName: string
    phone: string
  }
  items: AdminOrderItemDto[]
}

export type AdminListOrdersResponse = {
  orders: AdminOrderDto[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export type AdminOrdersStatusCounts = {
  pending: number
  approved: number
  rejected: number
  total: number
}

export type AdminOrdersMetricsResponse = {
  currentMonthRevenue: number
  currentMonthOrders: AdminOrdersStatusCounts
  monthlyGrowthPercentage: number
}

export type AdminEditOrderAssetPayload = {
  assetType: string
  fileUrl: string
  fileSizeKb?: number
  notes?: string
}

export type AdminEditOrderItemPayload = {
  itemId: string
  adLinkUrl?: string
  startDate?: string
  designServiceRequired?: boolean
  assets?: AdminEditOrderAssetPayload[]
}

export type AdminNewOrderItemPayload = {
  pricingId: string
  startDate: string
  designServiceRequired: boolean
  adLinkUrl?: string
}

export type AdminEditOrderPayload = {
  notes?: string
  items?: AdminEditOrderItemPayload[]
  newItems?: AdminNewOrderItemPayload[]
  deleteItemIds?: string[]
}

export type AdminEditOrderResponse = {
  id: string
  userId: string
  companyId: string
  status: AdminOrderStatus
  subtotal: number
  notes: string | null
  submittedAt: string | null
  createdAt: string
  updatedAt: string
  items: Array<{
    id: string
    orderId: string
    packageId: string
    pricingId: string
    durationValue: number | null
    durationUnit: string | null
    startDate: string
    designServiceRequired: boolean
    adLinkUrl: string | null
    unitPrice: number
    quantity: number
    lineTotal: number
    createdAt: string
    assets: Array<{
      id: string
      orderItemId: string
      assetType: string
      fileUrl: string
      fileSizeKb: number | null
      notes: string | null
      createdAt: string
    }>
  }>
}

