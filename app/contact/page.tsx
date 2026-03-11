"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import Header from "../../src/components/layout/Header"
import Footer from "../../src/components/layout/Footer"
import HeroSection from "../../src/components/contact/HeroSection"
import TabNavigation from "../../src/components/contact/TabNavigation"
import ContactContentSection from "../../src/components/contact/ContactContentSection"
import PricingSection from "../../src/components/contact/PricingSection"
import OrderModal from "../../src/components/contact/OrderModal"
import InquiryModal from "../../src/components/contact/InquiryModal"
import { TabType, getTabConfig } from "../../src/utils/contactHelpers"
import { platformPricing, directoryPricing, productPricing } from "../../src/data/contactMockData"

interface SelectedItem {
  id: string
  name: string
  category: string
  duration?: string
  price: string
}

export default function ContactPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<TabType>("platform")
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [showInquiryModal, setShowInquiryModal] = useState(false)
  const [showOrderModal, setShowOrderModal] = useState(false)

  const tabConfig = getTabConfig(t)
  const currentConfig = tabConfig[activeTab]

  const handleItemToggle = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    )
  }

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    setSelectedItems([])
  }

  const getSelectedItemsDetails = (): SelectedItem[] => {
    const details: SelectedItem[] = []

    if (activeTab === "platform") {
      Object.entries(platformPricing).forEach(([categoryKey, category]) => {
        category.items.forEach((item) => {
          if (selectedItems.includes(item.id)) {
            details.push({
              id: item.id,
              name: t(`adContact.pricing.platformItems.${item.id}.name`) || item.name,
              category: t(`adContact.pricing.${categoryKey}.title`),
              duration: t(`adContact.pricing.platformItems.${item.id}.duration`) || item.duration,
              price: item.price,
            })
          }
        })
      })
    } else if (activeTab === "directory") {
      directoryPricing.forEach((item) => {
        if (selectedItems.includes(item.id)) {
          details.push({
            id: item.id,
            name: t(`adContact.pricing.directoryPositions.${item.id}`) || item.position,
            category: t("adContact.categoryNames.directory"),
            duration: t("adContact.duration.annual"),
            price: item.price,
          })
        }
      })
    } else {
      productPricing.forEach((item) => {
        if (selectedItems.includes(item.id)) {
          details.push({
            id: item.id,
            name: `${t(`adContact.pricing.productItems.${item.id}.item`) || item.item} - ${t(`adContact.pricing.productItems.${item.id}.description`) || item.description}`,
            category: t("adContact.categoryNames.product"),
            duration: t(`adContact.pricing.productItems.${item.id}.duration`) || item.duration,
            price: item.price,
          })
        }
      })
    }

    return details
  }

  const handleOrderSubmit = () => {
    alert(t("adContact.orderSuccess", { count: selectedItems.length }))
    setShowOrderModal(false)
    setSelectedItems([])
  }

  const handleInquirySubmit = () => {
    alert(t("adContact.inquirySuccess"))
    setShowInquiryModal(false)
  }

  return (
    <main className="bg-background min-h-screen">
      <Header />

      <div className="pt-14">
        <HeroSection />

        <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />

        <section className="bg-body-bg-light mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <ContactContentSection
            title={currentConfig.title}
            description={currentConfig.description}
            contact={currentConfig.contact}
            selectedCount={selectedItems.length}
            onInquiryClick={() => setShowInquiryModal(true)}
            onOrderClick={() => setShowOrderModal(true)}
          />

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
