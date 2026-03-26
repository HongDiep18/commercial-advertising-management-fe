"use client"

import { useTranslation } from "react-i18next"

import { Building2, Clock, Newspaper } from "lucide-react"
import Card, { CardContent } from "@/components/ui/Card"

import { useAdminData } from "../AdminDataContext"
import { ProfileRequestStatus } from "@/types/admin"
import { useCompanyDirectory } from "@/api/companies/hooks"
import { usePublishedProperties } from "@/api/properties/hooks"
import { DashboardNotificationsCard } from "./DashboardNotificationsCard"

export function DashboardTab() {
  const { t } = useTranslation()
  const { companyRequests } = useAdminData()

  const pendingCount = companyRequests.filter(
    (c) => c.status === ProfileRequestStatus.PENDING
  ).length

  const { data: companiesDirectoryData, isLoading: isCompaniesLoading } = useCompanyDirectory(
    { page: 1, limit: 1, sortBy: "name", sortOrder: "asc" },
    true
  )
  const { data: propertiesData, isLoading: isPropertiesLoading } = usePublishedProperties(
    { page: 1, limit: 1, sortBy: "createdAt", sortOrder: "desc" },
    true
  )

  const totalCompanies = companiesDirectoryData?.pagination.total ?? 0
  const totalProperties = propertiesData?.pagination.total ?? 0

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
      value: String(pendingCount),
      icon: Clock,
      trend: "",
      color: "text-amber-600",
    },
    {
      labelKey: "propertyViews",
      value: isPropertiesLoading ? "..." : totalProperties.toLocaleString(),
      icon: Newspaper,
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
