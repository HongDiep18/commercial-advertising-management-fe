"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/contexts/user-context"
import { isDemoAdminUser } from "@/components/login/demo/demoUsers"
import { AdminDemoDataProvider, AdminDashboardContent } from "@/components/admin"

export default function AdminDemoPage() {
  const router = useRouter()
  const { user, isLoggedIn } = useUser()

  useEffect(() => {
    if (!isLoggedIn || !user) {
      router.push("/login")
      return
    }
    if (!isDemoAdminUser(user)) {
      router.replace("/admin")
    }
  }, [isLoggedIn, user, router])

  if (!isLoggedIn || !user || !isDemoAdminUser(user)) {
    return null
  }

  return (
    <AdminDemoDataProvider>
      <AdminDashboardContent />
    </AdminDemoDataProvider>
  )
}
