import type {
  PropertyResponse,
  PropertyAvailabilityStatus,
  PropertyPublicationStatus,
  PropertySortBy,
  PropertyType,
} from "@/api/properties/types"
import type { TFunction } from "i18next"
import type { PropertyUpsertFormValues } from "./types"

export function mapMockStatusToPublicationStatus(status: string): PropertyPublicationStatus {
  switch (status) {
    case "published":
      return "PUBLISHED"
    case "draft":
      return "DRAFT"
    default:
      return "UNPUBLISHED"
  }
}

export function mapMockStatusToAvailabilityStatus(status: string): PropertyAvailabilityStatus {
  return status === "sold" ? "SOLD" : "AVAILABLE"
}

export function mapMockTypeToPropertyType(type: string): PropertyType {
  switch (type) {
    case "土地":
      return "LAND"
    case "廠房":
      return "FACTORY"
    case "倉庫":
      return "WAREHOUSE"
    case "住宅":
      return "HOUSE"
    case "辦公室":
      return "OFFICE"
    default:
      return "LAND"
  }
}

export function getPropertyTypeLabel(type: PropertyType, t: TFunction): string {
  const key = type.toLowerCase()
  return t(`property.types.${key}`, { defaultValue: type })
}

export function getSortLabel(sortBy: PropertySortBy, t: TFunction): string {
  switch (sortBy) {
    case "createdAt":
      return t("admin.property.sortCreatedAt", { defaultValue: "Created Date" })
    case "updatedAt":
      return t("admin.property.sortUpdatedAt", { defaultValue: "Updated Date" })
    case "views":
      return t("admin.property.sortViews", { defaultValue: "Views" })
    case "title":
      return t("admin.property.sortTitle", { defaultValue: "Title" })
    case "publishedAt":
      return t("admin.property.sortPublishedAt", { defaultValue: "Published Date" })
    case "soldAt":
      return t("admin.property.sortSoldAt", { defaultValue: "Sold Date" })
    default:
      return sortBy
  }
}

export function parsePropertyFeatures(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

export function slugifyProvince(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function buildDefaultPropertyFormValues(): PropertyUpsertFormValues {
  return {
    title: "",
    price: "",
    type: "LAND",
    province: "",
    provinceName: "",
    fullAddress: "",
    latitude: "",
    longitude: "",
    areaValue: "",
    areaUnit: "m²",
    description: "",
    featuresText: "",
    imageUrls: [],
    publicationStatus: "DRAFT",
    availabilityStatus: "AVAILABLE",
    views: "0",
  }
}

export function buildPropertyFormValuesFromResponse(
  property: PropertyResponse
): PropertyUpsertFormValues {
  return {
    title: property.title,
    price: property.price,
    type: property.type,
    province: property.province,
    provinceName: property.provinceName,
    fullAddress: property.fullAddress,
    latitude: property.latitude == null ? "" : String(property.latitude),
    longitude: property.longitude == null ? "" : String(property.longitude),
    areaValue: String(property.areaValue),
    areaUnit: property.areaUnit,
    description: property.description,
    featuresText: property.features.join("\n"),
    imageUrls: property.images,
    publicationStatus: property.publicationStatus,
    availabilityStatus: property.availabilityStatus,
    views: String(property.views),
  }
}
