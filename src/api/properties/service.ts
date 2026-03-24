import { api } from "@/lib/api"
import type {
  AdminPropertyDetailResponse,
  CreatePropertyContactInquiryPayload,
  PropertyContactInquiryResponse,
  CreatePropertyPayload,
  DeletePropertyResponse,
  DeletePropertyLegalDocumentResponse,
  PropertiesAdminListQuery,
  PropertiesListQuery,
  PropertiesListResponse,
  PropertyResponse,
  UploadPropertyLegalDocumentsResponse,
  UpdatePropertyPayload,
} from "./types"

type QueryValue = string | number | boolean | undefined | Array<string | number | boolean>

function buildQuery(params: Record<string, QueryValue>): string {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item === undefined || item === null || item === "") return
        searchParams.append(key, String(item))
      })
      return
    }

    searchParams.append(key, String(value))
  })

  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ""
}

export async function getAdminProperties(
  query: PropertiesAdminListQuery
): Promise<PropertiesListResponse> {
  const queryString = buildQuery(query)
  return api.request<PropertiesListResponse>(`/properties/admin${queryString}`, {
    method: "GET",
  })
}

export async function getAdminPropertyById(id: string): Promise<AdminPropertyDetailResponse> {
  return api.request<AdminPropertyDetailResponse>(`/properties/admin/${encodeURIComponent(id)}`, {
    method: "GET",
  })
}

export async function getPublishedProperties(
  query: PropertiesListQuery
): Promise<PropertiesListResponse> {
  const queryString = buildQuery(query)
  return api.request<PropertiesListResponse>(`/properties${queryString}`, {
    method: "GET",
  })
}

export async function getPublishedPropertyById(id: string): Promise<PropertyResponse> {
  return api.request<PropertyResponse>(`/properties/${encodeURIComponent(id)}`, {
    method: "GET",
  })
}

export async function createPropertyContactInquiry(
  id: string,
  payload: CreatePropertyContactInquiryPayload
): Promise<PropertyContactInquiryResponse> {
  return api.request<PropertyContactInquiryResponse>(
    `/properties/${encodeURIComponent(id)}/contact-inquiries`,
    {
      method: "POST",
      body: payload,
    }
  )
}

export async function createProperty(payload: CreatePropertyPayload): Promise<PropertyResponse> {
  return api.request<PropertyResponse>(`/properties`, {
    method: "POST",
    body: payload,
  })
}

export async function updateProperty(
  id: string,
  payload: UpdatePropertyPayload
): Promise<PropertyResponse> {
  return api.request<PropertyResponse>(`/properties/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: payload,
  })
}

export async function deleteProperty(id: string): Promise<DeletePropertyResponse> {
  return api.request<DeletePropertyResponse>(`/properties/${encodeURIComponent(id)}`, {
    method: "DELETE",
  })
}

export async function uploadPropertyLegalDocuments(
  id: string,
  files: File[]
): Promise<UploadPropertyLegalDocumentsResponse> {
  const form = new FormData()
  files.forEach((file) => {
    form.append("files", file, file.name)
  })

  return api.request<UploadPropertyLegalDocumentsResponse>(
    `/properties/${encodeURIComponent(id)}/legal-documents`,
    {
      method: "POST",
      body: form,
    }
  )
}

export async function deletePropertyLegalDocument(
  propertyId: string,
  documentId: string
): Promise<DeletePropertyLegalDocumentResponse> {
  return api.request<DeletePropertyLegalDocumentResponse>(
    `/properties/${encodeURIComponent(propertyId)}/legal-documents/${encodeURIComponent(documentId)}`,
    {
      method: "DELETE",
    }
  )
}
