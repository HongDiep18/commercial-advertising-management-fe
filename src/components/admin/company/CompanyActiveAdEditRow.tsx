"use client"

import type { CompanyActiveAdItem } from "@/api/active-ads/adminService"
import { translateAdPackageType } from "@/components/admin/advertising/AdPackageLabel"
import Button from "@/components/ui/Button"
import Calendar from "@/components/ui/Calendar"
import { Field, FieldError } from "@/components/ui/field"
import Input from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover"
import TextColorBadge from "@/components/ui/TextColorBadge"
import { useForm } from "@tanstack/react-form-nextjs"
import { format } from "date-fns"
import { CalendarIcon, Paperclip, Upload, X } from "lucide-react"
import { useMemo, useState, type ChangeEvent } from "react"
import { useTranslation } from "react-i18next"
import { z } from "zod"
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

type FormValues = {
  isActive: boolean
  startDate: Date | undefined
  endDate: Date | undefined
  adLinkUrl: string
}

type SubmitValues = {
  isActive: boolean
  startDate: Date | undefined
  endDate: Date | undefined
  adLinkUrl: string
  assets: AssetEntry[]
}

type Props = {
  ad: CompanyActiveAdItem
  lang: string
  showActiveToggle?: boolean
  showAssets?: boolean
  disableDateEditing?: boolean
  showDateRangeValidation?: boolean
  showAdLinkValidation?: boolean
  showAdLinkField?: boolean
  saveLabel?: string
  saving: boolean
  deleting: boolean
  onCancel: () => void
  onSave: (values: SubmitValues) => Promise<void>
}

export function CompanyActiveAdEditRow({
  ad,
  lang,
  showActiveToggle = true,
  showAssets = true,
  disableDateEditing = true,
  showDateRangeValidation = false,
  showAdLinkValidation = false,
  showAdLinkField = true,
  saveLabel,
  saving,
  deleting,
  onCancel,
  onSave,
}: Props) {
  const { t } = useTranslation()

  const [startCalOpen, setStartCalOpen] = useState(false)
  const [endCalOpen, setEndCalOpen] = useState(false)

  const [assets, setAssets] = useState<AssetEntry[]>(() =>
    ad.assets.map((a) => ({ kind: "existing", fileUrl: a.fileUrl, assetType: a.assetType }))
  )

  const handleFileAdd = (event: ChangeEvent<HTMLInputElement>): void => {
    const files = Array.from(event.target.files ?? [])
    if (files.length === 0) return

    setAssets((prev) => [
      ...prev,
      ...files.map((file) => ({
        kind: "new" as const,
        file,
        assetType: "banner",
        previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : "",
      })),
    ])

    event.target.value = ""
  }

  const validationSchema = useMemo(() => {
    const invalidRangeMessage: string = t("admin.activeAds.createInvalidRange")
    const invalidUrlMessage: string = t("admin.activeAds.createUrlError")

    return z
      .object({
        isActive: z.boolean(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        adLinkUrl: z.string(),
      })
      .superRefine((val, ctx) => {
        if (
          showDateRangeValidation &&
          val.startDate &&
          val.endDate &&
          val.endDate.getTime() <= val.startDate.getTime()
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: invalidRangeMessage,
            path: ["endDate"],
          })
        }

        if (showAdLinkValidation && val.adLinkUrl.trim() !== "" && !isValidHttpUrl(val.adLinkUrl)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: invalidUrlMessage,
            path: ["adLinkUrl"],
          })
        }
      })
  }, [showAdLinkValidation, showDateRangeValidation, t])

  const form = useForm({
    defaultValues: {
      isActive: ad.isActive,
      startDate: ad.startDate ? new Date(ad.startDate) : undefined,
      endDate: ad.endDate ? new Date(ad.endDate) : undefined,
      adLinkUrl: ad.adLinkUrl ?? "",
    },
  })

  type RowBodyProps = { values: FormValues }
  const RowBody = ({ values }: RowBodyProps) => {
    const validation = validationSchema.safeParse(values)
    const endDateIssue = validation.success
      ? undefined
      : validation.error.issues.find((issue) => issue.path[0] === "endDate")
    const adLinkIssue = validation.success
      ? undefined
      : validation.error.issues.find((issue) => issue.path[0] === "adLinkUrl")

    const hasInvalidDateRange = Boolean(endDateIssue)
    const isAdLinkValid = isValidHttpUrl(values.adLinkUrl)
    const hasInvalidAdLink =
      showAdLinkValidation && values.adLinkUrl.trim() !== "" && !isAdLinkValid

    const invalidRangeMessage = endDateIssue?.message
    const invalidUrlMessage = adLinkIssue?.message

    const canSubmitDate =
      !showDateRangeValidation ||
      (values.startDate
        ? !values.endDate || values.endDate.getTime() > values.startDate.getTime()
        : false)
    const canSubmitAdLink = !showAdLinkValidation || isAdLinkValid
    const canSubmit = canSubmitDate && canSubmitAdLink

    return (
      <div className="mb-2 space-y-3 rounded-lg bg-white p-3 shadow-md">
        <div className="flex items-center justify-between gap-2">
          <TextColorBadge colorKey={ad.packageType} className="text-xs">
            {translateAdPackageType(t, ad.packageType)}
          </TextColorBadge>
          {showActiveToggle && (
            <button
              type="button"
              onClick={() => form.setFieldValue("isActive", !values.isActive)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                values.isActive ? "bg-green-600" : "bg-muted"
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                  values.isActive ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Field className="gap-1">
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
                  {values.startDate ? formatDateDisplay(values.startDate.toISOString(), lang) : "—"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="z-90 w-[280px] p-0" align="start">
                <Calendar
                  mode="single"
                  selected={values.startDate}
                  onSelect={(d) => {
                    form.setFieldValue("startDate", d)
                    setStartCalOpen(false)
                  }}
                  className="w-full"
                  initialFocus
                  localeCode={lang}
                />
              </PopoverContent>
            </Popover>
          </Field>

          <Field className="gap-1">
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
                  {values.endDate ? formatDateDisplay(values.endDate.toISOString(), lang) : "—"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="z-90 w-[280px] p-0" align="start">
                <Calendar
                  mode="single"
                  selected={values.endDate}
                  onSelect={(d) => {
                    form.setFieldValue("endDate", d)
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
                      form.setFieldValue("endDate", undefined)
                      setEndCalOpen(false)
                    }}
                  >
                    {t("admin.activeAds.clearEndDate", "Clear")}
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            {showDateRangeValidation && hasInvalidDateRange && (
              <FieldError
                errors={[
                  { message: invalidRangeMessage ?? t("admin.activeAds.createInvalidRange") },
                ]}
              />
            )}
          </Field>
        </div>

        {showAdLinkField && (
          <Field className="gap-1">
            <Label className="text-xs">{t("adContact.adLink", "Ad link")}</Label>
            <Input
              type="url"
              placeholder="https://"
              className={`h-8 text-xs ${hasInvalidAdLink ? "border-red-500" : ""}`}
              value={values.adLinkUrl}
              onChange={(e) => form.setFieldValue("adLinkUrl", e.target.value)}
            />
            {hasInvalidAdLink && (
              <FieldError
                errors={[{ message: invalidUrlMessage ?? t("admin.activeAds.createUrlError") }]}
              />
            )}
          </Field>
        )}

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
              onChange={handleFileAdd}
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
            onClick={() =>
              void onSave({
                isActive: values.isActive,
                startDate: values.startDate,
                endDate: values.endDate,
                adLinkUrl: values.adLinkUrl,
                assets,
              })
            }
            disabled={saving || deleting || !canSubmit}
          >
            {saving ? t("common.saving", "Saving...") : (saveLabel ?? t("common.save", "Save"))}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form.Subscribe
      selector={(state) => state.values}
      children={(values) => <RowBody values={values} />}
    />
  )
}
