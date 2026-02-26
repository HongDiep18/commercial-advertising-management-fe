"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Header from "../../src/components/layout/Header"
import Footer from "../../src/components/layout/Footer"
import { DirectorySidebar, categories } from "../../src/components/directory/DirectorySidebar"
import { DirectoryResults } from "../../src/components/directory/DirectoryResults"

const defaultCategoryId = categories[0]?.id ?? "textile"

function DirectoryContent() {
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get("category")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    () => categoryParam ?? defaultCategoryId
  )
  const [searchTerm, setSearchTerm] = useState("")

  const effectiveCategory = categoryParam ?? selectedCategory ?? defaultCategoryId

  return (
    <div className="bg-body-bg-dark min-h-screen">
      <Header />
      <main className="pt-16">
        <div className="w-full px-4 py-8 sm:px-6 lg:px-6">
          <div className="flex flex-col gap-8 lg:flex-row">
            <DirectorySidebar
              selectedCategory={effectiveCategory}
              setSelectedCategory={setSelectedCategory}
            />

            <div className="min-w-0 flex-1">
              <DirectoryResults
                selectedCategory={effectiveCategory}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function DirectoryPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DirectoryContent />
    </Suspense>
  )
}
