"use client"

import { createContext, useContext } from "react"
import type { AdSubmission } from "@/contexts/user-context"
import type { CompanyRequest } from "@/types/admin"
import * as adminMockData from "@/data/adminMockData"

export type AdminData = {
  companyRequests: CompanyRequest[]
  products: typeof adminMockData.mockProducts
  newsSources: typeof adminMockData.mockNewsSources
  propertyListings: typeof adminMockData.mockPropertyListings
  users: typeof adminMockData.mockUsers
  adSubmissions: AdSubmission[]
  companyRequestsLoading?: boolean
  companyRequestsError?: string
}

export const AdminDataContext = createContext<AdminData | null>(null)

export function useAdminData(): AdminData {
  const ctx = useContext(AdminDataContext)
  if (!ctx) throw new Error("useAdminData must be used within an Admin provider")
  return ctx
}
