"use client"

import type { CompanyActiveAdItem } from "@/api/active-ads/adminService"
import { AdPackageLabel } from "@/components/admin/advertising/AdPackageLabel"
import Button from "@/components/ui/Button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/shadcn-popover"
import TextColorBadge from "@/components/ui/TextColorBadge"
import { formatDateTimeForLocale } from "@/utils/datetime"
import { Link2, Paperclip, Pencil, Trash2 } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { CompanyActiveAdStatusBadge } from "./CompanyActiveAdStatusBadge"

type Props = {
  ad: CompanyActiveAdItem
  locale: string
  deleting: boolean
  onDelete: () => Promise<void>
  onEdit: () => void
}

export function CompanyActiveAdDisplayRow({ ad, locale, deleting, onDelete, onEdit }: Props) {
  const { t } = useTranslation()
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  return (
    <div className="bg-body-bg-dark-foreground mb-2 space-y-2 rounded-lg p-3">
      <div className="flex items-center justify-between gap-2">
        <TextColorBadge colorKey={ad.packageType} className="text-xs">
          <AdPackageLabel packageType={ad.packageType} fallbackLabel={ad.packageType} />
        </TextColorBadge>
        <div className="flex items-center gap-2">
          <CompanyActiveAdStatusBadge status={ad.status} />
          <Popover open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-red-600 hover:bg-red-100! hover:text-red-700!"
                aria-label={t("admin.activeAds.delete", "Delete")}
                disabled={deleting}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="bg-body-bg-dark max-w-sm p-0">
              <div className="space-y-2 px-6 pt-6 pb-3">
                <div className="text-base leading-none font-medium">
                  {t("admin.activeAds.delete", "Delete")}
                </div>
                <div className="text-muted-foreground text-sm">
                  {t("admin.activeAds.deleteConfirm", "Delete this active ad permanently?")}
                </div>
              </div>
              <div className="flex justify-end gap-2 px-6 pb-6">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDeleteConfirmOpen(false)}
                  disabled={deleting}
                >
                  {t("common.cancel", "Cancel")}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-600 hover:bg-red-100! hover:text-red-700!"
                  onClick={async () => {
                    setDeleteConfirmOpen(false)
                    await onDelete()
                  }}
                  disabled={deleting}
                >
                  {t("admin.activeAds.delete", "Delete")}
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="hover:bg-primary! h-8 hover:text-white!"
            aria-label={t("admin.companies.edit", "Edit")}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <div className="text-muted-foreground grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        <div>
          <span className="font-medium">{t("adContact.startDate", "Start")}:</span>{" "}
          {formatDateTimeForLocale(ad.startDate, locale)}
        </div>
        <div>
          <span className="font-medium">{t("adContact.endDate", "End")}:</span>{" "}
          {ad.endDate ? formatDateTimeForLocale(ad.endDate, locale) : "—"}
        </div>
      </div>
      {(ad.adLinkUrl || ad.assets.length > 0) && (
        <div className="text-muted-foreground flex flex-wrap gap-3 text-xs">
          {ad.adLinkUrl && (
            <a
              href={ad.adLinkUrl}
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground inline-flex items-center gap-1 underline-offset-2 hover:underline"
            >
              <Link2 className="h-3.5 w-3.5" />
              {t("adContact.adLink", "Ad link")}
            </a>
          )}
          {ad.assets.length > 0 && (
            <span className="inline-flex items-center gap-1">
              <Paperclip className="h-3.5 w-3.5" />
              {ad.assets.length} {t("admin.advertising.assets", "assets")}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
