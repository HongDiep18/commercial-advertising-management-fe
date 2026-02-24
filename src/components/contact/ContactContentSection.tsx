'use client'

import { useTranslation } from 'react-i18next'
import { Phone, Mail, MessageCircle, FileText } from 'lucide-react'
import Button from '../ui/Button'

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
      {/* Contact Info Section */}
      <div className="bg-body-bg-dark mb-8 p-6 bg-muted/30 rounded-lg">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">{title}</h2>
            <p className="text-muted-foreground">{description}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 text-sm">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                <span>{contact.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <span>{contact.email}</span>
              </div>
            </div>

            <div className="w-full sm:w-auto">
              <Button
                size="sm"
                variant="outline"
                onClick={onInquiryClick}
                className="w-full sm:w-auto bg-transparent border !border-gray-400 hover:!bg-header-red-dark hover:!text-white whitespace-nowrap"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                {t('adContact.inquiryCustom')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Order Button - Fixed at bottom */}
      {selectedCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-body-bg-light border-t border-border p-4 shadow-lg z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">{t('adContact.selectedItems', { count: selectedCount })}</p>
              <p className="text-sm text-muted-foreground">{t('adContact.clickToOrder')}</p>
            </div>
            <Button
              size="lg"
              onClick={onOrderClick}
              className="!bg-header-red-dark text-primary-foreground hover:!bg-header-red-dark/80 mr-20"
            >
              <FileText className="w-4 h-4 mr-2" />
              {t('adContact.orderNow')}
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
