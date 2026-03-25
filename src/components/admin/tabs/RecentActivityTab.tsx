"use client"

import { useTranslation } from "react-i18next"

import Card, { CardContent, CardHeader, CardTitle } from "@/components/ui/Card"

import { useRecentActivities } from "@/api/recent-activities/hooks"

import { translateRecentActivity } from "./recentActivityTranslator"

export function RecentActivityTab() {
  const { t, i18n } = useTranslation()

  const {
    data: recentActivitiesData,

    isLoading: isRecentActivitiesLoading,

    isError: isRecentActivitiesError,
  } = useRecentActivities({ page: 1, limit: 20 })

  const recentActivities = recentActivitiesData?.activities ?? recentActivitiesData?.data ?? []

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t("admin.dashboard.recentActivity")}</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {isRecentActivitiesLoading && (
            <p className="text-muted-foreground text-sm">
              {t("common.loading", { defaultValue: "Loading..." })}
            </p>
          )}

          {isRecentActivitiesError && !isRecentActivitiesLoading && (
            <p className="text-muted-foreground text-sm">
              {t("admin.dashboard.recentActivityLoadError", {
                defaultValue: "Unable to load recent activity right now.",
              })}
            </p>
          )}

          {!isRecentActivitiesLoading &&
            !isRecentActivitiesError &&
            recentActivities.length === 0 && (
              <p className="text-muted-foreground text-sm">
                {t("admin.dashboard.noRecentActivity", { defaultValue: "No recent activity." })}
              </p>
            )}

          {!isRecentActivitiesLoading &&
            !isRecentActivitiesError &&
            recentActivities.map((activity) => {
              const translated = translateRecentActivity(t, activity)

              return (
                <div key={activity.id} className="flex items-start gap-3">
                  <span className="text-muted-foreground w-12 shrink-0 pt-0.5 text-xs">
                    {new Date(activity.time).toLocaleTimeString(i18n.language, {
                      hour: "2-digit",

                      minute: "2-digit",

                      hour12: false,
                    })}
                  </span>

                  <div className="bg-primary mt-1.5 h-2 w-2 shrink-0 rounded-full" />

                  <div>
                    <p className="text-foreground text-sm font-medium">{translated.title}</p>

                    <p className="text-muted-foreground text-xs">{translated.content}</p>
                  </div>
                </div>
              )
            })}
        </div>
      </CardContent>
    </Card>
  )
}
