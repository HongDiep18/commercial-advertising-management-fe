import type {
  PropertyLegalDocumentResponse,
  PropertyAvailabilityStatus,
  PropertyPublicationStatus,
  PropertyType,
} from "@/api/properties/types"

export type PropertyRow = {
  id: string
  title: string
  type: PropertyType
  province: string
  provinceName: string
  price: string
  views: number
  publicationStatus: PropertyPublicationStatus
  availabilityStatus: PropertyAvailabilityStatus
  updatedAt: string
}

export type PropertyUpsertFormValues = {
  title: string
  price: string
  type: PropertyType
  province: string
  provinceName: string
  fullAddress: string
  latitude: string
  longitude: string
  areaValue: string
  areaUnit: string
  description: string
  featuresText: string
  imageUrls: string[]
  publicationStatus: PropertyPublicationStatus
  availabilityStatus: PropertyAvailabilityStatus
  views: string
}

export type PropertyUpsertSubmitPayload = {
  values: PropertyUpsertFormValues
  newImageFiles: File[]
  newLegalDocumentFiles: File[]
}

export type PropertyLegalDocumentItem = PropertyLegalDocumentResponse
