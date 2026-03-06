"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import { getAllProfileRequests, mapProfileRequestToCompanyRequest } from "@/api/admin"
import { mockAdSubmissions } from "@/contexts/user-context"
import * as fallbackData from "@/data/adminMockData"
import { AdminDataContext, type AdminData } from "./AdminDataContext"

/**
 * Admin provider for the real app: company requests from API,
 * other data from fallback until those APIs exist.
 */
export function AdminProvider({ children }: { children: ReactNode }) {
  const [companyRequests, setCompanyRequests] = useState<AdminData["companyRequests"]>([])
  const [companyRequestsLoading, setCompanyRequestsLoading] = useState(true)
  const [companyRequestsError, setCompanyRequestsError] = useState<string | undefined>(undefined)

  useEffect(() => {
    let cancelled = false
    setCompanyRequestsLoading(true)
    setCompanyRequestsError(undefined)
    getAllProfileRequests()
      .then((list) => {
        if (!cancelled) {
          setCompanyRequests(list.map((p) => mapProfileRequestToCompanyRequest(p)))
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setCompanyRequestsError(err?.message ?? "Failed to load company requests")
          setCompanyRequests([])
        }
      })
      .finally(() => {
        if (!cancelled) setCompanyRequestsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

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
    }),
    [companyRequests, companyRequestsLoading, companyRequestsError]
  )
  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>
}
