"use client"

import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { Bell, Check, CheckCheck } from "lucide-react"
import Button from "@/components/ui/Button"
import Card, { CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/shadcn-select"
import {
  useAdminNotifications,
  useAdminNotificationsUnreadCount,
  useMarkAdminNotificationAsRead,
  useMarkAllAdminNotificationsAsRead,
} from "@/api/admin-notifications/hooks"
import { formatDateTimeForLocale } from "@/utils/datetime"

const EVENT_TYPE_ALL = "__all"
type AdminTabId =
  | "dashboard"
  | "companies"
  | "advertising"
  | "property"
  | "users"
  | "recentActivity"

function getTargetAdminTab(entityType?: string, eventType?: string): AdminTabId {
  const value = `${entityType ?? ""} ${eventType ?? ""}`.toLowerCase()

  if (
    value.includes("ad_order") ||
    value.includes("ad-order") ||
    value.includes("advertising") ||
    value.includes("ads")
  ) {
    return "advertising"
  }

  if (value.includes("property") || value.includes("real_estate")) {
    return "property"
  }

  if (value.includes("user") || value.includes("auth")) {
    return "users"
  }

  if (value.includes("company") || value.includes("profile_request")) {
    return "companies"
  }

  if (value.includes("audit") || value.includes("activity")) {
    return "recentActivity"
  }

  return "dashboard"
}

export function DashboardNotificationsCard() {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [unreadOnlyFilter, setUnreadOnlyFilter] = useState<"all" | "unread">("all")
  const [eventTypeFilter, setEventTypeFilter] = useState(EVENT_TYPE_ALL)
  const [activeNotificationId, setActiveNotificationId] = useState<string | null>(null)
  const [actionErrorKey, setActionErrorKey] = useState<"single" | "all" | null>(null)

  const {
    data: notificationsData,
    isLoading: isNotificationsLoading,
    isError: isNotificationsError,
  } = useAdminNotifications(
    {
      page: 1,
      limit: 20,
      unreadOnly: unreadOnlyFilter === "unread" ? true : undefined,
      eventType: eventTypeFilter !== EVENT_TYPE_ALL ? eventTypeFilter : undefined,
    },
    true
  )
  const { data: unreadCountData } = useAdminNotificationsUnreadCount(true)
  const { markAsRead, isPending: isMarkingOne } = useMarkAdminNotificationAsRead()
  const { markAllAsRead, isPending: isMarkingAll } = useMarkAllAdminNotificationsAsRead()

  const notifications = useMemo(
    () => notificationsData?.notifications ?? [],
    [notificationsData?.notifications]
  )
  const unreadCount = unreadCountData?.unreadCount ?? 0

  const eventTypeOptions = useMemo(() => {
    const values = notifications.map((notification) => notification.eventType).filter(Boolean)
    if (eventTypeFilter !== EVENT_TYPE_ALL) values.push(eventTypeFilter)
    return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b))
  }, [notifications, eventTypeFilter])

  const handleMarkAsRead = async (id: string) => {
    try {
      setActionErrorKey(null)
      setActiveNotificationId(id)
      await markAsRead(id)
    } catch {
      setActionErrorKey("single")
    } finally {
      setActiveNotificationId(null)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      setActionErrorKey(null)
      await markAllAsRead()
    } catch {
      setActionErrorKey("all")
    }
  }

  const navigateToTab = (tabId: AdminTabId) => {
    const nextParams = new URLSearchParams(searchParams?.toString() ?? "")
    if (tabId === "dashboard") nextParams.delete("tab")
    else nextParams.set("tab", tabId)

    const qs = nextParams.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  const handleOpenNotification = async (
    notificationId: string,
    isRead: boolean,
    tabId: AdminTabId
  ) => {
    try {
      setActionErrorKey(null)
      if (!isRead) {
        setActiveNotificationId(notificationId)
        await markAsRead(notificationId)
      }
    } catch {
      setActionErrorKey("single")
    } finally {
      setActiveNotificationId(null)
      navigateToTab(tabId)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-lg">{t("admin.dashboard.notificationsTitle")}</CardTitle>
            <p className="text-muted-foreground mt-1 text-sm">
              {t("admin.dashboard.notificationsDescription", { count: unreadCount })}
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isMarkingAll || unreadCount === 0}
            onClick={() => void handleMarkAllAsRead()}
          >
            <CheckCheck className="h-4 w-4" />
            {t("admin.dashboard.notificationsMarkAllAsRead")}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-foreground text-xs font-medium">
              {t("admin.dashboard.notificationsUnreadOnly")}
            </p>
            <Select
              value={unreadOnlyFilter}
              onValueChange={(value) => setUnreadOnlyFilter(value as "all" | "unread")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("admin.dashboard.notificationsFilterAll")}</SelectItem>
                <SelectItem value="unread">
                  {t("admin.dashboard.notificationsFilterUnread")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <p className="text-foreground text-xs font-medium">
              {t("admin.dashboard.notificationsEventType")}
            </p>
            <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={EVENT_TYPE_ALL}>
                  {t("admin.dashboard.notificationsEventTypeAll")}
                </SelectItem>
                {eventTypeOptions.map((eventType) => (
                  <SelectItem key={eventType} value={eventType}>
                    {eventType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {actionErrorKey && (
          <p className="text-destructive text-sm">
            {actionErrorKey === "all"
              ? t("admin.dashboard.notificationsMarkAllAsReadError")
              : t("admin.dashboard.notificationsMarkAsReadError")}
          </p>
        )}

        {isNotificationsLoading && (
          <p className="text-muted-foreground text-sm">
            {t("admin.dashboard.notificationsLoading")}
          </p>
        )}

        {isNotificationsError && !isNotificationsLoading && (
          <p className="text-destructive text-sm">{t("admin.dashboard.notificationsLoadError")}</p>
        )}

        {!isNotificationsLoading && !isNotificationsError && notifications.length === 0 && (
          <p className="text-muted-foreground text-sm">{t("admin.dashboard.notificationsEmpty")}</p>
        )}

        {!isNotificationsLoading &&
          !isNotificationsError &&
          notifications.map((notification) => (
            <div
              key={notification.id}
              className="bg-body-bg-light border-border flex items-start justify-between gap-3 rounded-lg border p-3"
            >
              <button
                type="button"
                className="min-w-0 flex-1 text-left"
                disabled={isMarkingOne && activeNotificationId === notification.id}
                onClick={() =>
                  void handleOpenNotification(
                    notification.id,
                    notification.isRead,
                    getTargetAdminTab(notification.entityType, notification.eventType)
                  )
                }
              >
                <div className="mb-1 flex items-center gap-2">
                  <Bell
                    className={`h-4 w-4 shrink-0 ${
                      notification.isRead ? "text-muted-foreground" : "text-amber-600"
                    }`}
                  />

                  <p className="text-foreground truncate text-sm font-semibold">
                    {notification.title}
                  </p>

                  {!notification.isRead && (
                    <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                      {t("admin.dashboard.notificationsUnread")}
                    </span>
                  )}
                </div>

                <p className="text-muted-foreground text-sm">{notification.content}</p>

                <p className="text-muted-foreground mt-1 text-xs">
                  {formatDateTimeForLocale(notification.createdAt, i18n.language)}
                </p>
              </button>

              {!notification.isRead && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isMarkingOne || activeNotificationId === notification.id}
                  onClick={() => void handleMarkAsRead(notification.id)}
                >
                  <Check className="h-4 w-4" />
                  {t("admin.dashboard.notificationsMarkAsRead")}
                </Button>
              )}
            </div>
          ))}
      </CardContent>
    </Card>
  )
}
