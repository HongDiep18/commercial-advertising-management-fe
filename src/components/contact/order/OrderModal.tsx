"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { X, Send } from "lucide-react"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import Textarea from "@/components/ui/Textarea"
import Label from "@/components/ui/Label"
import AdItemForm from "./AdItemForm"
import { getDurationMonths, addMonths } from "@/data/contactMockData"
import { format } from "date-fns"
import type { UiAdItemDetails, UiSelectedAdItem } from "@/api/ad-orders/builders"
import { buildCreateAdOrderInput } from "@/api/ad-orders/builders"
import type { CreateAdOrderInput } from "@/types/types"
import { isValidPhone } from "@/utils/validation/phone"

type OrderForm = {
  company: string
  contact: string
  phone: string
  email: string
  notes: string
}

type ItemDetail = {
  startDate: string
  endDate: string
  needDesign: boolean
  adLink: string
  files: File[]
  quantity?: number
}

type SelectedItem = {
  id: string
  name: string
  category: string
  duration?: string
  price: string
  quantity?: number
}

type OrderModalProps = {
  isOpen: boolean
  onClose: () => void
  selectedItems: SelectedItem[]
  companyId?: string | null
  onSubmit: (input: CreateAdOrderInput, meta: { subtotal: string }) => void
  onQuantityChange?: (itemId: string, quantity: number) => void
}

export default function OrderModal({
  isOpen,
  onClose,
  selectedItems,
  companyId,
  onSubmit,
  onQuantityChange,
}: OrderModalProps) {
  const { t, i18n } = useTranslation()
  const [orderForm, setOrderForm] = useState<OrderForm>({
    company: "",
    contact: "",
    phone: "",
    email: "",
    notes: "",
  })

  const [itemDetails, setItemDetails] = useState<Record<string, ItemDetail>>({})
  const [openCalendar, setOpenCalendar] = useState<string | null>(null)

  const [phoneError, setPhoneError] = useState<string | null>(null)

  const handleStartDateChange = (itemId: string, date: Date | undefined, duration: string) => {
    if (!date) return

    const startDate = format(date, "yyyy-MM-dd")
    const months = getDurationMonths(duration)
    const endDate = months > 0 ? addMonths(startDate, months) : startDate

    setItemDetails((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        startDate,
        endDate,
      },
    }))

    setOpenCalendar(null)
  }

  const handleItemDetailChange = (
    itemId: string,
    field: string,
    value: string | boolean | number
  ) => {
    if (field === "quantity" && typeof value === "number") {
      onQuantityChange?.(itemId, value)
    }
    setItemDetails((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value,
      },
    }))
  }

  const handleFileChange = (itemId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setItemDetails((prev) => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          files: [...(prev[itemId]?.files || []), ...Array.from(e.target.files!)],
        },
      }))
    }
  }

  const removeFile = (itemId: string, index: number) => {
    setItemDetails((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        files: prev[itemId].files.filter((_, i) => i !== index),
      },
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValidPhone(orderForm.phone)) {
      setPhoneError(t("register.errors.invalidPhone"))
      return
    }
    setPhoneError(null)

    const { input, subtotal } = buildCreateAdOrderInput({
      notes: orderForm.notes,
      companyId: companyId ?? null,
      selectedItems: selectedItems as UiSelectedAdItem[],
      itemDetailsById: itemDetails as Record<string, UiAdItemDetails>,
    })
    onSubmit(input, { subtotal })
    setOrderForm({
      company: "",
      contact: "",
      phone: "",
      email: "",
      notes: "",
    })
    setItemDetails({})
    setPhoneError(null)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/50 p-4">
      <div className="bg-background relative max-h-[90vh] w-full max-w-2xl overflow-x-hidden overflow-y-auto rounded-lg">
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
                const details = itemDetails[item.id] || {
                  startDate: "",
                  endDate: "",
                  needDesign: false,
                  adLink: "",
                  files: [],
                  quantity: item.quantity ?? 1,
                }
                const mergedDetails = {
                  ...details,
                  quantity: details.quantity ?? item.quantity ?? 1,
                }

                return (
                  <AdItemForm
                    key={item.id}
                    item={item}
                    itemDetails={mergedDetails}
                    openCalendar={openCalendar}
                    onStartDateChange={(date) =>
                      handleStartDateChange(item.id, date, item.duration || "")
                    }
                    onDetailChange={(field, value) => handleItemDetailChange(item.id, field, value)}
                    onFileChange={(e) => handleFileChange(item.id, e)}
                    onRemoveFile={(index) => removeFile(item.id, index)}
                    onCalendarOpenChange={(open) => setOpenCalendar(open ? item.id : null)}
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
