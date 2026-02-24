'use client'

import { useState, Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Header from '../../src/components/layout/Header'
import Footer from '../../src/components/layout/Footer'
import { DirectorySidebar } from '../../src/components/directory/DirectorySidebar'
import { DirectoryResults } from '../../src/components/directory/DirectoryResults'

function DirectoryContent() {
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get('category')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    setSelectedCategory(categoryParam)
  }, [categoryParam])

  return (
    <div className="min-h-screen bg-body-bg-dark">
      <Header />
      <main className="pt-16">
        <div className="w-full px-4 sm:px-6 lg:px-6 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <DirectorySidebar selectedCategory={selectedCategory || categoryParam} setSelectedCategory={setSelectedCategory} />

            {/* Main Content */}
            <div className="flex-1 min-w-0">
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
