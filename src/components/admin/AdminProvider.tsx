"use client"

import { adminCompanyRequestsKeys } from "@/api/admin/hooks"
import { deleteCompany, patchUserActive, updateProfileRequestStatus } from "@/api/admin"
import { mockAdSubmissions } from "@/contexts/user-context"
import * as fallbackData from "@/data/adminMockData"
import { useQueryClient } from "@tanstack/react-query"
import { useCallback, useMemo, type ReactNode } from "react"
import { AdminDataContext, type AdminData } from "./AdminDataContext"
import type { ProfileRequestStatusUpdate } from "@/types/admin"

export function AdminProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()

  const refetchCompanyRequests = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: adminCompanyRequestsKeys.all })
  }, [queryClient])

  const updateCompanyRequestStatus = useCallback(
    async (id: string, status: ProfileRequestStatusUpdate) => {
      await updateProfileRequestStatus(id, status)
      refetchCompanyRequests()
    },
    [refetchCompanyRequests]
  )

  const updateUserActive = useCallback(
    async (userId: string, isActive: boolean) => {
      await patchUserActive(userId, isActive)
      refetchCompanyRequests()
    },
    [refetchCompanyRequests]
  )

  const deleteCompanyApi = useCallback(
    async (userId: string) => {
      await deleteCompany(userId)
      refetchCompanyRequests()
    },
    [refetchCompanyRequests]
  )

  const value = useMemo<AdminData>(
    () => ({
      companyRequests: [],
      products: fallbackData.mockProducts,
      newsSources: fallbackData.mockNewsSources,
      propertyListings: fallbackData.mockPropertyListings,
      users: fallbackData.mockUsers,
      adSubmissions: mockAdSubmissions,
      companyRequestsLoading: false,
      companyRequestsError: undefined,
      updateCompanyRequestStatus,
      updateUserActive,
      deleteCompany: deleteCompanyApi,
      refetchCompanyRequests,
    }),
    [updateCompanyRequestStatus, updateUserActive, deleteCompanyApi, refetchCompanyRequests]
  )
  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>
}
