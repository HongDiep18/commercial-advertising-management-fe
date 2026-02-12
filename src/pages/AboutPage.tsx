import Header from "../components/layout/Header"
import Footer from "../components/layout/Footer"
import AboutHero from "../components/about/AboutHero"
import AboutBody from "../components/about/AboutBody"

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
