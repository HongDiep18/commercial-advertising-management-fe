"use client"

import { useAdminOrder, useEditAdminOrder } from "@/api/ad-orders-admin/hooks"
import type {
  AdminEditOrderAssetPayload,
  AdminEditOrderItemPayload,
  AdminNewOrderItemPayload,
} from "@/api/ad-orders-admin/types"
import { useAvailableAdPackages } from "@/api/ads-pricing/hooks"
import type { PublicAdPackagePricingItem } from "@/api/ads-pricing/types"
import { uploadFiles } from "@/api/files/service"
import AdItemForm, {
  type AdItemFormHandle,
  type OrderItemData,
  type OrderItemValues,
} from "@/components/shared/AdItemForm"
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
import { Label } from "@/components/ui/Label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover"
import { VndPrice } from "@/components/VndPrice"
import { format } from "date-fns"
import { CalendarIcon, Loader2, Plus, Trash2, X } from "lucide-react"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

const POPUP_ADDON_TYPES = [
  "popup_rotation_details_link",
  "popup_priority_details_link",
  "popup_ranking_adjustment",
]
const POPUP_ADDON_NEEDS_LINK_TYPES = ["popup_rotation_details_link", "popup_priority_details_link"]

function matchesType(value: string, targets: string[]): boolean {
  return targets.includes(value.toLowerCase())
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
  const { data: order, isLoading: isLoadingOrder } = useAdminOrder(
    orderId,
    open && orderId !== null
  )
  const { data: packages } = useAvailableAdPackages()
  const { edit, isPending: isSubmitting } = useEditAdminOrder()

  const [notes, setNotes] = useState("")
  const [itemFormRefs, setItemFormRefs] = useState<
    Record<string, React.RefObject<AdItemFormHandle | null>>
  >({})
  const [addOnDrafts, setAddOnDrafts] = useState<AddOnDraft[]>([])
  const [deleteItemIds, setDeleteItemIds] = useState<string[]>([])
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [addOnErrors, setAddOnErrors] = useState<Record<number, string>>({})

  const existingPricingIds = new Set(
    order?.items.filter((i) => !deleteItemIds.includes(i.id)).map((i) => i.pricingId) ?? []
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
    const refs: Record<string, React.RefObject<AdItemFormHandle | null>> = {}
    for (const item of order.items) {
      refs[item.id] = React.createRef<AdItemFormHandle>()
    }
    setItemFormRefs(refs)
    setAddOnDrafts([])
    setDeleteItemIds([])
    setSubmitError(null)
    setAddOnErrors({})
  }, [order])

  function getAvailableOptionsForDraft(draftIdx: number): AddOnPricingOption[] {
    const otherIds = new Set(addOnDrafts.filter((_, i) => i !== draftIdx).map((d) => d.pricingId))
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
    const isViewDetailsLink = matchesType(firstAvailable.packageType, POPUP_ADDON_NEEDS_LINK_TYPES)
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
      const needsLink = matchesType(packageType, POPUP_ADDON_NEEDS_LINK_TYPES)
      const effectiveAdLinkUrl = normalizeHttpUrl(d.adLinkUrl) ?? fallbackExistingAdLinkUrl
      if (needsLink && !effectiveAdLinkUrl) {
        errors[idx] = t("admin.advertising.adLinkRequired", {
          defaultValue: "Ad Link URL is required for this package.",
        })
      }
    })
    setAddOnErrors(errors)
    if (Object.keys(errors).length > 0) return

    // Validate all items via refs
    type ItemResult = { itemId: string; values: OrderItemValues }
    const itemResults: ItemResult[] = []
    for (const item of order.items) {
      if (deleteItemIds.includes(item.id)) continue
      const ref = itemFormRefs[item.id]
      const values = await ref?.current?.validate()
      if (!values) return // validation failed — errors shown in that item's form
      itemResults.push({ itemId: item.id, values })
    }

    try {
      // Step 1: upload new files per item and collect resulting URLs
      const itemsWithUploadedUrls: Record<string, string[]> = {}
      for (const { itemId, values } of itemResults) {
        const newFiles = values.files
        if (newFiles.length === 0) {
          itemsWithUploadedUrls[itemId] = []
          continue
        }
        const result = await uploadFiles(newFiles, "ad-orders")
        const urls = result.files.map((f) => f.url)
        const invalid = urls.find((u) => !isValidHttpUrl(u))
        if (invalid !== undefined || urls.length !== newFiles.length) {
          throw new Error(t("admin.advertising.editErrorGeneric"))
        }
        itemsWithUploadedUrls[itemId] = urls
      }

      // Step 2: build items payload
      const items: AdminEditOrderItemPayload[] = itemResults.map(({ itemId, values }) => {
        const originalItem = order.items.find((i) => i.id === itemId)!
        const currentExistingUrls = new Set(values.existingAssets.map((a) => a.fileUrl))
        const assetsTouched =
          values.files.length > 0 ||
          originalItem.assets.some((a) => !currentExistingUrls.has(a.fileUrl))

        const payload: AdminEditOrderItemPayload = {
          itemId,
          adLinkUrl: values.adLink || undefined,
          startDate: values.startDate || undefined,
          designServiceRequired: values.needDesign,
        }

        if (assetsTouched) {
          const uploadedUrls = itemsWithUploadedUrls[itemId] ?? []
          let uploadIdx = 0
          payload.assets = [
            ...values.existingAssets
              .filter((a) => isValidHttpUrl(a.fileUrl))
              .map(
                (a): AdminEditOrderAssetPayload => ({ assetType: a.assetType, fileUrl: a.fileUrl })
              ),
            ...values.files.map(
              (): AdminEditOrderAssetPayload => ({
                assetType: "main_image",
                fileUrl: uploadedUrls[uploadIdx++],
              })
            ),
          ]
        }

        return payload
      })

      const newItems: AdminNewOrderItemPayload[] = addOnDrafts
        .filter((d) => d.pricingId)
        .map((d) => {
          const packageType = getDraftPackageType(d)
          const needsLink = matchesType(packageType, POPUP_ADDON_NEEDS_LINK_TYPES)
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
              <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
                {t("admin.advertising.editItems", { defaultValue: "Order Items" })}
              </p>
              <div className="space-y-3">
                {order.items.map((item) => {
                  const isMarkedForDelete = deleteItemIds.includes(item.id)

                  const orderItemData: OrderItemData = {
                    id: item.id,
                    category: item.categoryType ?? "",
                    packageType: item.packageType ?? undefined,
                    durationValue: item.durationValue ?? null,
                    durationUnit: item.durationUnit ?? null,
                    price: item.price?.toLocaleString() ?? "",
                  }

                  const defaultValues: Partial<OrderItemValues> = {
                    startDate: item.startDate ?? "",
                    adLink: item.adLinkUrl ?? "",
                    needDesign: item.designServiceRequired,
                    existingAssets: item.assets.map((a) => ({
                      fileUrl: a.fileUrl,
                      assetType: a.assetType,
                    })),
                    files: [],
                  }

                  const isAddOn = matchesType(item.packageType ?? "", POPUP_ADDON_TYPES)

                  return (
                    <AdItemForm
                      key={item.id}
                      ref={itemFormRefs[item.id]}
                      mode="controlled"
                      orderItemData={orderItemData}
                      defaultValues={defaultValues}
                      formConfig={item.formConfig}
                      isDeleted={isMarkedForDelete}
                      onDelete={
                        isAddOn
                          ? () =>
                              setDeleteItemIds((prev) =>
                                isMarkedForDelete
                                  ? prev.filter((id) => id !== item.id)
                                  : [...prev, item.id]
                              )
                          : undefined
                      }
                    />
                  )
                })}
              </div>
            </div>

            {/* Add-on packages */}
            <div>
              <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
                {t("admin.advertising.editAddOns", { defaultValue: "Add-on Packages" })}
              </p>

              {addOnDrafts.map((draft, idx) => {
                const packageType = getDraftPackageType(draft)
                const isViewDetailsLink = matchesType(packageType, POPUP_ADDON_NEEDS_LINK_TYPES)
                const isAdLinkInvalid =
                  isViewDetailsLink &&
                  draft.adLinkUrl.trim() !== "" &&
                  !isValidHttpUrl(draft.adLinkUrl)
                const adLinkRequiredError = addOnErrors[idx]
                return (
                  <div key={idx} className="mb-3 space-y-3 rounded-lg bg-white p-3 shadow-md">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium">
                        {t("admin.advertising.editAddOn", { defaultValue: "Add-on" })} #{idx + 1}
                      </p>
                      <button
                        type="button"
                        onClick={() => setAddOnDrafts((prev) => prev.filter((_, i) => i !== idx))}
                        className="text-destructive/70 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">
                        {t("admin.advertising.editAddOnPackage", {
                          defaultValue: "Package / Pricing",
                        })}
                      </Label>
                      <select
                        className="border-input bg-background text-foreground focus:ring-primary h-9 w-full rounded-md border px-2 text-xs focus:ring-1 focus:outline-none"
                        value={draft.pricingId}
                        onChange={(e) => {
                          const selected = getAvailableOptionsForDraft(idx).find(
                            (o) => o.pricingId === e.target.value
                          )
                          const isSelectedViewDetailsLink = matchesType(
                            selected?.packageType ?? "",
                            POPUP_ADDON_NEEDS_LINK_TYPES
                          )
                          updateAddOn(idx, {
                            pricingId: e.target.value,
                            packageType: selected?.packageType ?? "",
                            adLinkUrl: isSelectedViewDetailsLink
                              ? (fallbackExistingAdLinkUrl ?? "")
                              : "",
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
                            if (addOnErrors[idx])
                              setAddOnErrors((prev) => {
                                const next = { ...prev }
                                delete next[idx]
                                return next
                              })
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
                      {t("admin.advertising.estimatedAmount")}:{" "}
                      <VndPrice value={order.totalAmount - deletedTotal} />
                      {addOnTotal > 0 && (
                        <>
                          {" + "}
                          <VndPrice value={addOnTotal} /> {t("admin.advertising.addOnsSuffix")}
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
