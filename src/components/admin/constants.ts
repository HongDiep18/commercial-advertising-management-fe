import type { AdminCompanyAccountFilter } from "@/api/admin-companies/types"
import { ProfileRequestStatus } from "@/types/admin"
import type { LucideIcon } from "lucide-react"
import { LayoutDashboard, Building2, Activity, Megaphone, MapPin, UserCog } from "lucide-react"

export const PROFILE_REQUEST_FILTERS: Array<{
  id: "all" | ProfileRequestStatus
  labelKey: string
  useCount?: boolean
}> = [
  { id: "all", labelKey: "admin.companies.allCount", useCount: true },
  { id: ProfileRequestStatus.PENDING, labelKey: "admin.companies.pendingCount", useCount: true },
  { id: ProfileRequestStatus.APPROVED, labelKey: "admin.status.approvedCount", useCount: true },
  { id: ProfileRequestStatus.REJECTED, labelKey: "admin.status.rejectedCount", useCount: true },
]

export const ADMIN_COMPANY_ACCOUNT_FILTERS: Array<{
  id: AdminCompanyAccountFilter
  labelKey: string
}> = [
  { id: "all", labelKey: "admin.companies.accountFilterAll" },
  { id: "active", labelKey: "admin.companies.accountFilterActive" },
  { id: "inactive", labelKey: "admin.companies.accountFilterInactive" },
]

export const ADMIN_TABS: Array<{ id: string; icon: LucideIcon }> = [
  { id: "dashboard", icon: LayoutDashboard },
  { id: "companies", icon: Building2 },
  { id: "advertising", icon: Megaphone },
  { id: "property", icon: MapPin },
  { id: "users", icon: UserCog },
  { id: "recentActivity", icon: Activity },
]
