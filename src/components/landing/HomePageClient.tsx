"use client"

import FeaturedCompanies from "./FeaturedCompanies"
import HeroSection from "./HeroSection"
import PopupPriorityCompanyModal from "./PopupPriorityCompanyModal"
import SearchSection from "./SearchSection"
import StatsSection from "./StatsSection"
import StickyBottomBanner from "./StickyBottomBanner"
import Footer from "../layout/Footer"
import Header from "../layout/Header"

export default function HomePageClient() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        <HeroSection />
        <SearchSection />
        <FeaturedCompanies />
        <StatsSection />
      </main>
      <Footer />
      <StickyBottomBanner />
      <PopupPriorityCompanyModal />
    </div>
  )
}
