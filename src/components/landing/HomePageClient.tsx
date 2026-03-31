"use client"

import type { PopupCompanyItem } from "@/api/active-ads/types"
import type { FeaturedCompanyItem } from "@/api/companies/types"
import FeaturedCompanies from "./FeaturedCompanies"
import HeroSection from "./HeroSection"
import PopupPriorityCompanyModal from "./PopupPriorityCompanyModal"
import SearchSection from "./SearchSection"
import StatsSection from "./StatsSection"
import StickyBottomBanner from "./StickyBottomBanner"
import Footer from "../layout/Footer"
import Header from "../layout/Header"

type PreviewProps = {
  previewPopupPriority?: PopupCompanyItem[]
  previewPopupRotational?: PopupCompanyItem[]
  previewFeaturedCompanies?: FeaturedCompanyItem[]
  previewOrderId?: string
}

export default function HomePageClient({
  previewPopupPriority,
  previewPopupRotational,
  previewFeaturedCompanies,
  previewOrderId,
}: PreviewProps = {}) {
  // 64px = header height (pt-16). Add 40px (h-10) for preview banner when active.
  const mainPaddingTop = previewOrderId ? 104 : 64

  return (
    <div className="min-h-screen">
      <Header previewOrderId={previewOrderId} />
      <main style={{ paddingTop: mainPaddingTop }}>
        <HeroSection />
        <SearchSection />
        <FeaturedCompanies overrideData={previewFeaturedCompanies} />
        <StatsSection />
      </main>
      <Footer />
      <StickyBottomBanner overrideData={previewPopupRotational} forceVisible={!!previewPopupRotational} />
      <PopupPriorityCompanyModal overrideData={previewPopupPriority} forceOpen={!!previewPopupPriority} />
    </div>
  )
}
