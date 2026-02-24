'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Header from '../../src/components/layout/Header'
import Footer from '../../src/components/layout/Footer'
import HeroSection from '../../src/components/contact/HeroSection'
import TabNavigation from '../../src/components/contact/TabNavigation'
import ContactContentSection from '../../src/components/contact/ContactContentSection'
import PricingSection from '../../src/components/contact/PricingSection'
import OrderModal from '../../src/components/contact/OrderModal'
import InquiryModal from '../../src/components/contact/InquiryModal'
import { TabType, getTabConfig } from '../../src/utils/contactHelpers'
import {
  platformPricing,
  directoryPricing,
  productPricing,
} from '../../src/data/contactMockData'

interface SelectedItem {
  id: string
  name: string
  category: string
  duration?: string
  price: string
}

export default function ContactPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<TabType>('platform')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [showInquiryModal, setShowInquiryModal] = useState(false)
  const [showOrderModal, setShowOrderModal] = useState(false)

  const tabConfig = getTabConfig(t)
  const currentConfig = tabConfig[activeTab]

  const handleItemToggle = (itemId: string) => {
    setSelectedItems((prev) => (prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]))
  }

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    setSelectedItems([])
  }

  
  const getSelectedItemsDetails = (): SelectedItem[] => {
    const details: SelectedItem[] = []

    if (activeTab === 'platform') {
      Object.entries(platformPricing).forEach(([, category]) => {
        category.items.forEach((item) => {
          if (selectedItems.includes(item.id)) {
            details.push({
              id: item.id,
              name: item.name,
              category: category.title,
              duration: item.duration,
              price: item.price,
            })
          }
        })
      })
    } else if (activeTab === 'directory') {
      directoryPricing.forEach((item) => {
        if (selectedItems.includes(item.id)) {
          details.push({
            id: item.id,
            name: item.position,
            category: '越南華商採購名錄',
            duration: '年度',
            price: item.price,
          })
        }
      })
    } else {
      productPricing.forEach((item) => {
        if (selectedItems.includes(item.id)) {
          details.push({
            id: item.id,
            name: `${item.item} - ${item.description}`,
            category: '商品銷售刊登',
            duration: item.duration,
            price: item.price,
          })
        }
      })
    }

    return details
  }

  const handleOrderSubmit = (
    
    _form: { company: string; contact: string; phone: string; email: string; notes: string },
    
    _itemDetails: Record<string, { startDate: string; endDate: string; needDesign: boolean; adLink: string; files: File[] }>
  ) => {
    alert(t('adContact.orderSuccess', { count: selectedItems.length }))
    setShowOrderModal(false)
    setSelectedItems([])
  }

  const handleInquirySubmit = () => {
    alert(t('adContact.inquirySuccess'))
    setShowInquiryModal(false)
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="pt-14">
        <HeroSection />

        <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />

        {/* Main Content */}
        <section className="bg-body-bg-light max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ContactContentSection
            title={currentConfig.title}
            description={currentConfig.description}
            contact={currentConfig.contact}
            selectedCount={selectedItems.length}
            onInquiryClick={() => setShowInquiryModal(true)}
            onOrderClick={() => setShowOrderModal(true)}
          />

          {/* Pricing Tables */}
          <div className="space-y-6">
            <PricingSection
              activeTab={activeTab}
              selectedItems={selectedItems}
              onItemToggle={handleItemToggle}
            />
          </div>
        </section>
      </div>

      <OrderModal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        selectedItems={getSelectedItemsDetails()}
        onSubmit={handleOrderSubmit}
      />

      <InquiryModal
        isOpen={showInquiryModal}
        onClose={() => setShowInquiryModal(false)}
        onSubmit={handleInquirySubmit}
      />

      <Footer />
    </main>
  )
}
