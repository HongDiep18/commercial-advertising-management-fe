"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/contexts/user-context"
import { isDemoAdminUser } from "@/components/login/demo/demoUsers"
import { AdminDemoProvider, AdminDashboardContent } from "@/components/admin"
import { FeatureKey } from "@/types"

export default function AdminDemoPage() {
  const router = useRouter()
  const { user, isLoggedIn, isAuthReady, canUseFeature } = useUser()

  useEffect(() => {
    if (!isAuthReady) return
    if (!isLoggedIn || !user) {
      router.push("/login")
      return
    }
    if (canUseFeature(FeatureKey.AdminPanel) && !isDemoAdminUser(user)) {
      router.replace("/admin")
    }
  }, [isAuthReady, isLoggedIn, user, canUseFeature, router])

  if (!isAuthReady) {
    return <div className="text-muted-foreground p-6 text-sm">Loading…</div>
  }

  if (!isLoggedIn || !user) {
    return <div className="text-muted-foreground p-6 text-sm">Loading…</div>
  }
  if (canUseFeature(FeatureKey.AdminPanel) && !isDemoAdminUser(user)) {
    return <div className="text-muted-foreground p-6 text-sm">Loading…</div>
  }

  return (
    <AdminDemoProvider>
      <AdminDashboardContent />
    </AdminDemoProvider>
  )
}
