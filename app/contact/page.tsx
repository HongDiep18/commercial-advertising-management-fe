"use client"

import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useRouter } from "next/navigation"
import Header from "../../src/components/layout/Header"
import Footer from "../../src/components/layout/Footer"
import {
  HeroSection,
  TabNavigation,
  ContactContentSection,
  PricingSection,
  OrderModal,
  InquiryModal,
} from "@/components/contact"
import { TabType, getTabConfig } from "../../src/utils/contactHelpers"
import { platformPricing, directoryPricing, productPricing } from "../../src/data/contactMockData"
import { createAdOrder, attachAssetsAndSubmitOrder } from "../../src/api/ad-orders/service"
import { useAvailableAdPackages } from "@/api/ads-pricing/hooks"
import { flattenPlatformCatalog } from "@/api/ads-pricing/contactPlatform"
import type { CreateAdOrderInput } from "@/types/types"
import { useUser } from "../../src/contexts/user-context"

export type SelectedEntry = { id: string; quantity: number }

interface SelectedItem {
  id: string
  name: string
  category: string
  duration?: string
  price: string
  quantity: number
  packageId?: string
  pricingId?: string
}

export default function ContactPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { user, isLoggedIn } = useUser()
  const [activeTab, setActiveTab] = useState<TabType>("platform")
  const [selectedItems, setSelectedItems] = useState<SelectedEntry[]>([])
  const [showInquiryModal, setShowInquiryModal] = useState(false)
  const [showOrderModal, setShowOrderModal] = useState(false)

  const tabConfig = getTabConfig(t)
  const currentConfig = tabConfig[activeTab]

  const { data: adPackagesData } = useAvailableAdPackages()
  const platformCatalogItems = useMemo(
    () => (adPackagesData ? flattenPlatformCatalog(adPackagesData) : []),
    [adPackagesData]
  )

  const selectedIds = selectedItems.map((e) => e.id)
  const totalQuantity = selectedItems.reduce((sum, e) => sum + e.quantity, 0)

  const handleItemToggle = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.some((e) => e.id === itemId)
        ? prev.filter((e) => e.id !== itemId)
        : [...prev, { id: itemId, quantity: 1 }]
    )
  }

  const handleQuantityChange = (itemId: string, quantity: number) => {
    const q = Math.max(1, Math.floor(quantity))
    setSelectedItems((prev) => prev.map((e) => (e.id === itemId ? { ...e, quantity: q } : e)))
  }

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    setSelectedItems([])
  }

  const getSelectedItemsDetails = (): SelectedItem[] => {
    const details: SelectedItem[] = []
    const byId = Object.fromEntries(selectedItems.map((e) => [e.id, e.quantity]))

    if (activeTab === "platform") {
      if (platformCatalogItems.length > 0) {
        platformCatalogItems.forEach((item) => {
          if (!byId[item.id]) return
          details.push({
            id: item.id,
            name: item.name,
            category: item.categoryName,
            duration: item.duration,
            price: item.price,
            quantity: byId[item.id],
            packageId: item.packageId,
            pricingId: item.pricingId,
          })
        })
      } else {
        Object.entries(platformPricing).forEach(([categoryKey, category]) => {
          category.items.forEach((item) => {
            if (!byId[item.id]) return
            details.push({
              id: item.id,
              name: t(`adContact.pricing.platformItems.${item.id}.name`) || item.name,
              category: t(`adContact.pricing.${categoryKey}.title`),
              duration: t(`adContact.pricing.platformItems.${item.id}.duration`) || item.duration,
              price: item.price,
              quantity: byId[item.id],
            })
          })
        })
      }
    } else if (activeTab === "directory") {
      directoryPricing.forEach((item) => {
        if (!byId[item.id]) return
        details.push({
          id: item.id,
          name: t(`adContact.pricing.directoryPositions.${item.id}`) || item.position,
          category: t("adContact.categoryNames.directory"),
          duration: t("adContact.durationAnnual"),
          price: item.price,
          quantity: byId[item.id],
        })
      })
    } else {
      productPricing.forEach((item) => {
        if (!byId[item.id]) return
        details.push({
          id: item.id,
          name: `${t(`adContact.pricing.productItems.${item.id}.item`) || item.item} - ${t(`adContact.pricing.productItems.${item.id}.description`) || item.description}`,
          category: t("adContact.categoryNames.product"),
          duration: t(`adContact.pricing.productItems.${item.id}.duration`) || item.duration,
          price: item.price,
          quantity: byId[item.id],
        })
      })
    }

    return details
  }

  const handleOrderSubmit = async (
    input: CreateAdOrderInput,
    meta: { subtotal: string; assets: { pricingId: string; assetType: string; file: File }[] }
  ) => {
    try {
      const res = await createAdOrder(input)
      const orderId = res?.data?.orderId
      if (!orderId) {
        alert(t("adContact.orderError") || "Order created but no order ID returned.")
        return
      }
      await attachAssetsAndSubmitOrder(orderId, meta.assets)
      alert(t("adContact.orderSuccess", { count: totalQuantity }))
      setShowOrderModal(false)
      setSelectedItems([])
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("adContact.orderError") || "Order failed."
      alert(message)
    }
  }

  const handleInquirySubmit = () => {
    alert(t("adContact.inquirySuccess"))
    setShowInquiryModal(false)
  }

  const handleOrderClick = () => {
    if (!isLoggedIn) {
      alert(t("adContact.mustLoginToOrder") || "You must login to order")
      router.push("/login?next=/contact")
      return
    }
    setShowOrderModal(true)
  }

  return (
    <main className="bg-background min-h-screen">
      <Header />

      <div className="pt-14">
        <HeroSection />

        <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />

        <section className="bg-body-bg-light w-full">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <ContactContentSection
              title={currentConfig.title}
              description={currentConfig.description}
              contact={currentConfig.contact}
              selectedCount={selectedItems.length}
              totalQuantity={totalQuantity}
              onInquiryClick={() => setShowInquiryModal(true)}
              onOrderClick={handleOrderClick}
            />

            <div className="space-y-6">
              <PricingSection
                activeTab={activeTab}
                selectedItems={selectedIds}
                onItemToggle={handleItemToggle}
                platformCatalogItems={platformCatalogItems}
              />
            </div>
          </div>
        </section>
      </div>

      <OrderModal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        selectedItems={getSelectedItemsDetails()}
        companyId={user?.companyId ?? null}
        onSubmit={handleOrderSubmit}
        onQuantityChange={handleQuantityChange}
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
