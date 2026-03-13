"use client"

import FeaturedCompanies from "../src/components/landing/FeaturedCompanies"
import HeroSection from "../src/components/landing/HeroSection"
import PopupPriorityCompanyModal from "../src/components/landing/PopupPriorityCompanyModal"
import SearchSection from "../src/components/landing/SearchSection"
import StatsSection from "../src/components/landing/StatsSection"
import StickyBottomBanner from "../src/components/landing/StickyBottomBanner"
import Footer from "../src/components/layout/Footer"
import Header from "../src/components/layout/Header"

export default function HomePage() {
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
