"use client"

import { useState, Suspense, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Header from "../../src/components/layout/Header"
import Footer from "../../src/components/layout/Footer"
import { DirectorySidebar } from "../../src/components/directory/DirectorySidebar"
import { DirectoryResults } from "../../src/components/directory/DirectoryResults"

function DirectoryContent() {
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get("category")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    setSelectedCategory(categoryParam)
  }, [categoryParam])

  return (
    <div className="bg-body-bg-dark min-h-screen">
      <Header />
      <main className="pt-16">
        <div className="w-full px-4 py-8 sm:px-6 lg:px-6">
          <div className="flex flex-col gap-8 lg:flex-row">
            <DirectorySidebar
              selectedCategory={selectedCategory || categoryParam}
              setSelectedCategory={setSelectedCategory}
            />

            <div className="min-w-0 flex-1">
              <DirectoryResults
                selectedCategory={selectedCategory || categoryParam}
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
