"use client"

import { useAdminOrder, useEditAdminOrder } from "@/api/ad-orders-admin/hooks"
import type {
  AdminNewOrderItemPayload,
  AdminEditOrderAssetPayload,
  AdminEditOrderItemPayload,
} from "@/api/ad-orders-admin/types"
import { useAvailableAdPackages } from "@/api/ads-pricing/hooks"
import type { PublicAdPackagePricingItem } from "@/api/ads-pricing/types"
import { uploadFiles } from "@/api/files/service"
import { AdPackageLabel } from "@/components/admin/advertising/AdPackageLabel"
import { VndPrice } from "@/components/VndPrice"
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
import { format } from "date-fns"
import { addDuration } from "@/data/contactMockData"
import { CalendarIcon, Loader2, Paperclip, Plus, Trash2, Upload, X } from "lucide-react"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

const POPUP_BASE_TYPES = ["popup_priority_slot", "popup_rotation_slot"]
const POPUP_ADDON_TYPES = ["popup_view_details_link", "popup_ranking_adjustment"]

function matchesType(value: string, targets: string[]): boolean {
  return targets.includes(value.toLowerCase())
}

type AssetEntry =
  | { kind: "existing"; fileUrl: string; assetType: string }
  | { kind: "new"; file: File; assetType: string; previewUrl: string }

const IMAGE_EXTS = /\.(jpe?g|png|gif|webp|avif|svg)$/i
function isImageUrl(url: string): boolean {
  return IMAGE_EXTS.test(url.split("?")[0])
}

type ItemEditState = {
  adLinkUrl: string
  startDate: Date | undefined
  startCalOpen: boolean
  designServiceRequired: boolean
  assetsTouched: boolean
  assets: AssetEntry[]
}

type AddOnDraft = {
  pricingId: string
  packageType: string
  startDate: Date | undefined
  calOpen: boolean
  adLinkUrl: string
}

type AddOnPricingOption = {
  pricingId: string
  packageType: string
  packageName: string
  label: string
  pricing: PublicAdPackagePricingItem
}

function formatDateDisplay(date: Date, lang: string): string {
  if (lang === "zh-TW") return format(date, "yyyy年M月d日")
  if (lang === "vi-VN") return format(date, "dd/MM/yyyy")
  return format(date, "MMM d, yyyy")
}

function getTodayStart(): Date {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

function isValidHttpUrl(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed) return false
  try {
    const url = new URL(trimmed)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

function normalizeHttpUrl(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  try {
    const url = new URL(trimmed)
    if (url.protocol !== "http:" && url.protocol !== "https:") return null
    return url.toString()
  } catch {
    return null
  }
}

type AdOrderEditDialogProps = {
  orderId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AdOrderEditDialog({
  orderId,
  open,
  onOpenChange,
  onSuccess,
}: AdOrderEditDialogProps) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const { data: order, isLoading: isLoadingOrder } = useAdminOrder(orderId, open && orderId !== null)
  const { data: packages } = useAvailableAdPackages()
  const { edit, isPending: isSubmitting } = useEditAdminOrder()

  const [notes, setNotes] = useState("")
  const [itemStates, setItemStates] = useState<Record<string, ItemEditState>>({})
  const [addOnDrafts, setAddOnDrafts] = useState<AddOnDraft[]>([])
  const [deleteItemIds, setDeleteItemIds] = useState<string[]>([])
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [addOnErrors, setAddOnErrors] = useState<Record<number, string>>({})

  const existingPricingIds = new Set(
    order?.items
      .filter((i) => !deleteItemIds.includes(i.id))
      .map((i) => i.pricingId) ?? []
  )

  const addonPricingOptions: AddOnPricingOption[] = (packages ?? []).flatMap((cat) => {
    if (!matchesType(cat.type, ["homepage_popup"])) return []
    return cat.packages
      .filter((pkg) => matchesType(pkg.type, POPUP_ADDON_TYPES))
      .flatMap((pkg) =>
        pkg.pricing
          .filter((p) => p.isActive && !existingPricingIds.has(p.id))
          .map((p) => ({
            pricingId: p.id,
            packageType: pkg.type,
            packageName: pkg.name,
            label: p.durationValue
              ? `${pkg.name} — ${p.durationValue} ${p.durationUnit ?? ""} · ${p.finalPrice.toLocaleString()} ₫`
              : `${pkg.name} · ${p.finalPrice.toLocaleString()} ₫`,
            pricing: p,
          }))
      )
  })

  useEffect(() => {
    if (!order) return
    setNotes(order.notes ?? "")
    const states: Record<string, ItemEditState> = {}
    for (const item of order.items) {
      states[item.id] = {
        adLinkUrl: item.adLinkUrl ?? "",
        startDate: item.startDate ? new Date(item.startDate) : undefined,
        startCalOpen: false,
        designServiceRequired: item.designServiceRequired,
        assetsTouched: false,
        assets: item.assets.map((a) => ({
          kind: "existing" as const,
          assetType: a.assetType,
          fileUrl: a.fileUrl,
        })),
      }
    }
    setItemStates(states)
    setAddOnDrafts([])
    setDeleteItemIds([])
    setSubmitError(null)
    setAddOnErrors({})
  }, [order])

  const hasPopupBase =
    order?.items.some((item) => matchesType(item.packageType ?? "", POPUP_BASE_TYPES)) ?? false

  function updateItem(itemId: string, patch: Partial<ItemEditState>) {
    setItemStates((prev) => ({ ...prev, [itemId]: { ...prev[itemId], ...patch } }))
  }

  function addFiles(itemId: string, files: FileList | null) {
    if (!files || files.length === 0) return
    const newEntries: AssetEntry[] = Array.from(files).map((file) => ({
      kind: "new" as const,
      file,
      assetType: "main_image",
      previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : "",
    }))
    const state = itemStates[itemId]
    updateItem(itemId, {
      assetsTouched: true,
      assets: [...state.assets, ...newEntries],
    })
  }

  function removeAsset(itemId: string, idx: number) {
    const state = itemStates[itemId]
    updateItem(itemId, {
      assetsTouched: true,
      assets: state.assets.filter((_, i) => i !== idx),
    })
  }

  function getAvailableOptionsForDraft(draftIdx: number): AddOnPricingOption[] {
    const otherIds = new Set(
      addOnDrafts.filter((_, i) => i !== draftIdx).map((d) => d.pricingId)
    )
    return addonPricingOptions.filter((opt) => !otherIds.has(opt.pricingId))
  }

  const canAddMoreAddOns = addOnDrafts.length < addonPricingOptions.length

  const fallbackExistingAdLinkUrl =
    order?.items
      .filter((item) => !deleteItemIds.includes(item.id))
      .map((item) => normalizeHttpUrl(item.adLinkUrl ?? ""))
      .find((url) => url !== null) ?? null

  function getAddOnOptionByPricingId(pricingId: string): AddOnPricingOption | undefined {
    return addonPricingOptions.find((opt) => opt.pricingId === pricingId)
  }

  function getDraftPackageType(draft: AddOnDraft): string {
    return draft.packageType || getAddOnOptionByPricingId(draft.pricingId)?.packageType || ""
  }

  function addAddOnDraft() {
    if (!canAddMoreAddOns) return
    const usedIds = new Set(addOnDrafts.map((d) => d.pricingId))
    const firstAvailable = addonPricingOptions.find((opt) => !usedIds.has(opt.pricingId))
    if (!firstAvailable) return
    const isViewDetailsLink = matchesType(firstAvailable.packageType, ["popup_view_details_link"])
    setAddOnDrafts((prev) => [
      ...prev,
      {
        pricingId: firstAvailable.pricingId,
        packageType: firstAvailable.packageType,
        startDate: getTodayStart(),
        calOpen: false,
        adLinkUrl: isViewDetailsLink ? (fallbackExistingAdLinkUrl ?? "") : "",
      },
    ])
  }

  function updateAddOn(idx: number, patch: Partial<AddOnDraft>) {
    setAddOnDrafts((prev) => prev.map((d, i) => (i === idx ? { ...d, ...patch } : d)))
  }

  async function handleSubmit() {
    if (!order) return
    setSubmitError(null)

    // Validate add-on drafts
    const errors: Record<number, string> = {}
    addOnDrafts.forEach((d, idx) => {
      const packageType = getDraftPackageType(d)
      const needsLink = matchesType(packageType, ["popup_view_details_link"])
      const effectiveAdLinkUrl = normalizeHttpUrl(d.adLinkUrl) ?? fallbackExistingAdLinkUrl
      if (needsLink && !effectiveAdLinkUrl) {
        errors[idx] = t("admin.advertising.adLinkRequired", { defaultValue: "Ad Link URL is required for this package." })
      }
    })
    setAddOnErrors(errors)
    if (Object.keys(errors).length > 0) return

    try {
      // Step 1: upload new files per item and collect resulting URLs
      const itemsWithUploadedUrls: Record<string, string[]> = {}
      for (const item of order.items) {
        const s = itemStates[item.id]
        if (!s.assetsTouched) continue
        const newFiles = s.assets
          .filter((a): a is Extract<AssetEntry, { kind: "new" }> => a.kind === "new")
          .map((a) => a.file)
        if (newFiles.length === 0) {
          itemsWithUploadedUrls[item.id] = []
          continue
        }
        const result = await uploadFiles(newFiles, "ad-orders")
        const urls = result.files.map((f) => f.url)
        // Validate that the server returned valid HTTP URLs for every uploaded file
        const invalid = urls.find((u) => !isValidHttpUrl(u))
        if (invalid !== undefined || urls.length !== newFiles.length) {
          throw new Error(t("admin.advertising.editErrorGeneric"))
        }
        itemsWithUploadedUrls[item.id] = urls
      }

      // Step 2: build items payload using the uploaded URLs
      const items: AdminEditOrderItemPayload[] = order.items
        .filter((item) => !deleteItemIds.includes(item.id))
        .map((item) => {
        const s = itemStates[item.id]
        const payload: AdminEditOrderItemPayload = {
          itemId: item.id,
          adLinkUrl: s.adLinkUrl || undefined,
          startDate: s.startDate ? format(s.startDate, "yyyy-MM-dd") : undefined,
          designServiceRequired: s.designServiceRequired,
        }
        if (s.assetsTouched) {
          let uploadIdx = 0
          const uploadedUrls = itemsWithUploadedUrls[item.id] ?? []
          payload.assets = s.assets
            .map((a): AdminEditOrderAssetPayload | null => {
              if (a.kind === "existing") {
                // Only re-send existing assets that have a valid HTTP URL.
                // Non-HTTP values (relative paths, storage keys) are skipped
                // because the BE validator requires full URLs.
                return isValidHttpUrl(a.fileUrl)
                  ? { assetType: a.assetType, fileUrl: a.fileUrl }
                  : null
              }
              // New assets: URL was validated after upload
              return { assetType: a.assetType, fileUrl: uploadedUrls[uploadIdx++] }
            })
            .filter((a): a is AdminEditOrderAssetPayload => a !== null)
        }
        return payload
      })

      const newItems: AdminNewOrderItemPayload[] = addOnDrafts
        .filter((d) => d.pricingId)
        .map((d) => {
          const packageType = getDraftPackageType(d)
          const needsLink = matchesType(packageType, ["popup_view_details_link"])
          const effectiveAdLinkUrl = normalizeHttpUrl(d.adLinkUrl) ?? fallbackExistingAdLinkUrl
          const startDate = d.startDate ?? getTodayStart()
          return {
            pricingId: d.pricingId,
            startDate: format(startDate, "yyyy-MM-dd"),
            designServiceRequired: false,
            ...(needsLink && effectiveAdLinkUrl ? { adLinkUrl: effectiveAdLinkUrl } : {}),
          }
        })

      await edit({
        id: order.id,
        payload: {
          notes: notes.trim() || undefined,
          items,
          newItems: newItems.length > 0 ? newItems : undefined,
          deleteItemIds: deleteItemIds.length > 0 ? deleteItemIds : undefined,
        },
      })
      onSuccess()
      onOpenChange(false)
    } catch (err) {
      const apiErr = err as { data?: { code?: string; message?: string } }
      const code = apiErr?.data?.code
      if (code) {
        setSubmitError(
          t(`admin.advertising.editError.${code}`, {
            defaultValue: apiErr.data?.message ?? t("admin.advertising.editErrorGeneric"),
          })
        )
      } else {
        setSubmitError(t("admin.advertising.editErrorGeneric"))
      }
    }
  }

  const displayName = order
    ? (order.company?.nameVi ?? order.company?.nameCn ?? order.user.email)
    : ""

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-body-bg-dark relative flex max-h-[90vh] max-w-2xl flex-col overflow-hidden p-0">
        <div className="bg-body-bg-dark sticky top-0 z-10 border-b px-5 py-2.5 pr-12">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground absolute top-2 right-2 h-7 w-7"
            onClick={() => onOpenChange(false)}
            aria-label={t("admin.advertising.closeDialog")}
          >
            <X className="h-4 w-4" />
          </Button>

          <DialogHeader className="gap-0.5">
            <DialogTitle>
              {t("admin.advertising.editOrderTitle", { defaultValue: "Edit Order" })}
            </DialogTitle>
            <DialogDescription>{displayName}</DialogDescription>
          </DialogHeader>
        </div>

        {isLoadingOrder ? (
          <div className="flex items-center justify-center px-6 py-10">
            <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
          </div>
        ) : !order ? null : (
          <div className="mt-2 flex-1 space-y-4 overflow-y-auto px-5 pb-5">

            {/* Notes */}
            <div className="space-y-1">
              <Label className="text-xs">
                {t("admin.advertising.editNotes", { defaultValue: "Notes" })}
              </Label>
              <textarea
                className="border-border bg-background text-foreground focus:ring-primary h-9 w-full rounded-md border px-2 py-1.5 text-xs focus:ring-1 focus:outline-none"
                rows={2}
                maxLength={2000}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("admin.advertising.editNotesPlaceholder", {
                  defaultValue: "Optional notes (max 2000 chars)",
                })}
              />
            </div>

            {/* Items */}
            <div>
              <p className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">
                {t("admin.advertising.editItems", { defaultValue: "Order Items" })}
              </p>
              <div className="space-y-3">
                {order.items.map((item) => {
                  const s = itemStates[item.id]
                  if (!s) return null
                  const isAdLinkInvalid = s.adLinkUrl.trim() !== "" && !isValidHttpUrl(s.adLinkUrl)
                  const isAddOn = matchesType(item.packageType ?? "", POPUP_ADDON_TYPES)
                  const isMarkedForDelete = deleteItemIds.includes(item.id)
                  return (
                    <div
                      key={item.id}
                      className={`space-y-3 rounded-lg bg-white p-3 shadow-md transition-opacity ${isMarkedForDelete ? "opacity-40" : ""}`}
                    >
                      {/* Package header */}
                      <div className="flex items-center gap-2">
                        <TextColorBadge colorKey={item.packageType} className="text-xs">
                          <AdPackageLabel
                            packageType={item.packageType}
                            packageMetadata={item.packageMetadata}
                            fallbackLabel={item.packageType}
                          />
                        </TextColorBadge>
                        <span className="text-muted-foreground min-w-0 flex-1 truncate text-xs">
                          <AdPackageLabel
                            packageType={item.packageType}
                            packageMetadata={item.packageMetadata}
                            fallbackLabel={item.packageName}
                          />
                        </span>
                        {isAddOn && (
                          <button
                            type="button"
                            title={t("admin.advertising.deleteItem", { defaultValue: "Remove package" })}
                            onClick={() =>
                              setDeleteItemIds((prev) =>
                                isMarkedForDelete
                                  ? prev.filter((id) => id !== item.id)
                                  : [...prev, item.id]
                              )
                            }
                            className={`shrink-0 transition-colors ${isMarkedForDelete ? "text-muted-foreground" : "text-destructive/70 hover:text-destructive"}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      {/* Start date */}
                      <div className="space-y-1">
                        <Label className="text-xs">{t("admin.advertising.startTime")}</Label>
                        <Popover
                          open={s.startCalOpen}
                          onOpenChange={(v) => updateItem(item.id, { startCalOpen: v })}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              className="h-8 w-full justify-start bg-transparent px-2 text-left text-xs font-normal"
                            >
                              <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                              {s.startDate ? formatDateDisplay(s.startDate, lang) : "—"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="z-90 w-[280px] p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={s.startDate}
                              onSelect={(d) => updateItem(item.id, { startDate: d, startCalOpen: false })}
                              className="w-full"
                              initialFocus
                              localeCode={lang}
                            />
                          </PopoverContent>
                        </Popover>
                        {s.startDate && item.durationValue && item.durationUnit && (
                          <p className="text-muted-foreground text-xs">
                            {t("admin.advertising.endTime")}:{" "}
                            {formatDateDisplay(
                              addDuration(s.startDate, item.durationValue, item.durationUnit),
                              lang
                            )}
                          </p>
                        )}
                      </div>

                      {/* Ad link URL */}
                      <div className="space-y-1">
                        <Label className="text-xs">
                          {t("admin.advertising.editAdLink", { defaultValue: "Ad Link URL" })}
                        </Label>
                        <Input
                          type="url"
                          placeholder="https://"
                          className={`h-8 text-xs ${isAdLinkInvalid ? "border-red-500" : ""}`}
                          value={s.adLinkUrl}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            updateItem(item.id, { adLinkUrl: e.target.value })
                          }
                        />
                        {isAdLinkInvalid && (
                          <p className="text-destructive text-xs">
                            {t("admin.activeAds.createUrlError")}
                          </p>
                        )}
                      </div>

                      {/* Design service toggle */}
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">{t("admin.advertising.designService")}</Label>
                        <button
                          type="button"
                          onClick={() =>
                            updateItem(item.id, {
                              designServiceRequired: !s.designServiceRequired,
                            })
                          }
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                            s.designServiceRequired ? "bg-green-600" : "bg-muted"
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                              s.designServiceRequired ? "translate-x-4" : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      </div>

                      {/* Assets */}
                      <div className="space-y-1">
                        <Label className="text-xs">
                          {t("admin.advertising.assets")}
                          {s.assetsTouched && (
                            <span className="text-amber-500 ml-1 font-normal">
                              {t("admin.advertising.editAssetsModified", { defaultValue: "(modified)" })}
                            </span>
                          )}
                        </Label>

                        {s.assets.length > 0 && (
                          <ul className="space-y-2">
                            {s.assets.map((asset, idx) => {
                              const previewUrl =
                                asset.kind === "existing" && isImageUrl(asset.fileUrl)
                                  ? asset.fileUrl
                                  : asset.kind === "new"
                                    ? asset.previewUrl
                                    : ""
                              const label =
                                asset.kind === "existing"
                                  ? (asset.fileUrl.split("/").pop() || asset.fileUrl)
                                  : asset.file.name
                              return (
                                <li key={idx} className="bg-body-bg-dark space-y-1.5 rounded p-2">
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
                                      onClick={() => removeAsset(item.id, idx)}
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

                        {s.assetsTouched && s.assets.length === 0 && (
                          <p className="text-muted-foreground text-xs">
                            {t("admin.advertising.editNoAssets", { defaultValue: "No assets — existing will be cleared" })}
                          </p>
                        )}

                        <button
                          type="button"
                          className="border-border hover:border-primary/50 flex w-full items-center justify-center gap-2 rounded border border-dashed py-2 text-xs transition-colors"
                          onClick={() =>
                            (document.getElementById(`asset-upload-${item.id}`) as HTMLInputElement)?.click()
                          }
                        >
                          <Upload className="text-muted-foreground h-3.5 w-3.5" />
                          <span className="text-muted-foreground">
                            {t("adContact.clickToUpload", { defaultValue: "Click to upload file" })}
                          </span>
                        </button>
                        <input
                          id={`asset-upload-${item.id}`}
                          type="file"
                          multiple
                          accept=".jpg,.jpeg,.png,.pdf,.ai"
                          className="hidden"
                          onChange={(e) => addFiles(item.id, e.target.files)}
                        />

                        {!s.assetsTouched && item.assets.length > 0 && (
                          <button
                            type="button"
                            onClick={() => updateItem(item.id, { assetsTouched: true, assets: [] })}
                            className="text-destructive flex items-center gap-1 text-xs hover:opacity-70"
                          >
                            <Trash2 className="h-3 w-3" />
                            {t("admin.advertising.editClearAssets", { defaultValue: "Clear all assets" })}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Add-on packages */}
            {hasPopupBase && (
              <div>
                <p className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">
                  {t("admin.advertising.editAddOns", { defaultValue: "Add-on Packages" })}
                </p>

                {addOnDrafts.map((draft, idx) => {
                  const packageType = getDraftPackageType(draft)
                  const isViewDetailsLink = matchesType(packageType, ["popup_view_details_link"])
                  const isAdLinkInvalid = isViewDetailsLink && draft.adLinkUrl.trim() !== "" && !isValidHttpUrl(draft.adLinkUrl)
                  const adLinkRequiredError = addOnErrors[idx]
                  return (
                    <div key={idx} className="mb-3 space-y-3 rounded-lg bg-white p-3 shadow-md">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium">
                          {t("admin.advertising.editAddOn", { defaultValue: "Add-on" })} #{idx + 1}
                        </p>
                        <button
                          type="button"
                          onClick={() =>
                            setAddOnDrafts((prev) => prev.filter((_, i) => i !== idx))
                          }
                          className="text-destructive/70 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">
                          {t("admin.advertising.editAddOnPackage", { defaultValue: "Package / Pricing" })}
                        </Label>
                        <select
                          className="border-input bg-background text-foreground focus:ring-primary h-9 w-full rounded-md border px-2 text-xs focus:ring-1 focus:outline-none"
                          value={draft.pricingId}
                          onChange={(e) => {
                            const selected = getAvailableOptionsForDraft(idx).find(o => o.pricingId === e.target.value)
                            const isSelectedViewDetailsLink = matchesType(selected?.packageType ?? "", ["popup_view_details_link"])
                            updateAddOn(idx, {
                              pricingId: e.target.value,
                              packageType: selected?.packageType ?? "",
                              adLinkUrl: isSelectedViewDetailsLink ? (fallbackExistingAdLinkUrl ?? "") : "",
                            })
                          }}
                        >
                          {getAvailableOptionsForDraft(idx).map((opt) => (
                            <option key={opt.pricingId} value={opt.pricingId}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">{t("admin.advertising.startTime")}</Label>
                        <Popover
                          open={draft.calOpen}
                          onOpenChange={(v) => updateAddOn(idx, { calOpen: v })}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              className="h-8 w-full justify-start bg-transparent px-2 text-left text-xs font-normal"
                            >
                              <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                              {draft.startDate ? formatDateDisplay(draft.startDate, lang) : "—"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="z-90 w-[280px] p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={draft.startDate}
                              onSelect={(d) => updateAddOn(idx, { startDate: d, calOpen: false })}
                              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                              className="w-full"
                              initialFocus
                              localeCode={lang}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      {isViewDetailsLink && (
                        <div className="space-y-1">
                          <Label className="text-xs">
                            {t("admin.advertising.editAdLink", { defaultValue: "Ad Link URL" })}
                          </Label>
                          <Input
                            type="url"
                            placeholder="https://"
                            className={`h-8 text-xs ${isAdLinkInvalid || adLinkRequiredError ? "border-red-500" : ""}`}
                            value={draft.adLinkUrl}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              updateAddOn(idx, { adLinkUrl: e.target.value })
                              if (addOnErrors[idx]) setAddOnErrors((prev) => { const next = { ...prev }; delete next[idx]; return next })
                            }}
                          />
                          {isAdLinkInvalid && (
                            <p className="text-destructive text-xs">
                              {t("admin.activeAds.createUrlError")}
                            </p>
                          )}
                          {!isAdLinkInvalid && adLinkRequiredError && (
                            <p className="text-destructive text-xs">{adLinkRequiredError}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAddOnDraft}
                  disabled={!canAddMoreAddOns}
                  className="h-8 text-xs"
                >
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  {t("admin.advertising.editAddAddOn", { defaultValue: "Add add-on" })}
                </Button>
              </div>
            )}

            {/* Estimated amount */}
            {(() => {
              const addOnTotal = addOnDrafts.reduce((sum, draft) => {
                const opt = addonPricingOptions.find((o) => o.pricingId === draft.pricingId)
                return sum + (opt?.pricing.finalPrice ?? 0)
              }, 0)
              const deletedTotal = order.items
                .filter((item) => deleteItemIds.includes(item.id))
                .reduce((sum, item) => sum + item.price, 0)
              const total = (order.totalAmount ?? 0) - deletedTotal + addOnTotal
              return (
                <div className="bg-primary/5 rounded-lg p-4">
                  <p className="text-muted-foreground text-sm">
                    {t("admin.advertising.estimatedAmount")}
                  </p>
                  <p className="text-xl font-bold">
                    <VndPrice value={total} />
                  </p>
                  {(addOnTotal > 0 || deletedTotal > 0) && (
                    <p className="text-muted-foreground mt-1 text-xs">
                      {t("admin.advertising.estimatedAmount")}: <VndPrice value={order.totalAmount - deletedTotal} />
                      {addOnTotal > 0 && (
                        <>
                          {" + "}
                          <VndPrice value={addOnTotal} />
                          {" "}{t("admin.advertising.addOnsSuffix")}
                        </>
                      )}
                    </p>
                  )}
                </div>
              )
            })()}

            {/* Error */}
            {submitError && <p className="text-destructive text-sm">{submitError}</p>}

            {/* Actions */}
            <div className="flex gap-2 border-t pt-3">
              <Button
                variant="outline"
                className="flex-1 border-gray-500"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                {t("common.cancel", { defaultValue: "Cancel" })}
              </Button>
              <Button
                variant="primary"
                className="bg-primary flex-1"
                onClick={() => void handleSubmit()}
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? t("common.saving", { defaultValue: "Saving..." })
                  : t("admin.advertising.editSave", { defaultValue: "Save Changes" })}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
