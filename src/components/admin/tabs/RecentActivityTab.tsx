"use client"

import { useTranslation } from "react-i18next"
import Card, { CardContent, CardHeader, CardTitle } from "@/components/ui/Card"

const recentActivities = [
  {
    time: "14:30",
    actionKey: "activityNewCompany",
    detailKey: "activityCompanyDetail",
  },
  {
    time: "13:15",
    actionKey: "activityNewsCrawl",
    detailKey: "activityNewsDetail",
  },
  { time: "12:00", actionKey: "activityAdOrder", detailKey: "activityAdDetail" },
  {
    time: "10:45",
    actionKey: "activityPropertyUpdate",
    detailKey: "activityPropertyDetail",
  },
  { time: "09:30", actionKey: "activityUserReg", detailKey: "activityUserDetail" },
  {
    time: "08:00",
    actionKey: "activitySystem",
    detailKey: "activitySystemDetail",
  },
]

export function RecentActivityTab() {
  const { t } = useTranslation()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t("admin.dashboard.recentActivity")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.map((activity, index) => (
            <div key={`${activity.time}-${index}`} className="flex items-start gap-3">
              <span className="text-muted-foreground w-12 shrink-0 pt-0.5 text-xs">{activity.time}</span>
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
  )
}
