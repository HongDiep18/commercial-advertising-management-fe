"use client"

import Button from "@/components/ui/Button"
import Calendar from "@/components/ui/Calendar"
import Input from "@/components/ui/Input"
import Label from "@/components/ui/Label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover"
import TextColorBadge from "@/components/ui/TextColorBadge"
import { format } from "date-fns"
import { CalendarIcon, Paperclip, Upload, X } from "lucide-react"
import { useEffect, type ChangeEvent, type Dispatch, type SetStateAction } from "react"
import { useTranslation } from "react-i18next"
import type { CompanyActiveAdItem } from "@/api/active-ads/adminService"
import type { AssetEntry } from "./company-active-ads.types"

const IMAGE_EXTS = /\.(jpe?g|png|gif|webp|avif|svg)$/i

function isImageUrl(url: string): boolean {
  return IMAGE_EXTS.test(url.split("?")[0])
}

function formatDateDisplay(iso: string, lang: string): string {
  const date = new Date(iso)
  if (lang === "zh-TW") return format(date, "yyyy年M月d日")
  if (lang === "vi-VN") return format(date, "dd/MM/yyyy")
  return format(date, "MMM d, yyyy")
}

function isValidHttpUrl(value: string): boolean {
  const trimmed = value.trim()
  if (trimmed === "") return false
  try {
    const url = new URL(trimmed)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

type Props = {
  ad: CompanyActiveAdItem
  lang: string
  packageTypeLabelKey?: string
  showActiveToggle?: boolean
  showAssets?: boolean
  disableDateEditing?: boolean
  showDateRangeValidation?: boolean
  showAdLinkValidation?: boolean
  saveLabel?: string
  isActive: boolean
  setIsActive: Dispatch<SetStateAction<boolean>>
  startDate: Date | undefined
  setStartDate: Dispatch<SetStateAction<Date | undefined>>
  endDate: Date | undefined
  setEndDate: Dispatch<SetStateAction<Date | undefined>>
  adLinkUrl: string
  setAdLinkUrl: Dispatch<SetStateAction<string>>
  assets: AssetEntry[]
  setAssets: Dispatch<SetStateAction<AssetEntry[]>>
  startCalOpen: boolean
  setStartCalOpen: Dispatch<SetStateAction<boolean>>
  endCalOpen: boolean
  setEndCalOpen: Dispatch<SetStateAction<boolean>>
  saving: boolean
  deleting: boolean
  onCancel: () => void
  onSave: () => Promise<void>
  onDateRangeValidityChange?: (isValid: boolean) => void
  onAdLinkValidityChange?: (isValid: boolean) => void
  onFileAdd?: (event: ChangeEvent<HTMLInputElement>) => void
}

export function CompanyActiveAdEditRow({
  ad,
  lang,
  packageTypeLabelKey,
  showActiveToggle = true,
  showAssets = true,
  disableDateEditing = true,
  showDateRangeValidation = false,
  showAdLinkValidation = false,
  saveLabel,
  isActive,
  setIsActive,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  adLinkUrl,
  setAdLinkUrl,
  assets,
  setAssets,
  startCalOpen,
  setStartCalOpen,
  endCalOpen,
  setEndCalOpen,
  saving,
  deleting,
  onCancel,
  onSave,
  onDateRangeValidityChange,
  onAdLinkValidityChange,
  onFileAdd,
}: Props) {
  const { t } = useTranslation()
  const hasInvalidDateRange = Boolean(startDate && endDate && endDate <= startDate)
  const isAdLinkValid = isValidHttpUrl(adLinkUrl)
  const hasInvalidAdLink = showAdLinkValidation && adLinkUrl.trim() !== "" && !isAdLinkValid

  useEffect(() => {
    onDateRangeValidityChange?.(!hasInvalidDateRange)
  }, [hasInvalidDateRange, onDateRangeValidityChange])

  useEffect(() => {
    onAdLinkValidityChange?.(isAdLinkValid)
  }, [isAdLinkValid, onAdLinkValidityChange])

  return (
    <div className="mb-2 space-y-3 rounded-lg bg-white p-3 shadow-md">
      <div className="flex items-center justify-between gap-2">
        <TextColorBadge colorKey={ad.packageType} className="text-xs">
          {t(packageTypeLabelKey ?? `admin.advertising.adPackageType.${ad.packageType}`)}
        </TextColorBadge>
        {showActiveToggle && (
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
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs">{t("adContact.startDate", "Start")}</Label>
          <Popover open={startCalOpen} onOpenChange={setStartCalOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                disabled={disableDateEditing}
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
                disabled={disableDateEditing}
                className={`h-8 w-full justify-start bg-transparent px-2 text-left text-xs font-normal ${
                  showDateRangeValidation && hasInvalidDateRange ? "border-red-500" : ""
                }`}
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
      {showDateRangeValidation && hasInvalidDateRange && (
        <p className="text-destructive text-xs">{t("admin.activeAds.createInvalidRange")}</p>
      )}
      <div className="space-y-1">
        <Label className="text-xs">{t("adContact.adLink", "Ad link")}</Label>
        <Input
          type="url"
          placeholder="https://"
          className={`h-8 text-xs ${hasInvalidAdLink ? "border-red-500" : ""}`}
          value={adLinkUrl}
          onChange={(e) => setAdLinkUrl(e.target.value)}
        />
        {hasInvalidAdLink && (
          <p className="text-destructive text-xs">{t("admin.activeAds.createUrlError")}</p>
        )}
      </div>
      {showAssets && (
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
            <span className="text-muted-foreground">
              {t("adContact.clickToUpload", "Upload")}
            </span>
          </button>
          <input
            id={`asset-upload-${ad.id}`}
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.pdf,.ai"
            className="hidden"
            onChange={onFileAdd}
          />
        </div>
      )}
      <div className="flex gap-2 border-t pt-3">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 border-gray-500"
          onClick={onCancel}
          disabled={saving || deleting}
        >
          {t("common.cancel", "Cancel")}
        </Button>
        <Button
          variant="primary"
          size="sm"
          className="bg-primary flex-1"
          onClick={() => void onSave()}
          disabled={saving || deleting}
        >
          {saving ? t("common.saving", "Saving...") : saveLabel ?? t("common.save", "Save")}
        </Button>
      </div>
    </div>
  )
}
