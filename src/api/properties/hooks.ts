import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import {
  createPropertyContactInquiry,
  createProperty,
  deleteProperty,
  deletePropertyLegalDocument,
  getAdminProperties,
  getAdminPropertyById,
  getPublishedProperties,
  getPublishedPropertyById,
  uploadPropertyLegalDocuments,
  updateProperty,
} from "./service"
import type {
  AdminPropertyDetailResponse,
  CreatePropertyContactInquiryPayload,
  CreatePropertyPayload,
  DeletePropertyLegalDocumentResponse,
  PropertiesAdminListQuery,
  PropertiesListQuery,
  PropertiesListResponse,
  PropertyContactInquiryResponse,
  PropertyResponse,
  UploadPropertyLegalDocumentsResponse,
  UpdatePropertyPayload,
} from "./types"

export const propertiesKeys = {
  all: ["properties"] as const,
  list: (query: PropertiesListQuery) => [...propertiesKeys.all, "list", query] as const,
  detail: (id: string) => [...propertiesKeys.all, "detail", id] as const,
  adminList: (query: PropertiesAdminListQuery) =>
    [...propertiesKeys.all, "admin", "list", query] as const,
  adminDetail: (id: string) => [...propertiesKeys.all, "admin", "detail", id] as const,
}

export function usePublishedProperties(
  query: PropertiesListQuery,
  enabled: boolean = true
): {
  data?: PropertiesListResponse
  isLoading: boolean
  isError: boolean
  refetch: () => Promise<unknown>
} {
  const { t } = useTranslation()
  const result = useQuery({
    queryKey: propertiesKeys.list(query),
    queryFn: () => getPublishedProperties(query),
    enabled,
    meta: {
      errorMessage:
        t("property.grid.loadError", {
          defaultValue: "Failed to load properties. Please try again.",
        }) || "Failed to load properties. Please try again.",
    },
  })

  return {
    data: result.data,
    isLoading: result.isLoading,
    isError: result.isError,
    refetch: result.refetch,
  }
}

export function usePublishedPropertyDetail(
  id: string,
  enabled: boolean = true
): { data?: PropertyResponse; isLoading: boolean; isError: boolean } {
  const { t } = useTranslation()
  const { data, isLoading, isError } = useQuery({
    queryKey: propertiesKeys.detail(id),
    queryFn: () => getPublishedPropertyById(id),
    enabled: enabled && Boolean(id),
    meta: {
      errorMessage:
        t("property.modals.loadDetailError", {
          defaultValue: "Failed to load property details. Please try again.",
        }) || "Failed to load property details. Please try again.",
    },
  })

  return { data, isLoading, isError }
}

export function useCreatePropertyContactInquiry(): {
  create: (args: {
    id: string
    payload: CreatePropertyContactInquiryPayload
  }) => Promise<PropertyContactInquiryResponse>
  isPending: boolean
} {
  const mutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreatePropertyContactInquiryPayload }) =>
      createPropertyContactInquiry(id, payload),
  })

  return { create: mutation.mutateAsync, isPending: mutation.isPending }
}

export function useAdminProperties(
  query: PropertiesAdminListQuery,
  enabled: boolean = true
): {
  data?: PropertiesListResponse
  isLoading: boolean
  isError: boolean
  refetch: () => Promise<unknown>
} {
  const { t } = useTranslation()
  const result = useQuery({
    queryKey: propertiesKeys.adminList(query),
    queryFn: () => getAdminProperties(query),
    enabled,
    meta: {
      errorMessage:
        t("admin.property.loadError", {
          defaultValue: "Failed to load properties. Please try again.",
        }) || "Failed to load properties. Please try again.",
    },
  })

  return {
    data: result.data,
    isLoading: result.isLoading,
    isError: result.isError,
    refetch: result.refetch,
  }
}

export function useAdminPropertyDetail(
  id: string,
  enabled: boolean = true
): { data?: AdminPropertyDetailResponse; isLoading: boolean; isError: boolean } {
  const { t } = useTranslation()
  const { data, isLoading, isError } = useQuery({
    queryKey: propertiesKeys.adminDetail(id),
    queryFn: () => getAdminPropertyById(id),
    enabled: enabled && Boolean(id),
    meta: {
      errorMessage:
        t("admin.property.loadDetailError", {
          defaultValue: "Failed to load property details. Please try again.",
        }) || "Failed to load property details. Please try again.",
    },
  })

  return { data, isLoading, isError }
}

export function useUpdateProperty(): {
  update: (args: { id: string; payload: UpdatePropertyPayload }) => Promise<PropertyResponse>
  isPending: boolean
} {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePropertyPayload }) =>
      updateProperty(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: propertiesKeys.all })
    },
  })

  return { update: mutation.mutateAsync, isPending: mutation.isPending }
}

export function useCreateProperty(): {
  create: (payload: CreatePropertyPayload) => Promise<PropertyResponse>
  isPending: boolean
} {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (payload: CreatePropertyPayload) => createProperty(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: propertiesKeys.all })
    },
  })

  return { create: mutation.mutateAsync, isPending: mutation.isPending }
}

export function useDeleteProperty(): {
  remove: (id: string) => Promise<unknown>
  isPending: boolean
} {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (id: string) => deleteProperty(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: propertiesKeys.all })
    },
  })

  return { remove: mutation.mutateAsync, isPending: mutation.isPending }
}

export function useUploadPropertyLegalDocuments(): {
  upload: (args: { id: string; files: File[] }) => Promise<UploadPropertyLegalDocumentsResponse>
  isPending: boolean
} {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: ({ id, files }: { id: string; files: File[] }) =>
      uploadPropertyLegalDocuments(id, files),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: propertiesKeys.all })
    },
  })

  return { upload: mutation.mutateAsync, isPending: mutation.isPending }
}

export function useDeletePropertyLegalDocument(): {
  remove: (args: {
    propertyId: string
    documentId: string
  }) => Promise<DeletePropertyLegalDocumentResponse>
  isPending: boolean
} {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: ({ propertyId, documentId }: { propertyId: string; documentId: string }) =>
      deletePropertyLegalDocument(propertyId, documentId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: propertiesKeys.all })
    },
  })

  return { remove: mutation.mutateAsync, isPending: mutation.isPending }
}
