"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/contexts/user-context"
import { isDemoAdminUser } from "@/components/login/demo/demoUsers"
import { AdminProvider, AdminDashboardContent } from "@/components/admin"

export default function AdminPage() {
  const router = useRouter()
  const { user, isLoggedIn, canUseFeature } = useUser()

  useEffect(() => {
    if (!isLoggedIn || !user) {
      router.push("/login")
      return
    }
    if (isDemoAdminUser(user)) {
      router.replace("/admin/demo")
      return
    }
    if (!canUseFeature("adminPanel")) {
      router.push("/login")
    }
  }, [isLoggedIn, user, canUseFeature, router])

  if (!isLoggedIn || !user || !canUseFeature("adminPanel")) {
    return null
  }

  return (
    <AdminProvider>
      <AdminDashboardContent />
    </AdminProvider>
  )
}
