"use client"

import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { Bell, Check, CheckCheck } from "lucide-react"
import Button from "@/components/ui/Button"
import Card, { CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Pagination } from "@/components/ui/Pagination"
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
import type {
  AdminNotificationItem,
  AdminNotificationTranslationLocale,
} from "@/api/admin-notifications/types"
import { formatDateTimeForLocale } from "@/utils/datetime"

const EVENT_TYPE_ALL = "__all"
type AdminTabId =
  | "dashboard"
  | "companies"
  | "advertising"
  | "property"
  | "users"
  | "recentActivity"

const APP_LANGUAGE_TO_NOTIFICATION_LOCALE: Record<string, AdminNotificationTranslationLocale> = {
  vi: "vi",
  "vi-vn": "vi",
  en: "en",
  "en-us": "en",
  zh: "zhTw",
  "zh-tw": "zhTw",
  "zh-cn": "zhTw",
}

function toNotificationLocale(language: string): AdminNotificationTranslationLocale {
  const normalized = language.trim().toLowerCase()
  return APP_LANGUAGE_TO_NOTIFICATION_LOCALE[normalized] ?? "en"
}

function normalizeNotificationLocale(locale?: string): AdminNotificationTranslationLocale | null {
  if (!locale) return null
  const normalized = locale.trim().replace(/_/g, "-").toLowerCase()
  if (normalized === "zh-tw" || normalized === "zhtw") return "zhTw"
  if (normalized === "vi" || normalized === "vi-vn") return "vi"
  if (normalized === "en" || normalized === "en-us") return "en"
  return null
}

function getLocalizedNotificationText(
  notification: AdminNotificationItem,
  field: "title" | "content",
  language: string
): string {
  const translations = notification.metadata?.translations?.[field]
  if (!translations) return notification[field]

  const locale = toNotificationLocale(language)
  const localeValue = translations[locale]
  if (typeof localeValue === "string" && localeValue.trim()) {
    return localeValue
  }

  const defaultLocale = normalizeNotificationLocale(notification.metadata?.defaultLocale)
  const defaultValue = defaultLocale ? translations[defaultLocale] : undefined
  if (typeof defaultValue === "string" && defaultValue.trim()) {
    return defaultValue
  }

  const fallbackValue = [translations.vi, translations.en, translations.zhTw].find(
    (value) => typeof value === "string" && value.trim()
  )

  return fallbackValue ?? notification[field]
}

function getEventTypeTranslationKey(eventType: string): string {
  return eventType.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "")
}

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
  const [currentPage, setCurrentPage] = useState(1)
  const [activeNotificationId, setActiveNotificationId] = useState<string | null>(null)
  const [actionErrorKey, setActionErrorKey] = useState<"single" | "all" | null>(null)

  const {
    data: notificationsData,
    isLoading: isNotificationsLoading,
    isError: isNotificationsError,
  } = useAdminNotifications(
    {
      page: currentPage,
      limit: 5,
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
  const totalPages = Math.max(1, notificationsData?.pagination.totalPages ?? 1)
  const unreadCount = unreadCountData?.unreadCount ?? 0

  const eventTypeOptions = useMemo(() => {
    const values = notifications.map((notification) => notification.eventType).filter(Boolean)
    if (eventTypeFilter !== EVENT_TYPE_ALL) values.push(eventTypeFilter)
    return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b))
  }, [notifications, eventTypeFilter])

  const localizedNotifications = useMemo(
    () =>
      notifications.map((notification) => ({
        ...notification,
        localizedTitle: getLocalizedNotificationText(notification, "title", i18n.language),
        localizedContent: getLocalizedNotificationText(notification, "content", i18n.language),
      })),
    [notifications, i18n.language]
  )

  const getEventTypeLabel = (eventType: string) => {
    const eventTypeKey = getEventTypeTranslationKey(eventType)
    return t(`admin.dashboard.notificationsEventTypeLabels.${eventTypeKey}`, {
      defaultValue: eventType,
    })
  }

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const handleUnreadOnlyFilterChange = (value: "all" | "unread") => {
    setUnreadOnlyFilter(value)
    setCurrentPage(1)
  }

  const handleEventTypeFilterChange = (value: string) => {
    setEventTypeFilter(value)
    setCurrentPage(1)
  }

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
              onValueChange={(value) => handleUnreadOnlyFilterChange(value as "all" | "unread")}
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
            <Select value={eventTypeFilter} onValueChange={handleEventTypeFilterChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={EVENT_TYPE_ALL}>
                  {t("admin.dashboard.notificationsEventTypeAll")}
                </SelectItem>
                {eventTypeOptions.map((eventType) => (
                  <SelectItem key={eventType} value={eventType}>
                    {getEventTypeLabel(eventType)}
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
          localizedNotifications.map((notification) => (
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
                    {notification.localizedTitle}
                  </p>

                  {!notification.isRead && (
                    <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                      {t("admin.dashboard.notificationsUnread")}
                    </span>
                  )}
                </div>

                <p className="text-muted-foreground text-sm">{notification.localizedContent}</p>

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

        {!isNotificationsLoading && !isNotificationsError && notifications.length > 0 && (
          <Pagination totalPages={totalPages} currentPage={currentPage} onPageChange={setCurrentPage} />
        )}
      </CardContent>
    </Card>
  )
}
