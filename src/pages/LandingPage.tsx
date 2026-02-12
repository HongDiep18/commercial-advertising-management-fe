import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import HeroSection from '../components/landing/HeroSection'
import SearchSection from '../components/landing/SearchSection'
import FeaturedCompanies from '../components/landing/FeaturedCompanies'
import StatsSection from '../components/landing/StatsSection'
import StickyBottomBanner from '../components/landing/StickyBottomBanner'

export default function LandingPage() {
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
