"use client"

import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import Textarea from "@/components/ui/Textarea"
import { Send, X } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"

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
    company: "",
    contact: "",
    phone: "",
    email: "",
    message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit()
    setInquiryForm({
      company: "",
      contact: "",
      phone: "",
      email: "",
      message: "",
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-body-bg-dark w-full max-w-md rounded-lg">
        <div className="border-border flex items-center justify-between border-b border-gray-400 px-6 py-4">
          <h2 key={i18n.language} className="text-xl font-bold">
            {t("adContact.inquiryTitle")}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-body-bg-dark space-y-4 p-6">
          <div className="space-y-2">
            <Label htmlFor="inquiry-company">{t("adContact.companyName")}</Label>
            <Input
              id="inquiry-company"
              value={inquiryForm.company}
              onChange={(e) => setInquiryForm((prev) => ({ ...prev, company: e.target.value }))}
              className="!bg-body-bg-dark !font-bold"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="inquiry-contact">{t("adContact.contactPerson")} *</Label>
            <Input
              id="inquiry-contact"
              required
              value={inquiryForm.contact}
              onChange={(e) => setInquiryForm((prev) => ({ ...prev, contact: e.target.value }))}
              className="!bg-body-bg-dark"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="inquiry-phone">{t("adContact.phone")} *</Label>
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
            <Label htmlFor="inquiry-message">{t("adContact.inquiryContent")} *</Label>
            <Textarea
              id="inquiry-message"
              rows={4}
              required
              placeholder={t("adContact.inquiryPlaceholder")}
              value={inquiryForm.message}
              onChange={(e) => setInquiryForm((prev) => ({ ...prev, message: e.target.value }))}
              className="!bg-body-bg-dark"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="hover:!bg-header-red-dark flex-1 border !border-gray-400 bg-transparent hover:!text-white"
              onClick={onClose}
            >
              {t("adContact.cancel")}
            </Button>
            <Button
              type="submit"
              className="!bg-header-red-dark hover:!bg-header-red-light flex-1 text-white"
            >
              <Send className="mr-2 h-4 w-4" />
              {t("adContact.submitInquiry")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
