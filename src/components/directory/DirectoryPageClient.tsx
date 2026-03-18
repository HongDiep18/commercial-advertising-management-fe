"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useMemo, useState } from "react"
import { DirectoryResults } from "./DirectoryResults"
import { DirectorySidebar } from "./DirectorySidebar"
import Footer from "../layout/Footer"
import Header from "../layout/Header"
import { useDirectoryCategories, type DirectoryCategoryMode } from "./useDirectoryCategories"
import { ALL_CATEGORY_ID } from "./DirectorySidebar"
import { useUser } from "@/contexts/user-context"
import { isDemoUser } from "@/components/login/demo"

function DirectoryContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const industryParams = searchParams.getAll("industry")
  const categoryParam = searchParams.get("category")
  const qParam = searchParams.get("q") ?? ""
  const { user, isLoggedIn } = useUser()
  const mode: DirectoryCategoryMode =
    !isLoggedIn || !user ? "guest" : isDemoUser(user) ? "demo" : "real"
  const { categories } = useDirectoryCategories(mode)

  const urlIndustryKey = useMemo(() => {
    if (industryParams.length > 0) {
      const ids = industryParams
        .map((s) => String(s).trim())
        .filter((s) => s !== "" && s !== ALL_CATEGORY_ID)
      return Array.from(new Set(ids)).sort().join(",")
    }
    if (!categoryParam || categoryParam === ALL_CATEGORY_ID) return ""
    return String(categoryParam).trim()
  }, [industryParams, categoryParam])

  const urlSelected = useMemo<string[]>(() => {
    if (!urlIndustryKey) return []
    const ids = urlIndustryKey
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s !== "")
    return Array.from(new Set(ids))
  }, [urlIndustryKey])

  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => urlSelected)
  const [searchTerm, setSearchTerm] = useState(() => qParam)

  useEffect(() => {
    setSearchTerm(qParam)
  }, [qParam])

  useEffect(() => {
    setSelectedCategories((prev) => {
      const prevKey = [...prev].sort().join(",")
      if (prevKey === urlIndustryKey) return prev
      return urlSelected
    })
  }, [urlIndustryKey, urlSelected])

  useEffect(() => {
    const selectedKey = [...selectedCategories].sort().join(",")
    if (selectedKey === urlIndustryKey) return

    const next = new URLSearchParams(searchParams.toString())
    next.delete("industry")
    next.delete("categories")
    next.delete("category")
    selectedCategories.forEach((id) => next.append("industry", id))
    const nextQs = next.toString()
    router.replace(`/directory${nextQs ? `?${nextQs}` : ""}`)
  }, [router, searchParams, selectedCategories, urlIndustryKey])

  useEffect(() => {
    if (categories.length === 0) return
    const ids = new Set(categories.map((c) => c.id))
    setSelectedCategories((prev) => prev.filter((id) => ids.has(id)))
  }, [categories])

  return (
    <div className="bg-body-bg-dark min-h-screen">
      <Header />
      <main className="pt-16">
        <div className="w-full px-4 py-8 sm:px-6 lg:px-6">
          <div className="flex flex-col gap-8 lg:flex-row">
            <DirectorySidebar
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
              categories={categories}
            />

            <div className="min-w-0 flex-1">
              <DirectoryResults
                selectedCategories={selectedCategories}
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

export default function DirectoryPageClient() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DirectoryContent />
    </Suspense>
  )
}
