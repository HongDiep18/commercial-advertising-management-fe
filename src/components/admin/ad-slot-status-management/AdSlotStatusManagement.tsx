"use client"

import type { ActiveAdsSlotStatusAdItem, ActiveAdsSlotStatusItem } from "@/api/active-ads/types"
import { useAdminActiveAdsSlotStatus } from "@/api/active-ads/hooks"
import { AdPackageLabel } from "@/components/admin/advertising/AdPackageLabel"
import Card, { CardContent } from "@/components/ui/Card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table"
import TextColorBadge from "@/components/ui/TextColorBadge"
import { formatDateTimeForLocale } from "@/utils/datetime"
import { useTranslation } from "react-i18next"

type SlotSectionKey = "activeAds" | "waitingAds" | "expiredAds"

type SlotSectionConfig = {
  key: SlotSectionKey
  labelKey: string
}

const SLOT_SECTION_CONFIGS: SlotSectionConfig[] = [
  {
    key: "activeAds",
    labelKey: "admin.advertising.slotStatus.activeAds",
  },
  {
    key: "waitingAds",
    labelKey: "admin.advertising.slotStatus.waitingAds",
  },
  {
    key: "expiredAds",
    labelKey: "admin.advertising.slotStatus.expiredAds",
  },
]

function formatDateTime(dateStr: string | null | undefined, locale: string, fallbackLabel: string): string {
  if (!dateStr) return fallbackLabel
  return formatDateTimeForLocale(dateStr, locale)
}

function SlotAdsTable({
  rows,
  locale,
  notAvailableLabel,
}: {
  rows: ActiveAdsSlotStatusAdItem[]
  locale: string
  notAvailableLabel: string
}) {
  const { t } = useTranslation()

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("admin.advertising.slotStatus.companyName")}</TableHead>
          <TableHead>{t("admin.advertising.slotStatus.startDate")}</TableHead>
          <TableHead>{t("admin.advertising.slotStatus.endDate")}</TableHead>
          <TableHead>{t("admin.advertising.slotStatus.adLinkUrl")}</TableHead>
          <TableHead>{t("admin.advertising.slotStatus.source")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row, index) => {
          const rowKey = `${String(row.orderItemId ?? row.activeAdId ?? index)}-${index}`

          return (
            <TableRow key={rowKey}>
              <TableCell className="font-medium">{row.companyName || notAvailableLabel}</TableCell>
              <TableCell>{formatDateTime(row.startDate, locale, notAvailableLabel)}</TableCell>
              <TableCell>{formatDateTime(row.endDate, locale, notAvailableLabel)}</TableCell>
              <TableCell>
                {row.adLinkUrl ? (
                  <a
                    href={row.adLinkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {row.adLinkUrl}
                  </a>
                ) : (
                  <span className="text-muted-foreground">{notAvailableLabel}</span>
                )}
              </TableCell>
              <TableCell>{row.source || notAvailableLabel}</TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

function SlotStatusCard({ slot }: { slot: ActiveAdsSlotStatusItem }) {
  const { t, i18n } = useTranslation()
  const fallbackLabel = t("admin.advertising.slotStatus.notAvailable", { defaultValue: "N/A" })
  const expiresAt = formatDateTime(slot.expiresAt, i18n.language, fallbackLabel)
  const localizedFallbackName = i18n.language === "zh-TW" ? slot.packageNameZh || slot.packageName : slot.packageName

  return (
    <Card>
      <CardContent className="p-4 pt-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <TextColorBadge colorKey={slot.packageType} className="px-3 py-1 text-xs">
              <AdPackageLabel packageType={slot.packageType} fallbackLabel={localizedFallbackName} />
            </TextColorBadge>
            <span
              className={`text-xs font-medium ${slot.hasActiveAds ? "text-emerald-600" : "text-muted-foreground"}`}
            >
              {slot.hasActiveAds
                ? t("admin.advertising.slotStatus.occupied")
                : t("admin.advertising.slotStatus.available")}
            </span>
          </div>
          <p className="text-muted-foreground text-xs">
            {t("admin.advertising.slotStatus.expiresAt")}: {expiresAt}
          </p>
        </div>

        <div className="space-y-4">
          {SLOT_SECTION_CONFIGS.map((section) => {
            const rows = slot[section.key]
            return (
              <section key={section.key} className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold">{t(section.labelKey)}</h4>
                  <span className="text-muted-foreground text-xs">{rows.length}</span>
                </div>
                {rows.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    {t("admin.advertising.slotStatus.emptySection")}
                  </p>
                ) : (
                  <SlotAdsTable
                    rows={rows}
                    locale={i18n.language}
                    notAvailableLabel={fallbackLabel}
                  />
                )}
              </section>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

export function AdSlotStatusManagement() {
  const { t } = useTranslation()
  const { data, isLoading, isError } = useAdminActiveAdsSlotStatus()

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          {t("admin.advertising.slotStatus.loading")}
        </CardContent>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-destructive">
          {t("admin.advertising.slotStatus.error")}
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          {t("admin.advertising.slotStatus.empty")}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {data.map((slot) => (
        <SlotStatusCard key={slot.packageType} slot={slot} />
      ))}
    </div>
  )
}
