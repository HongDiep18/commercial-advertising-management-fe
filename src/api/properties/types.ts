export type PropertyType = "LAND" | "FACTORY" | "WAREHOUSE" | "HOUSE" | "OFFICE"

export type PropertyPublicationStatus = "DRAFT" | "PUBLISHED" | "UNPUBLISHED"

export type PropertyAvailabilityStatus = "AVAILABLE" | "SOLD"

export type PropertySortBy =
  | "createdAt"
  | "updatedAt"
  | "publishedAt"
  | "soldAt"
  | "title"
  | "views"

export type PropertySortOrder = "asc" | "desc"

export type PropertiesListQuery = {
  page?: number
  limit?: number
  search?: string
  type?: PropertyType
  province?: string
  publicationStatus?: PropertyPublicationStatus
  availabilityStatus?: PropertyAvailabilityStatus
  sortBy?: PropertySortBy
  sortOrder?: PropertySortOrder
}

export type PropertiesAdminListQuery = PropertiesListQuery

export type PropertyLegalDocumentResponse = {
  id: string
  propertyId: string
  fileUrl: string
  fileName: string
  mimeType?: string | null
  fileSizeKb?: number | null
  createdAt: string
}

export type PropertyResponse = {
  id: string
  createdAt: string
  updatedAt: string
  title: string
  price: string
  type: PropertyType
  province: string
  provinceName: string
  fullAddress: string
  latitude?: number | null
  longitude?: number | null
  areaValue: number
  areaUnit: string
  description: string
  images: string[]
  features: string[]
  publicationStatus: PropertyPublicationStatus
  publishedAt?: string | null
  availabilityStatus: PropertyAvailabilityStatus
  soldAt?: string | null
  views: number
  legalDocuments: PropertyLegalDocumentResponse[]
}

export type PropertiesListResponse = {
  properties: PropertyResponse[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export type CreatePropertyPayload = {
  title: string
  price: string
  type: PropertyType
  province: string
  provinceName: string
  fullAddress: string
  latitude?: number
  longitude?: number
  areaValue: number
  areaUnit: string
  description: string
  images?: string[]
  features?: string[]
  publicationStatus?: PropertyPublicationStatus
  publishedAt?: string
  availabilityStatus?: PropertyAvailabilityStatus
  soldAt?: string
  views?: number
}

export type UpdatePropertyPayload = Partial<{
  title: string
  price: string
  type: PropertyType
  province: string
  provinceName: string
  fullAddress: string
  latitude: number
  longitude: number
  areaValue: number
  areaUnit: string
  description: string
  images: string[]
  features: string[]
  publicationStatus: PropertyPublicationStatus
  publishedAt: string
  availabilityStatus: PropertyAvailabilityStatus
  soldAt: string
  views: number
}>

export type DeletePropertyResponse = {
  message: string
}

export type UploadPropertyLegalDocumentsResponse = PropertyLegalDocumentResponse[]

export type DeletePropertyLegalDocumentResponse = {
  message: string
}

export type CreatePropertyContactInquiryPayload = {
  name: string
  email: string
  message?: string
}

export type PropertyContactInquiryResponse = {
  id: string
  createdAt: string
  propertyId: string
  name: string
  email: string
  message?: string | null
}

export type AdminPropertyDetailResponse = PropertyResponse & {
  contactInquiries: PropertyContactInquiryResponse[]
  contactInquiryCount: number
}
