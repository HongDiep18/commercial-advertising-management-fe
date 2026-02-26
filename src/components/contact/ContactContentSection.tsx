"use client"

import { useTranslation } from "react-i18next"
import { Phone, Mail, MessageCircle, FileText } from "lucide-react"
import Button from "../ui/Button"

interface ContactContentSectionProps {
  title: string
  description: string
  contact: {
    phone: string
    email: string
  }
  selectedCount: number
  onInquiryClick: () => void
  onOrderClick: () => void
}

export default function ContactContentSection({
  title,
  description,
  contact,
  selectedCount,
  onInquiryClick,
  onOrderClick,
}: ContactContentSectionProps) {
  const { t } = useTranslation()

  return (
    <>
      <div className="bg-body-bg-dark bg-muted/30 mb-8 rounded-lg p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-foreground mb-2 text-xl font-bold">{title}</h2>
            <p className="text-muted-foreground">{description}</p>
          </div>
          <div className="flex flex-col gap-4 text-sm sm:flex-row">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Phone className="text-primary h-4 w-4" />
                <span>{contact.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="text-primary h-4 w-4" />
                <span>{contact.email}</span>
              </div>
            </div>

            <div className="w-full sm:w-auto">
              <Button
                size="sm"
                variant="outline"
                onClick={onInquiryClick}
                className="hover:!bg-header-red-dark w-full border !border-gray-400 bg-transparent whitespace-nowrap hover:!text-white sm:w-auto"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                {t("adContact.inquiryCustom")}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {selectedCount > 0 && (
        <div className="bg-body-bg-light border-border fixed right-0 bottom-0 left-0 z-30 border-t p-4 shadow-lg">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div>
              <p className="text-foreground font-medium">
                {t("adContact.selectedItems", { count: selectedCount })}
              </p>
              <p className="text-muted-foreground text-sm">{t("adContact.clickToOrder")}</p>
            </div>
            <Button
              size="lg"
              onClick={onOrderClick}
              className="!bg-header-red-dark text-primary-foreground hover:!bg-header-red-dark/80 mr-20"
            >
              <FileText className="mr-2 h-4 w-4" />
              {t("adContact.orderNow")}
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
