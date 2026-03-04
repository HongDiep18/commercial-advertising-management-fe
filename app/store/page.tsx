"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { StoreSidebar } from "@/components/store/StoreSidebar"
import { StoreGrid } from "@/components/store/StoreGrid"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"

function StoreContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<string>("全部商品")
  const [searchTerm, setSearchTerm] = useState("")

  // Initialize category from URL on mount
  useEffect(() => {
    const categoryFromUrl = searchParams.get("category")
    if (categoryFromUrl) {
      setSelectedCategory(decodeURIComponent(categoryFromUrl))
    }
  }, [searchParams])

  // Update URL when category changes
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    router.push(`/store?category=${encodeURIComponent(category)}`, { scroll: false })
  }

  return (
    <div className="min-h-screen bg-body-bg-dark flex flex-col">
      <Header />

      <div className="flex-1 pt-14">
        <div className="flex">
          {/* Left Sidebar */}
          <Suspense fallback={null}>
            <StoreSidebar
              selectedCategory={selectedCategory}
              setSelectedCategory={handleCategoryChange}
            />
          </Suspense>

          {/* Main Content */}
          <main className="flex-1 p-6 lg:p-8 min-h-[calc(100vh-3.5rem)]">
            <div className="max-w-6xl mx-auto">
              {/* Products Grid */}
              <StoreGrid
                selectedCategory={selectedCategory}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
              />
            </div>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default function StorePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StoreContent />
    </Suspense>
  )
}