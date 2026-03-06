"use client"

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react"
import {
  getAllProfileRequests,
  mapProfileRequestToCompanyRequest,
  updateProfileRequestStatus,
} from "@/api/admin"
import { mockAdSubmissions } from "@/contexts/user-context"
import * as fallbackData from "@/data/adminMockData"
import { AdminDataContext, type AdminData } from "./AdminDataContext"
import type { ProfileRequestStatusUpdate } from "@/types/admin"

export function AdminProvider({ children }: { children: ReactNode }) {
  const [companyRequests, setCompanyRequests] = useState<AdminData["companyRequests"]>([])
  const [companyRequestsLoading, setCompanyRequestsLoading] = useState(true)
  const [companyRequestsError, setCompanyRequestsError] = useState<string | undefined>(undefined)

  const refetchCompanyRequests = useCallback(() => {
    setCompanyRequestsLoading(true)
    setCompanyRequestsError(undefined)
    getAllProfileRequests()
      .then((list) => {
        setCompanyRequests(list.map((p) => mapProfileRequestToCompanyRequest(p)))
      })
      .catch((err) => {
        setCompanyRequestsError(err?.message ?? "Failed to load company requests")
        setCompanyRequests([])
      })
      .finally(() => setCompanyRequestsLoading(false))
  }, [])

  useEffect(() => {
    setTimeout(() => {
      refetchCompanyRequests()
    }, 1000)
  }, [refetchCompanyRequests])

  const updateCompanyRequestStatus = useCallback(
    async (id: string, status: ProfileRequestStatusUpdate) => {
      await updateProfileRequestStatus(id, status)
      refetchCompanyRequests()
    },
    [refetchCompanyRequests]
  )

  const value = useMemo<AdminData>(
    () => ({
      companyRequests,
      products: fallbackData.mockProducts,
      newsSources: fallbackData.mockNewsSources,
      propertyListings: fallbackData.mockPropertyListings,
      users: fallbackData.mockUsers,
      adSubmissions: mockAdSubmissions,
      companyRequestsLoading,
      companyRequestsError,
      updateCompanyRequestStatus,
    }),
    [companyRequests, companyRequestsLoading, companyRequestsError, updateCompanyRequestStatus]
  )
  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>
}
