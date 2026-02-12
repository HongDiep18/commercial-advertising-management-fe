'use client'

import Header from '../src/components/layout/Header'
import Footer from '../src/components/layout/Footer'
import HeroSection from '../src/components/landing/HeroSection'
import SearchSection from '../src/components/landing/SearchSection'
import FeaturedCompanies from '../src/components/landing/FeaturedCompanies'
import StatsSection from '../src/components/landing/StatsSection'
import StickyBottomBanner from '../src/components/landing/StickyBottomBanner'

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
        </div>
    )
}
