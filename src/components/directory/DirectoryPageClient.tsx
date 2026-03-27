"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useMemo, useRef, useState } from "react"
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
  const regionParams = searchParams.getAll("region")
  const categoryParam = searchParams.get("category")
  const qParam = searchParams.get("q") ?? ""
  const { user, isLoggedIn } = useUser()
  const mode: DirectoryCategoryMode =
    !isLoggedIn || !user ? "guest" : isDemoUser(user) ? "demo" : "real"
  const { categories, hasAllAccess } = useDirectoryCategories(mode)

  // Redirect Bronze/Silver/Gold users to their primary industry if no category selected
  useEffect(() => {
    if (!hasAllAccess && categories.length > 0 && !categoryParam && industryParams.length === 0) {
      // User has restricted access and no category filter applied
      // Redirect to their accessible categories
      const accessibleIndustries = categories.map((cat) => cat.id)
      if (accessibleIndustries.length > 0) {
        const params = new URLSearchParams()
        accessibleIndustries.forEach((id) => params.append("industry", id))
        if (qParam) params.set("q", qParam)
        regionParams.forEach((id) => params.append("region", id))
        router.replace(`/directory?${params.toString()}`)
      }
    }
  }, [hasAllAccess, categories, categoryParam, industryParams.length, router, qParam, regionParams])

  const selectedRegions = useMemo(() => {
    const ids = regionParams.map((s) => String(s).trim()).filter((s) => s !== "")
    return Array.from(new Set(ids))
  }, [regionParams])

  const handleClearRegions = () => {
    const next = new URLSearchParams(searchParams.toString())
    next.delete("region")
    const nextQs = next.toString()
    router.replace(`/directory${nextQs ? `?${nextQs}` : ""}`)
  }

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
  const isSyncingFromUrlRef = useRef(false)

  useEffect(() => {
    setSearchTerm(qParam)
  }, [qParam])

  useEffect(() => {
    isSyncingFromUrlRef.current = true
    setSelectedCategories((prev) => {
      const prevKey = [...prev].sort().join(",")
      if (prevKey === urlIndustryKey) return prev
      return urlSelected
    })
  }, [urlIndustryKey, urlSelected])

  useEffect(() => {
    if (isSyncingFromUrlRef.current) {
      isSyncingFromUrlRef.current = false
      return
    }
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
              hasAllAccess={hasAllAccess}
            />

            <div className="min-w-0 flex-1">
              <DirectoryResults
                selectedCategories={selectedCategories}
                selectedRegions={selectedRegions}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                onClearRegions={handleClearRegions}
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
