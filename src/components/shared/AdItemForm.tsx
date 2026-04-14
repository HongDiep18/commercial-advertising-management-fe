"use client"

import type { AdPackageFormConfig } from "@/api/ads-pricing/types"
import Button from "@/components/ui/Button"
import Calendar from "@/components/ui/Calendar"
import Checkbox from "@/components/ui/Checkbox"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import Input from "@/components/ui/Input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/shadcn-popover"
import { Switch } from "@/components/ui/switch"
import { addDurationToDateStr } from "@/data/contactMockData"
import { useForm } from "@tanstack/react-form-nextjs"
import { format } from "date-fns"
import type { TFunction } from "i18next"
import { Calendar as CalendarIcon, Paperclip, Send, Trash2, Upload, X } from "lucide-react"
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { translateAdPackageType } from "../admin/advertising/AdPackageLabel"
import { buildAdItemSchema } from "../contact/order/orderSchema"

export type AssetItem = { fileUrl: string; assetType: string }

export type OrderItemValues = {
  id: string
  packageType?: string
  isActive?: boolean
  startDate: string
  endDate: string
  adLink: string
  needDesign: boolean
  existingAssets: AssetItem[]
  files: File[]
  quantity: number
}

export type OrderItemData = {
  id: string
  categoryName?: string
  packageTypeName?: string
  category: string
  price: string
  packageType?: string
  durationValue?: number | null
  durationUnit?: string | null
}

export type AdItemFormHandle = {
  validate: () => Promise<OrderItemValues | null>
}

const DEFAULT_FORM_CONFIG: AdPackageFormConfig = {
  requiresStartDate: true,
  requiresAdLink: true,
  requiresDesignService: true,
  requiresAssets: true,
}

type FormValues = Omit<OrderItemValues, "id" | "packageType">

const DEFAULT_VALUES: FormValues = {
  isActive: true,
  startDate: "",
  endDate: "",
  adLink: "",
  needDesign: false,
  existingAssets: [],
  files: [],
  quantity: 1,
}

type AdItemFormProps = {
  onSubmit?: (values: OrderItemValues) => void | Promise<void>
  orderItemData: OrderItemData
  defaultValues?: Partial<OrderItemValues>
  formConfig?: AdPackageFormConfig
  onCancel?: () => void
  submitLabel?: string
  mode?: "standalone" | "controlled"
  /** When provided, a delete button with confirm popover is shown in the header */
  onDelete?: () => void
  /** Dims the card when true (item is marked for deletion) */
  isDeleted?: boolean
  /** Return true for dates that should be disabled in the start date calendar */
  disabledDates?: (date: Date) => boolean
}

const IMAGE_EXTS = /\.(jpe?g|png|gif|webp|avif|svg)$/i

function isImageUrl(url: string): boolean {
  return IMAGE_EXTS.test(url.split("?")[0])
}

function ExistingAssetItem({ asset, onRemove }: { asset: AssetItem; onRemove: () => void }) {
  const previewUrl = isImageUrl(asset.fileUrl) ? asset.fileUrl : ""
  const label = asset.fileUrl.split("/").pop() ?? asset.fileUrl

  return (
    <li className="bg-body-bg-dark space-y-1.5 rounded p-2">
      {previewUrl && (
        <a href={previewUrl} target="_blank" rel="noreferrer">
          <img src={previewUrl} alt={label} className="h-20 w-full rounded object-cover" />
        </a>
      )}
      <div className="flex items-center gap-2">
        <Paperclip className="text-muted-foreground h-3 w-3 shrink-0" />
        <span className="text-muted-foreground min-w-0 flex-1 truncate text-xs">{label}</span>
        <button
          type="button"
          onClick={onRemove}
          className="text-muted-foreground hover:text-foreground shrink-0"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </li>
  )
}

function FilePreviewItem({ file, onRemove }: { file: File; onRemove: () => void }) {
  const previewUrl = useMemo(
    () => (file.type.startsWith("image/") ? URL.createObjectURL(file) : ""),
    [file]
  )

  return (
    <li className="bg-body-bg-dark space-y-1.5 rounded p-2">
      {previewUrl && (
        <a href={previewUrl} target="_blank" rel="noreferrer">
          <img src={previewUrl} alt={file.name} className="h-20 w-full rounded object-cover" />
        </a>
      )}
      <div className="flex items-center gap-2">
        <Paperclip className="text-muted-foreground h-3 w-3 shrink-0" />
        <span className="text-muted-foreground min-w-0 flex-1 truncate text-xs">{file.name}</span>
        <button
          type="button"
          onClick={onRemove}
          className="text-muted-foreground hover:text-foreground shrink-0"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </li>
  )
}

function runValidation(
  values: FormValues,
  formConfig: AdPackageFormConfig,
  orderItemData: OrderItemData,
  t: TFunction
): { errors: Partial<Record<keyof OrderItemValues, string>> } | { result: OrderItemValues } {
  const schema = buildAdItemSchema(formConfig)
  const result = schema.safeParse(values)
  if (!result.success) {
    const errors: Partial<Record<keyof OrderItemValues, string>> = {}
    for (const issue of result.error.issues) {
      const key = issue.path[0] as keyof OrderItemValues
      if (key && !errors[key]) errors[key] = t(issue.message, issue.message)
    }
    return { errors }
  }
  if (values.startDate && values.endDate && values.endDate < values.startDate) {
    return { errors: { endDate: t("formValidation.endDateBeforeStart") } }
  }
  return {
    result: {
      ...values,
      id: orderItemData.id,
      packageType: orderItemData.packageType,
      adLink: formConfig.requiresAdLink ? values.adLink : "",
    },
  }
}

const AdItemForm = forwardRef<AdItemFormHandle, AdItemFormProps>(function AdItemForm(
  {
    onSubmit,
    orderItemData,
    defaultValues,
    formConfig = DEFAULT_FORM_CONFIG,
    onCancel,
    submitLabel,
    mode = "standalone",
    onDelete,
    isDeleted = false,
    disabledDates,
  },
  ref
) {
  const { t, i18n } = useTranslation()
  const [openCalendar, setOpenCalendar] = useState(false)
  const [openEndCalendar, setOpenEndCalendar] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof OrderItemValues, string>>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const slotErrorRef = useRef<HTMLDivElement>(null)

  const hasDuration = !!(orderItemData.durationValue && orderItemData.durationUnit)
  const durationString =
    orderItemData.durationValue &&
    orderItemData.durationUnit &&
    `${orderItemData.durationValue} ${t(`durationUnit.${orderItemData.durationUnit}`)}`

  const initialValues: FormValues = { ...DEFAULT_VALUES, ...defaultValues }

  if (!formConfig.requiresStartDate) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const startDate = format(today, "yyyy-MM-dd")
    initialValues.startDate = startDate
  }

  const form = useForm({ defaultValues: initialValues })

  useImperativeHandle(ref, () => ({
    validate: async () => {
      const values = form.state.values
      const validation = runValidation(values, formConfig, orderItemData, t)
      if ("errors" in validation) {
        setFieldErrors(validation.errors)
        return null
      }
      setFieldErrors({})
      return validation.result
    },
  }))

  useEffect(() => {
    if (fieldErrors.startDate && slotErrorRef.current) {
      slotErrorRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, [fieldErrors.startDate])

  const formatDate = (date: Date) => {
    if (i18n.language === "zh-TW") return format(date, "yyyy年M月d日")
    if (i18n.language === "vi-VN") return format(date, "dd/MM/yyyy")
    return format(date, "MMM d, yyyy")
  }

  const firstAvailableDate = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    for (let i = 0; i < 365; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      if (!disabledDates?.(date)) return date
    }
    return today
  }, [disabledDates])

  const handleStartDateSelect = (date: Date | undefined) => {
    if (!date) return
    const startDate = format(date, "yyyy-MM-dd")
    form.setFieldValue("startDate", startDate)
    if (hasDuration) {
      form.setFieldValue(
        "endDate",
        addDurationToDateStr(startDate, orderItemData.durationValue!, orderItemData.durationUnit!)
      )
    }
    setFieldErrors((prev) => ({ ...prev, startDate: undefined }))
    setOpenCalendar(false)
  }

  const handleEndDateSelect = (date: Date | undefined) => {
    if (!date) return
    form.setFieldValue("endDate", format(date, "yyyy-MM-dd"))
    setFieldErrors((prev) => ({ ...prev, endDate: undefined }))
    setOpenEndCalendar(false)
  }

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    const values = form.state.values
    const validation = runValidation(values, formConfig, orderItemData, t)
    if ("errors" in validation) {
      setFieldErrors(validation.errors)
      return
    }
    setFieldErrors({})
    setSubmitError(null)
    try {
      await onSubmit?.(validation.result)
    } catch (err) {
      const apiErr = err as { data?: { message?: string }; message?: string }
      setSubmitError(
        apiErr?.data?.message ?? apiErr?.message ?? t("common.unknownError", "An error occurred.")
      )
    }
  }

  console.log(
    orderItemData.categoryName
      ? orderItemData.categoryName
      : t(`adCategory.${orderItemData.category}`)
  )

  const shouldShowCategory = orderItemData.category || orderItemData.categoryName

  const content = (
    <div
      className={`bg-card rounded-lg p-5 shadow-sm transition-opacity ${isDeleted ? "opacity-40" : ""}`}
    >
      <div className="border-border mb-4 flex items-center justify-between border-b pb-3">
        <div>
          {shouldShowCategory && (
            <p className="text-primary mb-1 text-xs font-medium">
              {orderItemData.categoryName
                ? orderItemData.categoryName
                : t(`adCategory.${orderItemData.category}`)}
            </p>
          )}
          <p className="text-foreground font-semibold">
            {orderItemData.packageTypeName
              ? orderItemData.packageTypeName
              : orderItemData.packageType && translateAdPackageType(t, orderItemData.packageType)}
          </p>
          {(durationString || orderItemData.price) && (
            <p className="text-muted-foreground mt-1 text-sm">
              {[durationString, orderItemData.price && `${orderItemData.price} VND`]
                .filter(Boolean)
                .join(" - ")}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {formConfig.requiresActiveToggle && (
            <form.Subscribe
              selector={(s) => s.values.isActive}
              children={(isActive) => (
                <Switch
                  checked={isActive ?? true}
                  onCheckedChange={(checked) => form.setFieldValue("isActive", checked)}
                />
              )}
            />
          )}
          {onDelete && (
            <Popover open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={`shrink-0 transition-colors ${isDeleted ? "text-muted-foreground" : "text-destructive/70 hover:text-destructive"}`}
                  title={
                    isDeleted
                      ? t("common.restore", "Restore")
                      : t("admin.advertising.deleteItem", "Remove package")
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3" align="end">
                <p className="text-foreground mb-3 text-sm font-medium">
                  {isDeleted
                    ? t("admin.advertising.restoreItemConfirm", "Restore this package?")
                    : t(
                        "admin.advertising.deleteItemConfirm",
                        "Remove this package from the order?"
                      )}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="border-border text-foreground hover:bg-muted flex-1 rounded border px-3 py-1.5 text-xs"
                    onClick={() => setDeleteConfirmOpen(false)}
                  >
                    {t("common.cancel", "Cancel")}
                  </button>
                  <button
                    type="button"
                    className={`flex-1 rounded px-3 py-1.5 text-xs text-white ${isDeleted ? "bg-primary hover:bg-primary/80" : "bg-destructive hover:bg-destructive/80"}`}
                    onClick={() => {
                      setDeleteConfirmOpen(false)
                      onDelete()
                    }}
                  >
                    {isDeleted ? t("common.restore", "Restore") : t("common.remove", "Remove")}
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      {formConfig.requiresStartDate && (
        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <form.Subscribe
            selector={(s) => ({ startDate: s.values.startDate, endDate: s.values.endDate })}
            children={({ startDate, endDate }) => (
              <>
                <Field data-invalid={!!fieldErrors.startDate || undefined}>
                  <FieldLabel>{t("adContact.startDate")} *</FieldLabel>
                  <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={`w-full justify-start bg-transparent text-left font-normal ${
                          !startDate && "text-muted-foreground"
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate
                          ? formatDate(new Date(startDate))
                          : t("adContact.selectStartDate")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="z-90 w-[280px] p-2"
                      align="start"
                      sideOffset={5}
                      collisionPadding={20}
                    >
                      <Calendar
                        key={firstAvailableDate.toISOString()}
                        mode="single"
                        selected={startDate ? new Date(startDate) : undefined}
                        onSelect={handleStartDateSelect}
                        disabled={(date) => {
                          if (date < new Date(new Date().setHours(0, 0, 0, 0))) return true
                          return disabledDates?.(date) ?? false
                        }}
                        className="w-full"
                        initialFocus
                        localeCode={i18n.language}
                        defaultMonth={firstAvailableDate}
                      />
                    </PopoverContent>
                  </Popover>
                  <div ref={slotErrorRef}>
                    <FieldError
                      errors={
                        fieldErrors.startDate ? [{ message: fieldErrors.startDate }] : undefined
                      }
                    />
                  </div>
                </Field>

                <Field data-invalid={!!fieldErrors.endDate || undefined}>
                  <FieldLabel>{t("adContact.endDate")}</FieldLabel>
                  {
                    <Popover open={openEndCalendar} onOpenChange={setOpenEndCalendar}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={`w-full justify-start bg-transparent text-left font-normal ${
                            !endDate && "text-muted-foreground"
                          }`}
                          disabled={hasDuration}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {!endDate && hasDuration
                            ? t("adContact.autoCalculated")
                            : endDate
                              ? formatDate(new Date(endDate))
                              : t("adContact.selectEndDate", "Select end date")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="z-90 w-[280px] p-2"
                        align="start"
                        sideOffset={5}
                        collisionPadding={20}
                      >
                        <Calendar
                          mode="single"
                          selected={endDate ? new Date(endDate) : undefined}
                          onSelect={handleEndDateSelect}
                          disabled={(date) => {
                            if (date < new Date(new Date().setHours(0, 0, 0, 0))) return true
                            if (startDate && date < new Date(startDate)) return true
                            return false
                          }}
                          className="w-full"
                          initialFocus
                          localeCode={i18n.language}
                          defaultMonth={startDate ? new Date(startDate) : firstAvailableDate}
                        />
                      </PopoverContent>
                    </Popover>
                  }
                  <FieldError
                    errors={fieldErrors.endDate ? [{ message: fieldErrors.endDate }] : undefined}
                  />
                </Field>
              </>
            )}
          />
        </div>
      )}

      {formConfig.requiresAdLink && (
        <form.Subscribe
          selector={(s) => s.values.adLink}
          children={(adLink) => (
            <Field className="mb-4" data-invalid={!!fieldErrors.adLink || undefined}>
              <FieldLabel>{t("adContact.adLink")}</FieldLabel>
              <Input
                type="url"
                placeholder="https://"
                value={adLink || ""}
                onChange={(e) => {
                  form.setFieldValue("adLink", e.target.value)
                  setFieldErrors((prev) => ({ ...prev, adLink: undefined }))
                }}
              />
              <FieldError
                errors={fieldErrors.adLink ? [{ message: fieldErrors.adLink }] : undefined}
              />
            </Field>
          )}
        />
      )}

      {formConfig.requiresDesignService && (
        <form.Subscribe
          selector={(s) => s.values.needDesign}
          children={(needDesign) => (
            <Field className="mb-4" orientation="horizontal">
              <Checkbox
                id={`need-design-${orderItemData.id}`}
                checked={needDesign || false}
                onCheckedChange={(checked) => form.setFieldValue("needDesign", checked as boolean)}
              />
              <FieldLabel
                htmlFor={`need-design-${orderItemData.id}`}
                className="cursor-pointer text-sm"
              >
                {t("adContact.needDesign")}
              </FieldLabel>
            </Field>
          )}
        />
      )}

      {formConfig.requiresAssets && (
        <form.Subscribe
          selector={(s) => ({ files: s.values.files, existingAssets: s.values.existingAssets })}
          children={({ files, existingAssets }) => (
            <Field data-invalid={!!fieldErrors.files || undefined}>
              <FieldLabel className="text-sm">{t("adContact.uploadAdMaterial")}</FieldLabel>
              {(existingAssets?.length > 0 || files?.length > 0) && (
                <ul className="space-y-2">
                  {existingAssets?.map((asset: AssetItem, index: number) => (
                    <ExistingAssetItem
                      key={asset.fileUrl}
                      asset={asset}
                      onRemove={() =>
                        form.setFieldValue(
                          "existingAssets",
                          existingAssets.filter((_, i) => i !== index)
                        )
                      }
                    />
                  ))}
                  {files?.map((file: File, index: number) => (
                    <FilePreviewItem
                      key={index}
                      file={file}
                      onRemove={() =>
                        form.setFieldValue(
                          "files",
                          files.filter((_, i) => i !== index)
                        )
                      }
                    />
                  ))}
                </ul>
              )}
              <button
                type="button"
                className="border-border hover:border-primary/50 flex w-full items-center justify-center gap-2 rounded border border-dashed py-2 text-xs transition-colors"
                onClick={() => {
                  const input = document.getElementById(
                    `file-input-${orderItemData.id}`
                  ) as HTMLInputElement
                  input?.click()
                }}
              >
                <Upload className="text-muted-foreground h-3.5 w-3.5" />
                <span className="text-muted-foreground">{t("adContact.clickToUpload")}</span>
              </button>
              <input
                id={`file-input-${orderItemData.id}`}
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.pdf,.ai"
                className="hidden"
                onChange={(e) => {
                  if (!e.target.files) return
                  form.setFieldValue("files", [...(files ?? []), ...Array.from(e.target.files)])
                  setFieldErrors((prev) => ({ ...prev, files: undefined }))
                }}
              />
              <FieldError
                errors={fieldErrors.files ? [{ message: fieldErrors.files }] : undefined}
              />
            </Field>
          )}
        />
      )}

      {submitError && (
        <p className="text-destructive mt-4 text-sm">{submitError}</p>
      )}

      {mode === "standalone" && (
        <div className="mt-6 flex gap-3">
          {onCancel && (
            <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
              {t("common.cancel", "Cancel")}
            </Button>
          )}
          <Button
            type="submit"
            className={`bg-header-red-dark! text-primary-foreground hover:bg-header-red-dark/80! ${onCancel ? "flex-1" : "w-full"}`}
          >
            <Send className="mr-2 h-4 w-4" />
            {submitLabel ?? t("adContact.submitOrder")}
          </Button>
        </div>
      )}
    </div>
  )

  if (mode === "controlled") {
    return <div>{content}</div>
  }

  return <form onSubmit={handleSubmit}>{content}</form>
})

export default AdItemForm
