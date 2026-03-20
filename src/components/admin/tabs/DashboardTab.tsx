"use client"

import { useTranslation } from "react-i18next"
import { Building2, Clock, TrendingUp, AlertTriangle } from "lucide-react"
import Card, { CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { useAdminData } from "../AdminDataContext"
import { ProfileRequestStatus } from "@/types/admin"
import { useCompanyDirectory } from "@/api/companies/hooks"

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
  const totalCompanies = companiesDirectoryData?.pagination.total ?? 0

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
    // {
    //   labelKey: "newsCount",
    //   value: "359",
    //   icon: Newspaper,
    //   trendKey: "trendToday",
    //   color: "text-green-600",
    // },
    {
      labelKey: "propertyViews",
      value: "1,302",
      icon: TrendingUp,
      trend: "",
      color: "text-primary",
    },
  ]

  const recentActivities = [
    {
      time: "14:30",
      actionKey: "activityNewCompany",
      detailKey: "activityCompanyDetail",
      type: "company",
    },
    {
      time: "13:15",
      actionKey: "activityNewsCrawl",
      detailKey: "activityNewsDetail",
      type: "news",
    },
    { time: "12:00", actionKey: "activityAdOrder", detailKey: "activityAdDetail", type: "ad" },
    {
      time: "10:45",
      actionKey: "activityPropertyUpdate",
      detailKey: "activityPropertyDetail",
      type: "property",
    },
    { time: "09:30", actionKey: "activityUserReg", detailKey: "activityUserDetail", type: "user" },
    {
      time: "08:00",
      actionKey: "activitySystem",
      detailKey: "activitySystemDetail",
      type: "system",
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

      <Card className="!bg-admin-yellow !border-admin-yellow-border">
        <CardContent className="p-4 pt-7">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="font-medium text-amber-800">{t("admin.dashboard.attentionRequired")}</p>
              <p className="mt-1 text-sm text-amber-700">
                {t("admin.dashboard.pendingAlert", { count: pendingCount })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("admin.dashboard.recentActivity")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-muted-foreground w-12 shrink-0 pt-0.5 text-xs">
                  {activity.time}
                </span>
                <div className="bg-primary mt-1.5 h-2 w-2 shrink-0 rounded-full" />
                <div>
                  <p className="text-foreground text-sm font-medium">
                    {t(`admin.dashboard.${activity.actionKey}`)}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {t(`admin.dashboard.${activity.detailKey}`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
