'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Send } from 'lucide-react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Textarea from '../ui/Textarea'
import Label from '../ui/Label'

interface InquiryForm {
  company: string
  contact: string
  phone: string
  email: string
  message: string
}

interface InquiryModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: () => void
}

export default function InquiryModal({ isOpen, onClose, onSubmit }: InquiryModalProps) {
  const { t, i18n } = useTranslation()
  const [inquiryForm, setInquiryForm] = useState<InquiryForm>({
    company: '',
    contact: '',
    phone: '',
    email: '',
    message: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit()
    setInquiryForm({
      company: '',
      contact: '',
      phone: '',
      email: '',
      message: '',
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-body-bg-dark rounded-lg w-full max-w-md">
        <div className="border-b border-border border-gray-400 px-6 py-4 flex items-center justify-between">
          <h2 key={i18n.language} className="text-xl font-bold">{t('adContact.inquiryTitle')}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-body-bg-dark">
          <div className="space-y-2">
            <Label htmlFor="inquiry-company">{t('adContact.companyName')}</Label>
            <Input
              id="inquiry-company"
              value={inquiryForm.company}
              onChange={(e) => setInquiryForm((prev) => ({ ...prev, company: e.target.value }))}
              className="!bg-body-bg-dark !font-bold"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="inquiry-contact">{t('adContact.contactPerson')} *</Label>
            <Input
              id="inquiry-contact"
              required
              value={inquiryForm.contact}
              onChange={(e) => setInquiryForm((prev) => ({ ...prev, contact: e.target.value }))}
              className="!bg-body-bg-dark"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="inquiry-phone">{t('adContact.phone')} *</Label>
            <Input
              id="inquiry-phone"
              required
              value={inquiryForm.phone}
              onChange={(e) => setInquiryForm((prev) => ({ ...prev, phone: e.target.value }))}
              className="!bg-body-bg-dark"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="inquiry-email">Email</Label>
            <Input
              id="inquiry-email"
              type="email"
              value={inquiryForm.email}
              onChange={(e) => setInquiryForm((prev) => ({ ...prev, email: e.target.value }))}
              className="!bg-body-bg-dark"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="inquiry-message">{t('adContact.inquiryContent')} *</Label>
            <Textarea
              id="inquiry-message"
              rows={4}
              required
              placeholder={t('adContact.inquiryPlaceholder')}
              value={inquiryForm.message}
              onChange={(e) => setInquiryForm((prev) => ({ ...prev, message: e.target.value }))}
              className="!bg-body-bg-dark"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1 border !border-gray-400 bg-transparent hover:!bg-header-red-dark hover:!text-white" onClick={onClose}>
              {t('adContact.cancel')}
            </Button>
            <Button type="submit" className="flex-1 !bg-header-red-dark text-white hover:!bg-header-red-light">
              <Send className="w-4 h-4 mr-2" />
              {t('adContact.submitInquiry')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
