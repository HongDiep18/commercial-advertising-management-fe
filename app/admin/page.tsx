"use client"

import { AdminDashboardContent, AdminProvider } from "@/components/admin"
import { isDemoAdminUser } from "@/components/login/demo/demoUsers"
import { useUser } from "@/contexts/user-context"
import { FeatureKey } from "@/types"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

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
    if (!canUseFeature(FeatureKey.AdminPanel)) {
      router.push("/login")
    }
  }, [isLoggedIn, user, canUseFeature, router])

  if (!isLoggedIn || !user || !canUseFeature(FeatureKey.AdminPanel)) {
    return null
  }

  return (
    <AdminProvider>
      <AdminDashboardContent />
    </AdminProvider>
  )
}
