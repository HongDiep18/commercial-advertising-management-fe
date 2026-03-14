"use client"

import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import CompanyDetail from "@/components/company/CompanyDetail"

interface CompanyDetailPageClientProps {
  companyId: string
}

export default function CompanyDetailPageClient({ companyId }: CompanyDetailPageClientProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <CompanyDetail companyId={companyId} />
      </main>
      <Footer />
    </div>
  )
}
