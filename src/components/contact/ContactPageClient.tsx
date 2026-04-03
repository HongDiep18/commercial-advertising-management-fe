"use client"

import { attachAssetsAndSubmitOrder, createAdOrder } from "@/api/ad-orders/service"
import { flattenPlatformCatalog } from "@/api/ads-pricing/contactPlatform"
import { useAvailableAdPackages } from "@/api/ads-pricing/hooks"
import {
  ContactContentSection,
  HeroSection,
  InquiryModal,
  OrderModal,
  PricingSection,
  TabNavigation,
} from "@/components/contact"
import Footer from "@/components/layout/Footer"
import Header from "@/components/layout/Header"
import { AdOrderPreviewButton } from "@/components/shared/AdOrderPreviewButton"
import { AlertDialog } from "@/components/ui/AlertDialog"
import Button from "@/components/ui/Button"
import { Toast, type ToastVariant } from "@/components/ui/Toast"
import { useUser } from "@/contexts/user-context"
import type { CreateAdOrderInput } from "@/types/types"
import { TabType, getTabConfig } from "@/utils/contactHelpers"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { getAdPackageLabelText } from "../admin/advertising/AdPackageLabel"
export type SelectedEntry = { id: string; quantity: number }

export interface SelectedItem {
  id: string
  name: string
  category: string
  duration?: string
  price: string
  quantity: number
  packageId?: string
  pricingId?: string
  packageType?: string
  durationValue?: number | null
  durationUnit?: string | null
  formConfig?: import("@/api/ads-pricing/types").AdPackageFormConfig
}

export default function ContactPageClient() {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { user, isLoggedIn } = useUser()
  const [selectedItems, setSelectedItems] = useState<SelectedEntry[]>([])
  const [showInquiryModal, setShowInquiryModal] = useState(false)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [successOrder, setSuccessOrder] = useState<{ orderId: string; count: number } | null>(null)
  const [toast, setToast] = useState<{
    message: string
    variant: ToastVariant
    visible: boolean
    action?: { label: string; href: string }
  }>({
    message: "",
    variant: "info",
    visible: false,
  })

  const showToast = (
    message: string,
    variant: ToastVariant = "info",
    action?: { label: string; href: string }
  ) => setToast({ message, variant, visible: true, action })
  const hideToast = () => setToast((prev) => ({ ...prev, visible: false }))

  const activeTab = useMemo<TabType>(() => {
    const fromUrl = searchParams?.get("tab") ?? ""
    return fromUrl === "directory" || fromUrl === "product" || fromUrl === "platform"
      ? (fromUrl as TabType)
      : "platform"
  }, [searchParams])

  const tabConfig = getTabConfig(t)
  const currentConfig = tabConfig[activeTab]

  const { data: adPackagesData, isError: isAdPackagesError } = useAvailableAdPackages()
  const platformCatalogItems = useMemo(
    () => (adPackagesData ? flattenPlatformCatalog(adPackagesData, i18n.language) : []),
    [adPackagesData, i18n.language]
  )

  useEffect(() => {
    if (isAdPackagesError) {
      showToast(
        t("adContact.pricingLoadError") ||
          "Unable to load pricing from server. Please try again later.",
        "error"
      )
    }
  }, [isAdPackagesError, t])

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
    const nextParams = new URLSearchParams(searchParams?.toString() ?? "")
    if (tab === "platform") nextParams.delete("tab")
    else nextParams.set("tab", tab)
    const qs = nextParams.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  const prevTabRef = useRef<TabType>(activeTab)
  useEffect(() => {
    if (prevTabRef.current !== activeTab) {
      prevTabRef.current = activeTab
      setSelectedItems([])
    }
  }, [activeTab])

  const getSelectedItemsDetails = (): SelectedItem[] => {
    const details: SelectedItem[] = []
    const byId = Object.fromEntries(selectedItems.map((e) => [e.id, e.quantity]))

    if (platformCatalogItems.length > 0) {
      platformCatalogItems.forEach((item) => {
        if (!byId[item.id]) return

        const categoryType = item.categoryType
        const tabForCategory: TabType =
          categoryType === "PLATFORM_PRINT"
            ? "directory"
            : categoryType === "PRODUCT_LISTING"
              ? "product"
              : "platform"

        if (tabForCategory !== activeTab) return

        details.push({
          id: item.id,
          name: getAdPackageLabelText({
            packageType: item.packageType,
            packageMetadata: item.metadata,
            fallbackLabel: item.name,
            t,
          }),
          category: item.categoryType,
          duration: item.duration,
          price: item.price,
          quantity: byId[item.id],
          packageId: item.packageId,
          pricingId: item.pricingId,
          packageType: item.packageType,
          durationValue: item.durationValue,
          durationUnit: item.durationUnit,
          formConfig: item.formConfig,
        })
      })
    }

    return details
  }

  const handleOrderSubmit = async (
    input: CreateAdOrderInput,
    meta: { subtotal: string; assets: { pricingId: string; assetType: string; file: File }[] }
  ) => {
    const selectedItemsById = Object.fromEntries(
      getSelectedItemsDetails().map((item) => [item.pricingId ?? item.id, item])
    )
    const hasMissingStartDate = input.items.some((item) => {
      const selectedItem = selectedItemsById[item.pricingId]
      if (selectedItem?.formConfig && !selectedItem.formConfig.requiresStartDate) return false
      return !item.startDate || item.startDate.trim() === ""
    })
    if (hasMissingStartDate) {
      showToast(
        t("adContact.startDateRequired") || "Please select a start date for each advertising item.",
        "warning"
      )
      throw new Error("startDateRequired")
    }

    try {
      const res = await createAdOrder(input)
      const orderId = res.id
      if (!orderId) {
        showToast(t("adContact.orderError") || "Order created but no order ID returned.", "error")
        return
      }
      try {
        await attachAssetsAndSubmitOrder(orderId, meta.assets)
      } catch (assetError) {
        console.error("[handleOrderSubmit] Asset upload failed", {
          orderId,
          assetCount: meta.assets.length,
          assetError,
        })
        showToast(
          t("adContact.orderError") || "Your order could not be completed. Please try again.",
          "error"
        )
        throw assetError
      }
      setShowOrderModal(false)
      setSelectedItems([])
      setSuccessOrder({ orderId, count: totalQuantity })
    } catch (err) {
      const apiErr = err as { data?: { code?: string } }
      if (apiErr?.data?.code === "AD_ORDER_SLOT_NOT_AVAILABLE") {
        throw err
      }
      console.error("[handleOrderSubmit] Order submission failed", err)
      const message =
        err instanceof Error ? err.message : t("adContact.orderError") || "Order failed."
      showToast(message, "error")
    }
  }

  const handleInquirySubmit = () => {
    showToast(t("adContact.inquirySuccess"), "success")
    setShowInquiryModal(false)
  }

  const handleOrderClick = () => {
    if (!isLoggedIn) {
      showToast(t("adContact.mustLoginToOrder") || "You must login to order", "warning")
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

      <AlertDialog
        open={successOrder !== null}
        onClose={() => setSuccessOrder(null)}
        variant="success"
        title={t("adContact.orderSubmittedTitle")}
        description={t("adContact.orderSuccess", { count: successOrder?.count ?? 0 })}
      >
        <div className="flex flex-col gap-2">
          {successOrder && (
            <AdOrderPreviewButton
              orderId={successOrder.orderId}
              labelKey="adContact.previewAd"
              labelDefault="Preview ad"
              variant="outline"
              size="sm"
              className="w-full"
            />
          )}
          <Button
            variant="primary"
            size="sm"
            className="w-full"
            onClick={() => setSuccessOrder(null)}
          >
            {t("common.close", "Close")}
          </Button>
        </div>
      </AlertDialog>

      <Footer />

      <Toast
        message={toast.message}
        variant={toast.variant}
        visible={toast.visible}
        onClose={hideToast}
        duration={4500}
        action={toast.action}
      />
    </main>
  )
}
