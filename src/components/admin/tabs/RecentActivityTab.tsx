"use client"

import { useMemo, useState } from "react"
import { Activity, ArrowDown, ArrowUp, Search, X } from "lucide-react"
import { useTranslation } from "react-i18next"

import { defaultRecentActivitiesQuery, useRecentActivities } from "@/api/recent-activities/hooks"
import type { RecentActivitiesSortOrder } from "@/api/recent-activities/types"
import { RECENT_ACTIVITIES_DEFAULT_LIMIT } from "@/api/recent-activities/types"
import { AdminPaginationBar } from "@/components/admin/AdminPaginationBar"
import Button from "@/components/ui/Button"
import Card, { CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { useDebounce } from "@/hooks/useDebounce"
import { formatDateTimeForLocale } from "@/utils/datetime"

import {
  getRecentActivityDotColor,
  resolveRecentActivityTitleKey,
  translateRecentActivity,
} from "./recentActivityTranslator"

export function RecentActivityTab() {
  const { t, i18n } = useTranslation()
  const [page, setPage] = useState(defaultRecentActivitiesQuery.page ?? 1)
  const [sortOrder, setSortOrder] = useState<RecentActivitiesSortOrder>(
    defaultRecentActivitiesQuery.sortOrder ?? "desc"
  )
  const [searchInput, setSearchInput] = useState("")
  const debouncedSearch = useDebounce(searchInput, 400)

  const query = {
    page,
    limit: RECENT_ACTIVITIES_DEFAULT_LIMIT,
    sortOrder,
    search: debouncedSearch || undefined,
  }

  const {
    data: recentActivitiesData,
    isLoading: isRecentActivitiesLoading,
    isFetching: isRecentActivitiesFetching,
    isError: isRecentActivitiesError,
  } = useRecentActivities(query)

  const recentActivities = useMemo(
    () => recentActivitiesData?.activities ?? [],
    [recentActivitiesData]
  )
  const pagination = recentActivitiesData?.pagination

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value)
    setPage(1)
  }

  const handleClearSearch = () => {
    setSearchInput("")
    setPage(1)
  }

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))
    setPage(1)
  }

  const hasSearch = searchInput.trim().length > 0
  const showList = !isRecentActivitiesLoading && !isRecentActivitiesError
  const isRefreshing = isRecentActivitiesFetching && !isRecentActivitiesLoading

  const actionBreakdown = useMemo(() => {
    const counts = new Map<string, { count: number; label: string; color: string }>()
    for (const activity of recentActivities) {
      const groupKey = resolveRecentActivityTitleKey(activity) ?? activity.title
      const existing = counts.get(groupKey)
      if (existing) {
        counts.set(groupKey, { ...existing, count: existing.count + 1 })
      } else {
        counts.set(groupKey, {
          count: 1,
          label: translateRecentActivity(t, activity).title,
          color: getRecentActivityDotColor(activity),
        })
      }
    }
    return [...counts.values()].sort((a, b) => b.count - a.count)
  }, [recentActivities, t])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-3 space-y-0">
          <CardTitle className="text-lg">{t("admin.dashboard.recentActivity")}</CardTitle>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="relative min-w-0 flex-1">
                <Search
                  className="text-muted-foreground absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2"
                  aria-hidden
                />
                <input
                  type="search"
                  value={searchInput}
                  onChange={handleSearchChange}
                  placeholder={t("admin.dashboard.recentActivitySearchPlaceholder", {
                    defaultValue: "Email, activity title, or what changed…",
                  })}
                  aria-describedby="recent-activity-search-hint"
                  className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring h-8 w-full rounded-md border py-1 pr-3 pl-8 text-xs focus-visible:ring-1 focus-visible:outline-none"
                />
              </div>
              {hasSearch && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 shrink-0 gap-1.5 text-xs"
                  onClick={handleClearSearch}
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
                  {t("admin.dashboard.recentActivityClearSearch", {
                    defaultValue: "Clear",
                  })}
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 shrink-0 gap-1.5 text-xs"
                onClick={toggleSortOrder}
                disabled={isRecentActivitiesLoading}
              >
                {sortOrder === "desc" ? (
                  <ArrowDown className="h-3.5 w-3.5" aria-hidden />
                ) : (
                  <ArrowUp className="h-3.5 w-3.5" aria-hidden />
                )}
                {sortOrder === "desc"
                  ? t("admin.dashboard.recentActivitySortNewest", { defaultValue: "Newest first" })
                  : t("admin.dashboard.recentActivitySortOldest", { defaultValue: "Oldest first" })}
              </Button>
            </div>
            <p
              id="recent-activity-search-hint"
              className="text-muted-foreground text-[11px] leading-snug"
            >
              {t("admin.dashboard.recentActivitySearchHint", {
                defaultValue:
                  "Search matches email (user or company), activity title, and stored change values. The detail line under each entry is not searched directly.",
              })}
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_220px]">
            <div>
              <div className={`space-y-4 ${isRefreshing ? "opacity-60" : ""}`}>
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

                {showList && recentActivities.length === 0 && (
                  <p className="text-muted-foreground text-sm">
                    {hasSearch
                      ? t("admin.dashboard.recentActivityNoSearchResults", {
                          defaultValue: "No activities match your search.",
                        })
                      : t("admin.dashboard.noRecentActivity", {
                          defaultValue: "No recent activity.",
                        })}
                  </p>
                )}

                {showList &&
                  recentActivities.map((activity) => {
                    const translated = translateRecentActivity(t, activity)
                    const dotColor = getRecentActivityDotColor(activity)
                    return (
                      <div key={activity.id} className="flex items-start gap-3">
                        <span className="text-muted-foreground w-28 shrink-0 pt-0.5 text-xs">
                          {formatDateTimeForLocale(activity.time, i18n.language)}
                        </span>
                        <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dotColor}`} />
                        <div>
                          <p className="text-foreground text-sm font-medium">{translated.title}</p>
                          <p className="text-muted-foreground text-xs">{translated.content}</p>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="bg-muted/30 sticky top-24 rounded-xl border p-4">
                <div className="mb-4 flex items-center gap-2">
                  <Activity className="text-muted-foreground h-4 w-4" />
                  <h3 className="text-sm font-semibold">{t("admin.dashboard.activitySummary")}</h3>
                </div>

                {pagination && (
                  <div className="bg-background mb-5 rounded-lg p-3 text-center shadow-sm">
                    <p className="text-foreground text-2xl font-bold">
                      {pagination.total.toLocaleString()}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {t("admin.dashboard.activityTotal")}
                    </p>
                  </div>
                )}

                {isRecentActivitiesLoading && (
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="space-y-1">
                        <div className="bg-muted h-3 w-3/4 animate-pulse rounded" />
                        <div className="bg-muted h-1.5 w-full animate-pulse rounded-full" />
                      </div>
                    ))}
                  </div>
                )}

                {!isRecentActivitiesLoading && actionBreakdown.length > 0 && (
                  <div>
                    <p className="text-muted-foreground mb-3 text-[10px] font-semibold tracking-wider uppercase">
                      {t("admin.dashboard.activityThisPage")}
                    </p>
                    <div className="space-y-3">
                      {actionBreakdown.map(({ label, count, color }) => {
                        const maxCount = actionBreakdown[0]?.count ?? 1
                        const pct = Math.round((count / maxCount) * 100)
                        return (
                          <div key={label} className="space-y-1">
                            <div className="flex items-center justify-between gap-1">
                              <div className="flex min-w-0 items-center gap-1.5">
                                <div className={`h-2 w-2 shrink-0 rounded-full ${color}`} />
                                <span className="text-muted-foreground truncate text-[11px]">
                                  {label}
                                </span>
                              </div>
                              <span className="text-foreground bg-muted shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold tabular-nums">
                                {count}
                              </span>
                            </div>
                            <div className="bg-muted h-1 w-full overflow-hidden rounded-full">
                              <div
                                className={`h-full rounded-full opacity-60 ${color}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {!isRecentActivitiesLoading && actionBreakdown.length === 0 && (
                  <p className="text-muted-foreground text-center text-xs">
                    {t("admin.dashboard.noRecentActivity", { defaultValue: "No recent activity." })}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {pagination && <AdminPaginationBar pagination={pagination} setPage={setPage} />}
    </div>
  )
}
