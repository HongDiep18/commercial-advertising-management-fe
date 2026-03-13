"use client"

import { createContext, useContext } from "react"
import type { AdSubmission } from "@/contexts/user-context"
import * as adminMockData from "@/data/adminMockData"
import type { ProfileRequestRow, ProfileRequestStatusUpdate } from "@/types/admin"

export type AdminData = {
  companyRequests: ProfileRequestRow[]
  products: typeof adminMockData.mockProducts
  newsSources: typeof adminMockData.mockNewsSources
  propertyListings: typeof adminMockData.mockPropertyListings
  users: typeof adminMockData.mockUsers
  adSubmissions: AdSubmission[]
  companyRequestsLoading?: boolean
  companyRequestsError?: string
  updateCompanyRequestStatus?: (id: string, status: ProfileRequestStatusUpdate) => Promise<void>
  updateUserActive?: (userId: string, isActive: boolean) => Promise<void>
  deleteCompany?: (userId: string) => Promise<void>
}

export const AdminDataContext = createContext<AdminData | null>(null)

export function useAdminData(): AdminData {
  const ctx = useContext(AdminDataContext)
  if (!ctx) throw new Error("useAdminData must be used within an Admin provider")
  return ctx
}
