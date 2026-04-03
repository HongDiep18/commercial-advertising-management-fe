"use client"

import type { UiAdItemDetails, UiSelectedAdItem } from "@/api/ad-orders/builders"
import { buildCreateAdOrderInput } from "@/api/ad-orders/builders"
import { hasOverlapWithExistingOrders, type NewOrderItem } from "@/api/ad-orders/overlap"
import { type AdOrderAssetToUpload, getMyPendingOrderItems } from "@/api/ad-orders/service"
import type { AdPackageFormConfig } from "@/api/ads-pricing/types"
import { getProfile } from "@/api/profile"
import AdItemForm, {
  type AdItemFormHandle,
  type OrderItemData,
} from "@/components/shared/AdItemForm"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import Textarea from "@/components/ui/Textarea"
import { useUser } from "@/contexts/user-context"
import type { CreateAdOrderInput } from "@/types/types"
import { isValidPhone } from "@/utils/validation/phone"
import { useQueryClient } from "@tanstack/react-query"
import { Send, X } from "lucide-react"
import React, { useEffect, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

type OrderForm = {
  company: string
  contact: string
  phone: string
  email: string
  notes: string
}

type SelectedItem = {
  id: string
  name: string
  category: string
  duration?: string
  price: string
  quantity?: number
  packageType?: string
  durationValue?: number | null
  durationUnit?: string | null
  formConfig?: AdPackageFormConfig
}

type OrderModalProps = {
  isOpen: boolean
  onClose: () => void
  selectedItems: SelectedItem[]
  companyId?: string | null
  onSubmit: (
    input: CreateAdOrderInput,
    meta: { subtotal: string; assets: AdOrderAssetToUpload[] }
  ) => void | Promise<void>
  onQuantityChange?: (itemId: string, quantity: number) => void
}

export default function OrderModal({
  isOpen,
  onClose,
  selectedItems,
  companyId,
  onSubmit,
}: OrderModalProps) {
  const { t, i18n } = useTranslation()
  const [orderForm, setOrderForm] = useState<OrderForm>({
    company: "",
    contact: "",
    phone: "",
    email: "",
    notes: "",
  })
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [slotError, setSlotError] = useState<string | null>(null)

  const itemFormRefs = useMemo<Record<string, React.RefObject<AdItemFormHandle | null>>>(() => {
    const result: Record<string, React.RefObject<AdItemFormHandle | null>> = {}
    for (const item of selectedItems) {
      result[item.id] = React.createRef<AdItemFormHandle>()
    }
    return result
  }, [selectedItems])

  const queryClient = useQueryClient()
  const { isLoggedIn, isAuthReady } = useUser()
  const didPrefillRef = useRef(false)

  useEffect(() => {
    if (!isOpen) {
      didPrefillRef.current = false
      return
    }
    if (!isLoggedIn || !isAuthReady) return
    if (didPrefillRef.current) return

    didPrefillRef.current = true

    void (async () => {
      try {
        const profile = await getProfile()
        if (!profile) return

        const companyValue =
          i18n.language === "zh-TW" ? profile.companyNameCn : profile.companyNameVi

        setOrderForm((prev) => ({
          ...prev,
          company: prev.company || companyValue,
          contact: prev.contact || profile.contactName,
          phone: prev.phone || profile.contactPhone || profile.phone,
          email: prev.email || profile.email,
        }))
      } catch {
        console.error("[OrderModal] Failed to prefill order form")
      }
    })()
  }, [i18n.language, isAuthReady, isLoggedIn, isOpen])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSlotError(null)
    if (!isValidPhone(orderForm.phone)) {
      setPhoneError(t("register.errors.invalidPhone"))
      return
    }
    setPhoneError(null)

    // Validate all item forms and collect values
    const itemDetailsById: Record<string, UiAdItemDetails> = {}
    for (const item of selectedItems) {
      const ref = itemFormRefs[item.id]
      const values = await ref?.current?.validate()
      if (!values) return // validation failed — errors shown inside that item's form
      itemDetailsById[item.id] = {
        startDate: values.startDate,
        endDate: values.endDate,
        needDesign: values.needDesign,
        adLink: values.adLink,
        files: values.files,
        quantity: values.quantity,
      }
    }

    const { input, subtotal } = buildCreateAdOrderInput({
      notes: orderForm.notes,
      companyId: companyId ?? null,
      selectedItems: selectedItems as UiSelectedAdItem[],
      itemDetailsById,
    })

    const newItems: NewOrderItem[] = selectedItems.map((item) => {
      const details = itemDetailsById[item.id]
      const sel = item as UiSelectedAdItem
      return {
        packageName: item.name,
        pricingName: item.duration ?? "",
        startDate: details?.startDate ?? "",
        endDate: details?.endDate ?? details?.startDate ?? "",
        pricingId: sel.pricingId ?? sel.id,
      }
    })

    try {
      const existingItems = await getMyPendingOrderItems()
      const { overlap } = hasOverlapWithExistingOrders(existingItems, newItems)
      if (overlap) {
        setSlotError(
          t("adContact.overlapWarning") ||
            "You already have an order for this advertising package with overlapping dates. Please choose different dates."
        )
        return
      }
    } catch (err) {
      console.error("[OrderModal] Failed to check existing orders for overlap", err)
    }

    const assets: AdOrderAssetToUpload[] = []
    selectedItems.forEach((item) => {
      const files = itemDetailsById[item.id]?.files ?? []
      const pricingId = (item as UiSelectedAdItem).pricingId || item.id
      files.forEach((file) => {
        assets.push({ pricingId, assetType: "ad_material", file })
      })
    })

    try {
      await onSubmit(input, { subtotal, assets })
      setOrderForm({ company: "", contact: "", phone: "", email: "", notes: "" })
      setSlotError(null)
    } catch (err) {
      const apiErr = err as { data?: { code?: string; message?: string } }
      if (apiErr?.data?.code === "AD_ORDER_SLOT_NOT_AVAILABLE") {
        setSlotError(
          t("adContact.slotNotAvailable") ||
            apiErr.data?.message ||
            "This ad slot is fully booked for the requested date range."
        )
        void queryClient.invalidateQueries({ queryKey: ["ads", "booked-dates"] })
        return
      }
      console.error("[OrderModal] Failed to submit order")
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center overflow-hidden bg-black/50 p-4">
      <div className="bg-background relative mt-12 max-h-[90vh] w-full max-w-2xl overflow-x-hidden overflow-y-auto rounded-lg">
        <div className="bg-body-bg-light border-border sticky top-0 z-10 flex items-center justify-between border-b px-6 py-4">
          <h2 key={i18n.language} className="text-xl font-bold">
            {t("adContact.orderTitle")}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-body-bg-dark bg-muted/30 space-y-6 p-6">
          <div className="bg-card rounded-lg p-5 shadow-sm">
            <h3
              key={i18n.language}
              className="text-foreground border-border mb-4 border-b pb-3 font-semibold"
            >
              {t("adContact.companyInfo")}
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="order-company">{t("adContact.companyName")} *</Label>
                <Input
                  id="order-company"
                  required
                  value={orderForm.company}
                  onChange={(e) => setOrderForm((prev) => ({ ...prev, company: e.target.value }))}
                  className="!bg-body-bg-light"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="order-contact">{t("adContact.contactPerson")} *</Label>
                <Input
                  id="order-contact"
                  required
                  value={orderForm.contact}
                  onChange={(e) => setOrderForm((prev) => ({ ...prev, contact: e.target.value }))}
                  className="!bg-body-bg-light"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="order-phone">{t("adContact.phone")} *</Label>
                <Input
                  id="order-phone"
                  required
                  value={orderForm.phone}
                  onChange={(e) => {
                    const value = e.target.value
                    setOrderForm((prev) => ({ ...prev, phone: value }))
                    setPhoneError(
                      value.trim() === ""
                        ? null
                        : isValidPhone(value)
                          ? null
                          : t("register.errors.invalidPhone")
                    )
                  }}
                  className="!bg-body-bg-light"
                />
                {phoneError && <p className="mt-1 text-sm text-red-500">{phoneError}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="order-email">Email *</Label>
                <Input
                  id="order-email"
                  type="email"
                  required
                  value={orderForm.email}
                  onChange={(e) => setOrderForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="!bg-body-bg-light"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 key={i18n.language} className="text-foreground mb-4 font-semibold">
              {t("adContact.adItemSettings")}
            </h3>
            <div className="space-y-4">
              {selectedItems.map((item) => {
                const orderItemData: OrderItemData = {
                  id: item.id,
                  category: item.category,
                  price: item.price,
                  packageType: item.packageType,
                  packageTypeName: item.name,
                  durationValue: item.durationValue,
                  durationUnit: item.durationUnit,
                }

                return (
                  <AdItemForm
                    key={item.id}
                    ref={itemFormRefs[item.id]}
                    mode="controlled"
                    orderItemData={orderItemData}
                    defaultValues={{ quantity: item.quantity ?? 1 }}
                    formConfig={item.formConfig}
                  />
                )
              })}
            </div>
          </div>

          <div className="bg-card rounded-lg p-5 shadow-sm">
            <Label htmlFor="order-notes" className="font-semibold">
              {t("adContact.notes")}
            </Label>
            <Textarea
              id="order-notes"
              rows={3}
              placeholder={t("adContact.notesPlaceholder")}
              value={orderForm.notes}
              onChange={(e) => setOrderForm((prev) => ({ ...prev, notes: e.target.value }))}
              className="mt-3"
            />
          </div>

          {slotError && <p className="text-sm text-red-500">{slotError}</p>}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="hover:!bg-header-red-dark flex-1 bg-white hover:!text-white"
              onClick={onClose}
            >
              {t("adContact.cancel")}
            </Button>
            <Button
              type="submit"
              className="!bg-header-red-dark text-primary-foreground hover:!bg-header-red-dark/80 flex-1"
            >
              <Send className="mr-2 h-4 w-4" />
              {t("adContact.submitOrder")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
