"use client"

import { format } from "date-fns"
import { useAddOnActiveAd } from "@/api/ad-orders-admin/hooks"
import { useAvailableAdPackages } from "@/api/ads-pricing/hooks"
import type { PublicAdPackageItem, PublicAdPackagePricingItem } from "@/api/ads-pricing/types"
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
import { VndPrice } from "@/components/VndPrice"
import { Calendar as CalendarIcon, X } from "lucide-react"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

type Props = {
  orderId: string
  existingAddOnTypes: string[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (newTotalAmount: number) => void
}

type FlatPricing = {
  pricingId: string
  packageName: string
  packageType: string
  label: string
  finalPrice: number
}

function buildPricingLabel(pkg: PublicAdPackageItem, p: PublicAdPackagePricingItem): string {
  if (p.durationValue && p.durationUnit) {
    return `${p.durationValue} ${p.durationUnit}`
  }
  return "One-time"
}

const ADDON_PACKAGE_TYPES = ["POPUP_VIEW_DETAILS_LINK", "POPUP_RANKING_ADJUSTMENT"] as const
const VIEW_DETAILS_TYPE = "POPUP_VIEW_DETAILS_LINK"

export function AdOrderAddOnDialog({
  orderId,
  existingAddOnTypes,
  open,
  onOpenChange,
  onSuccess,
}: Props) {
  const { t, i18n } = useTranslation()
  const { data: catalog, isLoading: isCatalogLoading } = useAvailableAdPackages()
  const { addOn, isPending } = useAddOnActiveAd()

  const [pricingId, setPricingId] = useState("")
  const [startDate, setStartDate] = useState("")
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [detailsPageUrl, setDetailsPageUrl] = useState("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    if (open) {
      setPricingId("")
      setStartDate("")
      setIsCalendarOpen(false)
      setDetailsPageUrl("")
      setNotes("")
    }
  }, [open])

  const usedAddOnTypes = new Set(existingAddOnTypes.map((type) => type.toUpperCase()))

  // Only show add-on package types (popup view details link & ranking adjustment)
  const flatPricings: FlatPricing[] = (catalog ?? []).flatMap((cat) =>
    cat.packages
      .filter(
        (pkg) =>
          (ADDON_PACKAGE_TYPES as readonly string[]).includes(pkg.type) &&
          !usedAddOnTypes.has(pkg.type.toUpperCase())
      )
      .flatMap((pkg) =>
        pkg.pricing
          .filter((p) => p.isActive)
          .map((p) => ({
            pricingId: p.id,
            packageName: pkg.name,
            packageType: pkg.type,
            label: buildPricingLabel(pkg, p),
            finalPrice: p.finalPrice,
          }))
      )
  )

  const selectedPricing = flatPricings.find((p) => p.pricingId === pricingId)
  const needsDetailsUrl = selectedPricing?.packageType === VIEW_DETAILS_TYPE

  const isValidUrl = (val: string) => {
    try { return Boolean(new URL(val)) } catch { return false }
  }
  const formatDateLabel = (date: Date) => {
    if (i18n.language === "zh-TW") return format(date, "yyyy年M月d日")
    if (i18n.language === "vi-VN") return format(date, "dd/MM/yyyy")
    return format(date, "MMM d, yyyy")
  }
  const detailsUrlError = needsDetailsUrl && detailsPageUrl.trim() !== "" && !isValidUrl(detailsPageUrl.trim())
  const canSubmit =
    pricingId !== "" &&
    startDate !== "" &&
    (!needsDetailsUrl || (detailsPageUrl.trim() !== "" && !detailsUrlError))

  const handleSubmit = async () => {
    if (!canSubmit) return
    const result = await addOn({
      orderId,
      body: {
        pricingId,
        startDate: new Date(startDate).toISOString(),
        ...(detailsPageUrl.trim() ? { detailsPageUrl: detailsPageUrl.trim() } : {}),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      },
    })
    onSuccess?.(result.newTotalAmount)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-body-bg-dark max-w-lg px-6 py-6">
        <button
          onClick={() => onOpenChange(false)}
          className="text-muted-foreground hover:text-foreground absolute top-3 right-3 rounded p-1"
        >
          <X className="h-4 w-4" />
        </button>

        <DialogHeader className="border-0 p-0 pb-2">
          <DialogTitle className="text-base">
            {t("admin.advertising.addOnTitle") || "Add-on"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {t("admin.advertising.addOnDesc") || "Add a View Details Link or Ranking Adjustment to this order."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Package / Pricing selector */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              {t("admin.advertising.addOnPackage") || "Package"}
            </Label>
            {isCatalogLoading ? (
              <p className="text-muted-foreground text-xs">
                {t("admin.advertising.loadingOrders") || "Loading..."}
              </p>
            ) : flatPricings.length === 0 ? (
              <p className="text-muted-foreground text-xs">
                {t("admin.advertising.addOnLimitReached") ||
                  "All one-time add-on packages have already been added to this order."}
              </p>
            ) : (
              <select
                value={pricingId}
                onChange={(e) => {
                  setPricingId(e.target.value)
                  setDetailsPageUrl("")
                }}
                className="border-input bg-background text-foreground focus:ring-primary w-full rounded-lg border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
              >
                <option value="">
                  {t("admin.advertising.addOnSelectPackage") || "Select a package..."}
                </option>
                {flatPricings.map((p) => (
                  <option key={p.pricingId} value={p.pricingId}>
                    {p.packageName} — {p.label}
                  </option>
                ))}
              </select>
            )}
            {selectedPricing && (
              <p className="text-muted-foreground text-xs">
                <VndPrice value={selectedPricing.finalPrice} />
              </p>
            )}
          </div>

          {/* Start date */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              {t("admin.advertising.addOnStartDate") || "Start date"}
            </Label>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
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
                    ? formatDateLabel(new Date(startDate))
                    : t("adContact.selectStartDate")}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="z-[90] w-[280px] p-0"
                align="start"
                sideOffset={6}
                collisionPadding={20}
              >
                <Calendar
                  mode="single"
                  selected={startDate ? new Date(startDate) : undefined}
                  onSelect={(date) => {
                    if (!date) return
                    setStartDate(date.toISOString())
                    setIsCalendarOpen(false)
                  }}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  className="w-full p-3"
                  initialFocus
                  localeCode={i18n.language}
                  defaultMonth={startDate ? new Date(startDate) : new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Details page URL — only for POPUP_VIEW_DETAILS_LINK */}
          {needsDetailsUrl && (
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                {t("admin.advertising.addOnDetailsPageUrl") || "Details page URL"}
                <span className="ml-1 text-red-500">*</span>
              </Label>
              <Input
                type="url"
                value={detailsPageUrl}
                onChange={(e) => setDetailsPageUrl(e.target.value)}
                placeholder="https://vnbuyerguide.com/companies/..."
                className={`text-sm ${detailsUrlError ? "border-red-500 focus:ring-red-500" : ""}`}
              />
              {detailsUrlError && (
                <p className="text-xs text-red-500">
                  {t("admin.advertising.addOnDetailsPageUrlError") || "Please enter a valid URL (e.g. https://...)"}
                </p>
              )}
            </div>
          )}

          {/* Notes (optional) */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              {t("admin.advertising.addOnNotes") || "Notes"}
              <span className="text-muted-foreground ml-1 font-normal">
                ({t("common.optional") || "optional"})
              </span>
            </Label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-primary w-full rounded-lg border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
              placeholder={t("admin.advertising.addOnNotesPlaceholder") || "Internal notes..."}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            {t("common.cancel") || "Cancel"}
          </Button>
          <Button
            variant="primary"
            disabled={!canSubmit || isPending}
            onClick={() => void handleSubmit()}
          >
            {isPending
              ? t("common.saving") || "Saving..."
              : t("admin.advertising.addOnSubmit") || "Add add-on"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
