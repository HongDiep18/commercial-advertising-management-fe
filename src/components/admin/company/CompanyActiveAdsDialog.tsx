"use client"

import type { CompanyActiveAdItem } from "@/api/active-ads/adminService"
import { useCompanyActiveAds, useSaveActiveAd } from "@/api/active-ads/hooks"
import { uploadFiles } from "@/api/files/service"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Calendar from "@/components/ui/Calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog"
import Input from "@/components/ui/Input"
import Label from "@/components/ui/Label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover"
import TextColorBadge from "@/components/ui/TextColorBadge"
import { formatDateTimeForLocale } from "@/utils/datetime"
import { format } from "date-fns"
import { CalendarIcon, Link2, Paperclip, Pencil, Upload, X } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
type Props = {
  companyId: string
  companyName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

type AssetEntry =
  | { kind: "existing"; fileUrl: string; assetType: string }
  | { kind: "new"; file: File; assetType: string; previewUrl: string }

const IMAGE_EXTS = /\.(jpe?g|png|gif|webp|avif|svg)$/i

function isImageUrl(url: string): boolean {
  return IMAGE_EXTS.test(url.split("?")[0])
}

function formatDateDisplay(iso: string, lang: string): string {
  const d = new Date(iso)
  if (lang === "zh-TW") return format(d, "yyyy年M月d日")
  if (lang === "vi-VN") return format(d, "dd/MM/yyyy")
  return format(d, "MMM d, yyyy")
}

const STATUS_STYLES: Record<CompanyActiveAdItem["status"], string> = {
  activating: "border-green-500 bg-green-50 text-green-700",
  pending: "border-orange-400 bg-orange-50 text-orange-700",
  expired: "border-red-400 bg-red-50 text-red-700",
  disabled: "border-gray-400 bg-gray-100 text-gray-600",
}

function AdStatusBadge({ status }: { status: CompanyActiveAdItem["status"] }) {
  const { t } = useTranslation()
  const label = t(`admin.activeAds.status.${status}`, status)
  return (
    <Badge variant="outline" className={STATUS_STYLES[status]}>
      {label}
    </Badge>
  )
}

function ActiveAdRow({
  ad,
  companyId,
  locale,
  lang,
}: {
  ad: CompanyActiveAdItem
  companyId: string
  locale: string
  lang: string
}) {
  const { t } = useTranslation()
  const [editing, setEditing] = useState(false)

  // Edit state
  const [isActive, setIsActive] = useState(ad.isActive)
  const [startDate, setStartDate] = useState<Date | undefined>(
    ad.startDate ? new Date(ad.startDate) : undefined
  )
  const [endDate, setEndDate] = useState<Date | undefined>(
    ad.endDate ? new Date(ad.endDate) : undefined
  )
  const [adLinkUrl, setAdLinkUrl] = useState(ad.adLinkUrl ?? "")
  const [assets, setAssets] = useState<AssetEntry[]>(
    ad.assets.map((a) => ({ kind: "existing", fileUrl: a.fileUrl, assetType: a.assetType }))
  )
  const [startCalOpen, setStartCalOpen] = useState(false)
  const [endCalOpen, setEndCalOpen] = useState(false)

  const { mutateAsync: saveAd, isPending: saving } = useSaveActiveAd(companyId)

  const handleCancel = () => {
    setIsActive(ad.isActive)
    setStartDate(ad.startDate ? new Date(ad.startDate) : undefined)
    setEndDate(ad.endDate ? new Date(ad.endDate) : undefined)
    setAdLinkUrl(ad.adLinkUrl ?? "")
    setAssets(
      ad.assets.map((a) => ({ kind: "existing", fileUrl: a.fileUrl, assetType: a.assetType }))
    )
    setEditing(false)
  }

  const handleSave = async () => {
    const newFiles = assets.filter(
      (a): a is Extract<AssetEntry, { kind: "new" }> => a.kind === "new"
    )
    let uploadedUrls: string[] = []
    if (newFiles.length > 0) {
      const result = await uploadFiles(
        newFiles.map((a) => a.file),
        "active-ads"
      )
      uploadedUrls = result.files.map((f) => f.url)
    }

    let uploadIndex = 0
    const finalAssets = assets.map((a) =>
      a.kind === "existing"
        ? { fileUrl: a.fileUrl, assetType: a.assetType }
        : { fileUrl: uploadedUrls[uploadIndex++] ?? "", assetType: a.assetType }
    )

    await saveAd({
      activeAdId: ad.id,
      payload: {
        isActive,
        startDate: startDate?.toISOString(),
        endDate: endDate ? endDate.toISOString() : null,
        adLinkUrl: adLinkUrl.trim() || null,
        assets: finalAssets,
      },
    })
    setEditing(false)
  }

  const handleFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    setAssets((prev) => [
      ...prev,
      ...files.map((f) => ({
        kind: "new" as const,
        file: f,
        assetType: "banner",
        previewUrl: f.type.startsWith("image/") ? URL.createObjectURL(f) : "",
      })),
    ])
    e.target.value = ""
  }

  if (!editing) {
    return (
      <div className="bg-body-bg-dark-foreground mb-2 space-y-2 rounded-lg p-3">
        <div className="flex items-center justify-between gap-2">
          <TextColorBadge colorKey={ad.packageType} className="text-xs">
            {t(`admin.advertising.adPackageType.${ad.packageType}`)}
          </TextColorBadge>
          <div className="flex items-center gap-2">
            <AdStatusBadge status={ad.status} />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditing(true)}
              className="hover:!bg-primary h-8 hover:!text-white"
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

  // Edit mode
  return (
    <div className="mb-2 space-y-3 rounded-lg bg-white p-3 shadow-md">
      {/* Header: package type + active toggle */}
      <div className="flex items-center justify-between gap-2">
        <TextColorBadge colorKey={ad.packageType} className="text-xs">
          {t(`admin.advertising.adPackageType.${ad.packageType}`)}
        </TextColorBadge>
        <button
          type="button"
          onClick={() => setIsActive((v) => !v)}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
            isActive ? "bg-green-600" : "bg-muted"
          }`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
              isActive ? "translate-x-4" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs">{t("adContact.startDate", "Start")}</Label>
          <Popover open={startCalOpen} onOpenChange={setStartCalOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="h-8 w-full justify-start bg-transparent px-2 text-left text-xs font-normal"
              >
                <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                {startDate ? formatDateDisplay(startDate.toISOString(), lang) : "—"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="z-90 w-[280px] p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(d) => {
                  setStartDate(d)
                  setStartCalOpen(false)
                }}
                className="w-full"
                initialFocus
                localeCode={lang}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">{t("adContact.endDate", "End")}</Label>
          <Popover open={endCalOpen} onOpenChange={setEndCalOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="h-8 w-full justify-start bg-transparent px-2 text-left text-xs font-normal"
              >
                <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                {endDate ? formatDateDisplay(endDate.toISOString(), lang) : "—"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="z-90 w-[280px] p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={(d) => {
                  setEndDate(d)
                  setEndCalOpen(false)
                }}
                className="w-full"
                initialFocus
                localeCode={lang}
              />
              <div className="border-t p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => {
                    setEndDate(undefined)
                    setEndCalOpen(false)
                  }}
                >
                  {t("admin.activeAds.clearEndDate", "Clear")}
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Ad link */}
      <div className="space-y-1">
        <Label className="text-xs">{t("adContact.adLink", "Ad link")}</Label>
        <Input
          type="url"
          placeholder="https://"
          className="h-8 text-xs"
          value={adLinkUrl}
          onChange={(e) => setAdLinkUrl(e.target.value)}
        />
      </div>

      {/* Assets */}
      <div className="space-y-1">
        <Label className="text-xs">{t("admin.advertising.assets", "Assets")}</Label>
        {assets.length > 0 && (
          <ul className="space-y-2">
            {assets.map((asset, index) => {
              const previewUrl =
                asset.kind === "existing" && isImageUrl(asset.fileUrl)
                  ? asset.fileUrl
                  : asset.kind === "new"
                    ? asset.previewUrl
                    : ""
              const label =
                asset.kind === "existing" ? asset.fileUrl.split("/").pop() : asset.file.name

              return (
                <li key={index} className="bg-body-bg-dark space-y-1.5 rounded p-2">
                  {previewUrl && (
                    <a href={previewUrl} target="_blank" rel="noreferrer">
                      <img
                        src={previewUrl}
                        alt={label}
                        className="h-20 w-full rounded object-cover"
                      />
                    </a>
                  )}
                  <div className="flex items-center gap-2">
                    <Paperclip className="text-muted-foreground h-3 w-3 shrink-0" />
                    <span className="text-muted-foreground min-w-0 flex-1 truncate text-xs">
                      {label}
                    </span>
                    <button
                      type="button"
                      onClick={() => setAssets((prev) => prev.filter((_, i) => i !== index))}
                      className="text-muted-foreground hover:text-foreground shrink-0"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
        <button
          type="button"
          className="border-border hover:border-primary/50 flex w-full items-center justify-center gap-2 rounded border border-dashed py-2 text-xs transition-colors"
          onClick={() =>
            (document.getElementById(`asset-upload-${ad.id}`) as HTMLInputElement)?.click()
          }
        >
          <Upload className="text-muted-foreground h-3.5 w-3.5" />
          <span className="text-muted-foreground">{t("adContact.clickToUpload", "Upload")}</span>
        </button>
        <input
          id={`asset-upload-${ad.id}`}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.pdf,.ai"
          className="hidden"
          onChange={handleFileAdd}
        />
      </div>

      {/* Bottom action buttons */}
      <div className="flex gap-2 border-t pt-3">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 border-gray-500"
          onClick={handleCancel}
          disabled={saving}
        >
          {t("common.cancel", "Cancel")}
        </Button>
        <Button
          variant="primary"
          size="sm"
          className="bg-primary flex-1"
          onClick={() => void handleSave()}
          disabled={saving}
        >
          {saving ? t("common.saving", "Saving...") : t("common.save", "Save")}
        </Button>
      </div>
    </div>
  )
}

export function CompanyActiveAdsDialog({ companyId, companyName, open, onOpenChange }: Props) {
  const { t, i18n } = useTranslation()
  const { data, isLoading, isError } = useCompanyActiveAds(open ? companyId : null)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-body-bg-dark relative max-h-[90vh] max-w-2xl overflow-y-auto">
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground absolute top-3 right-3 h-8 w-8"
          onClick={() => onOpenChange(false)}
          aria-label={t("admin.companies.closeDialog")}
        >
          <X className="h-4 w-4" />
        </Button>

        <DialogHeader>
          <DialogTitle>{companyName}</DialogTitle>
          <DialogDescription>
            {t("admin.activeAds.dialogDescription", "Active ads for this company")}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-2 px-5 pb-5">
          {isLoading && (
            <p className="text-muted-foreground text-sm">{t("common.loading", "Loading...")}</p>
          )}

          {isError && (
            <p className="text-destructive text-sm">
              {t("admin.activeAds.loadError", "Failed to load active ads")}
            </p>
          )}

          {!isLoading && !isError && data?.items.length === 0 && (
            <p className="text-muted-foreground text-sm">
              {t("admin.activeAds.empty", "No active ads found for this company.")}
            </p>
          )}

          {!isLoading &&
            !isError &&
            data?.items.map((ad) => (
              <ActiveAdRow
                key={ad.id}
                ad={ad}
                companyId={companyId}
                locale={i18n.language}
                lang={i18n.language}
              />
            ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
