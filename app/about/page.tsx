'use client'

import Header from '../../src/components/layout/Header'
import Footer from '../../src/components/layout/Footer'
import AboutHero from '../../src/components/about/AboutHero'
import AboutBody from '../../src/components/about/AboutBody'

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background scroll-smooth">
            <Header />
            <main className="pt-16">
                <AboutHero />
                <AboutBody />
            </main>
            <Footer />
        </div>
    )
}
