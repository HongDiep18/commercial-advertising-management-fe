"use client"

import { useMemo, type ReactNode } from "react"
import * as demoData from "@/data/adminDemoData"
import { AdminDataContext, type AdminData } from "../AdminDataContext"

export function AdminDemoProvider({ children }: { children: ReactNode }) {
  const value = useMemo<AdminData>(
    () => ({
      companyRequests: demoData.mockCompanyRequests as AdminData["companyRequests"],
      products: demoData.mockProducts,
      newsSources: demoData.mockNewsSources,
      propertyListings: demoData.mockPropertyListings,
      users: demoData.mockUsers,
      adSubmissions: demoData.mockAdSubmissions,
    }),
    []
  )
  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>
}
