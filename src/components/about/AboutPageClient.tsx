"use client"

import Header from "../layout/Header"
import Footer from "../layout/Footer"
import AboutHero from "./AboutHero"
import AboutBody from "./AboutBody"

export default function AboutPageClient() {
  return (
    <div className="bg-background min-h-screen scroll-smooth">
      <Header />
      <main className="pt-16">
        <AboutHero />
        <AboutBody />
      </main>
      <Footer />
    </div>
  )
}
