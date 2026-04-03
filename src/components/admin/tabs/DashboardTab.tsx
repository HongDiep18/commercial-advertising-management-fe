"use client"

import { useTranslation } from "react-i18next"

import { Building2, Clock, Megaphone } from "lucide-react"
import Card, { CardContent } from "@/components/ui/Card"

import { getAllProfileRequests } from "@/api/admin"
import { adminCompanyRequestsKeys } from "@/api/admin/hooks"
import { useAdminCompaniesStats } from "@/api/admin-companies/hooks"
import { useAdminOrders } from "@/api/ad-orders-admin/hooks"
import { ProfileRequestStatus } from "@/types/admin"
import { useQuery } from "@tanstack/react-query"
import { DashboardNotificationsCard } from "./DashboardNotificationsCard"

export function DashboardTab() {
  const { t } = useTranslation()

  const { data: pendingCount = 0 } = useQuery({
    queryKey: adminCompanyRequestsKeys.count(ProfileRequestStatus.PENDING),
    queryFn: async () => {
      const r = await getAllProfileRequests({
        page: 1,
        limit: 1,
        status: ProfileRequestStatus.PENDING,
      })
      return r.pagination?.total ?? 0
    },
  })

  const { data: companiesStatsData, isLoading: isCompaniesLoading } = useAdminCompaniesStats(true)
  const { data: pendingOrdersData, isLoading: isAdOrdersLoading } = useAdminOrders({
    status: "PENDING",
    page: 1,
    limit: 1,
  })

  const totalCompanies = companiesStatsData?.approvedCount ?? 0
  const pendingAdOrders = pendingOrdersData?.pagination.total ?? 0

  const stats = [
    {
      labelKey: "totalCompanies",
      value: isCompaniesLoading ? "..." : totalCompanies.toLocaleString(),
      icon: Building2,
      trend: "",
      color: "text-blue-600",
    },
    {
      labelKey: "pendingApplications",
      value: String(pendingCount ?? 0),
      icon: Clock,
      trend: "",
      color: "text-amber-600",
    },
    {
      labelKey: "pendingAdOrders",
      value: isAdOrdersLoading ? "..." : pendingAdOrders.toLocaleString(),
      icon: Megaphone,
      trend: "",
      color: "text-primary",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.labelKey}>
              <CardContent className="p-4">
                <div className="mb-2 flex items-center justify-between pt-7">
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                  {"trendKey" in stat && stat.trendKey ? (
                    <span className="text-xs font-medium text-green-600">
                      {t(`admin.dashboard.${stat.trendKey}`)}
                    </span>
                  ) : "trend" in stat && stat.trend ? (
                    <span className="text-xs font-medium text-green-600">{stat.trend}</span>
                  ) : null}
                </div>
                <p className="text-foreground text-2xl font-bold">{stat.value}</p>
                <p className="text-muted-foreground text-sm">
                  {t(`admin.dashboard.${stat.labelKey}`)}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <DashboardNotificationsCard />
    </div>
  )
}
