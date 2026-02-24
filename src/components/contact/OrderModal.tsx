'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Send } from 'lucide-react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Textarea from '../ui/Textarea'
import Label from '../ui/Label'
import AdItemForm from './AdItemForm'
import { getDurationMonths, addMonths } from '../../data/contactMockData'
import { format } from 'date-fns'

interface OrderForm {
  company: string
  contact: string
  phone: string
  email: string
  notes: string
}

interface ItemDetail {
  startDate: string
  endDate: string
  needDesign: boolean
  adLink: string
  files: File[]
}

interface SelectedItem {
  id: string
  name: string
  category: string
  duration?: string
  price: string
}

interface OrderModalProps {
  isOpen: boolean
  onClose: () => void
  selectedItems: SelectedItem[]
  onSubmit: (form: OrderForm, itemDetails: Record<string, ItemDetail>) => void
}

export default function OrderModal({ isOpen, onClose, selectedItems, onSubmit }: OrderModalProps) {
  const { t, i18n } = useTranslation()
  const [orderForm, setOrderForm] = useState<OrderForm>({
    company: '',
    contact: '',
    phone: '',
    email: '',
    notes: '',
  })

  const [itemDetails, setItemDetails] = useState<Record<string, ItemDetail>>({})
  const [openCalendar, setOpenCalendar] = useState<string | null>(null)

  const handleStartDateChange = (itemId: string, date: Date | undefined, duration: string) => {
    if (!date) return

    const startDate = format(date, 'yyyy-MM-dd')
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

  const handleItemDetailChange = (itemId: string, field: string, value: string | boolean) => {
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
    onSubmit(orderForm, itemDetails)
    setOrderForm({
      company: '',
      contact: '',
      phone: '',
      email: '',
      notes: '',
    })
    setItemDetails({})
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-hidden">
      <div className="bg-background rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden relative">
        <div className="sticky top-0 bg-body-bg-light border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <h2 key={i18n.language} className="text-xl font-bold">{t('adContact.orderTitle')}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-body-bg-dark p-6 space-y-6 bg-muted/30">
          {/* Company Info Section */}
          <div className="bg-card rounded-lg p-5 shadow-sm">
            <h3 key={i18n.language} className="font-semibold mb-4 text-foreground border-b border-border pb-3">
              {t('adContact.companyInfo')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="order-company">{t('adContact.companyName')} *</Label>
                <Input
                  id="order-company"
                  required
                  value={orderForm.company}
                  onChange={(e) => setOrderForm((prev) => ({ ...prev, company: e.target.value }))}
                  className="!bg-body-bg-light"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="order-contact">{t('adContact.contactPerson')} *</Label>
                <Input
                  id="order-contact"
                  required
                  value={orderForm.contact}
                  onChange={(e) => setOrderForm((prev) => ({ ...prev, contact: e.target.value }))}
                  className="!bg-body-bg-light"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="order-phone">{t('adContact.phone')} *</Label>
                <Input
                  id="order-phone"
                  required
                  value={orderForm.phone}
                  onChange={(e) => setOrderForm((prev) => ({ ...prev, phone: e.target.value }))}
                  className="!bg-body-bg-light"
                />
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

          {/* Per-item Ad Details */}
          <div>
            <h3 key={i18n.language} className="font-semibold mb-4 text-foreground">
              {t('adContact.adItemSettings')}
            </h3>
            <div className="space-y-4">
              {selectedItems.map((item) => {
                const details = itemDetails[item.id] || {
                  startDate: '',
                  endDate: '',
                  needDesign: false,
                  adLink: '',
                  files: [],
                }

                return (
                  <AdItemForm
                    key={item.id}
                    item={item}
                    itemDetails={details}
                    openCalendar={openCalendar}
                    onStartDateChange={(date) => handleStartDateChange(item.id, date, item.duration || '')}
                    onDetailChange={(field, value) => handleItemDetailChange(item.id, field, value)}
                    onFileChange={(e) => handleFileChange(item.id, e)}
                    onRemoveFile={(index) => removeFile(item.id, index)}
                    onCalendarOpenChange={(open) => setOpenCalendar(open ? item.id : null)}
                  />
                )
              })}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-card rounded-lg p-5 shadow-sm">
            <Label htmlFor="order-notes" className="font-semibold">{t('adContact.notes')}</Label>
            <Textarea
              id="order-notes"
              rows={3}
              placeholder={t('adContact.notesPlaceholder')}
              value={orderForm.notes}
              onChange={(e) => setOrderForm((prev) => ({ ...prev, notes: e.target.value }))}
              className="mt-3"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1 bg-white hover:!bg-header-red-dark hover:!text-white" onClick={onClose}>
              {t('adContact.cancel')}
            </Button>
            <Button type="submit" className="flex-1 !bg-header-red-dark text-primary-foreground hover:!bg-header-red-dark/80">
              <Send className="w-4 h-4 mr-2" />
              {t('adContact.submitOrder')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
