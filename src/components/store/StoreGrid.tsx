"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useTranslation } from "react-i18next"
import { categoryNameToKey } from "@/components/store/StoreSidebar"
import { Search, Eye } from "lucide-react"
import { Pagination } from "@/components/news/Pagination"
import { usePagination } from "@/components/news/usePagination"

const ITEMS_PER_PAGE = 12

const productsByCategory: Record<
  string,
  Array<{
    id: string
    name: string
    category: string
    price: number
    originalPrice?: number
    image: string
  }>
> = {}

productsByCategory["越南華商採購名錄"] = [
  {
    id: "vietnam-guide-2025",
    name: "2025 越南華商採購名錄",
    category: "越南華商採購名錄",
    price: 550000,
    originalPrice: undefined,
    image: "/assets/images/magazines/2025.png",
  },
  {
    id: "vietnam-guide-2024",
    name: "2024 越南華商採購名錄",
    category: "越南華商採購名錄",
    price: 300000,
    originalPrice: undefined,
    image: "/assets/images/magazines/2024.png",
  },
]

productsByCategory["台灣茶葉"] = [
  {
    id: "taiwan-tea-1",
    name: "台灣情 阿里山烏龍茶（環保盒裝）",
    category: "台灣茶葉",
    price: 1805,
    originalPrice: 1900,
    image: "/assets/images/companies/modern-tech-office.png",
  },
  {
    id: "taiwan-tea-2",
    name: "台灣情 嚴選高山烏龍茶（環保盒裝）",
    category: "台灣茶葉",
    price: 900,
    originalPrice: 1000,
    image: "/assets/images/companies/modern-tech-office.png",
  },
]

productsByCategory["茶葉禮品"] = [
  {
    id: "tea-gift-1",
    name: "台灣情 高山烏龍茶（環保盒裝）",
    category: "茶葉禮品",
    price: 665,
    originalPrice: 700,
    image: "/assets/images/companies/modern-tech-office.png",
  },
  {
    id: "tea-gift-2",
    name: "台灣情 精選茶葉禮盒",
    category: "茶葉禮品",
    price: 1200,
    originalPrice: 1500,
    image: "/assets/images/companies/modern-tech-office.png",
  },
]

const allProducts = [
  ...productsByCategory["越南華商採購名錄"],
  ...productsByCategory["台灣茶葉"],
  ...productsByCategory["茶葉禮品"],
]
productsByCategory["全部商品"] = allProducts

interface StoreGridProps {
  selectedCategory: string | null
  searchTerm: string
  setSearchTerm: (term: string) => void
}

interface Product {
  id: string
  name: string
  category: string
  price: number
  originalPrice?: number
  image: string
}

interface SearchBarProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  placeholder: string
  clearLabel: string
}

function SearchBar({ searchTerm, setSearchTerm, placeholder, clearLabel }: SearchBarProps) {
  return (
    <div className="mb-6">
      <div className="relative max-w-xl">
        <Search className="text-muted-foreground absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2" />
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-body-bg-dark focus:ring-primary/20 focus:border-primary/50 w-full rounded-lg border border-gray-400 py-3 pr-4 pl-12 text-sm transition-all focus:ring-2 focus:outline-none"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-4 -translate-y-1/2 text-sm"
          >
            {clearLabel}
          </button>
        )}
      </div>
    </div>
  )
}

export function StoreGrid({ selectedCategory, searchTerm, setSearchTerm }: StoreGridProps) {
  const { t } = useTranslation()

  const currentProducts = productsByCategory[selectedCategory ?? ""] ?? []

  const filteredProducts = searchTerm
    ? currentProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : currentProducts

  const totalResults = filteredProducts.length
  const { currentPage, setPage, totalPages, slicePage } = usePagination<Product>({
    totalItems: totalResults,
    pageSize: ITEMS_PER_PAGE,
  })

  useEffect(() => {
    setPage(1)
  }, [selectedCategory, searchTerm, setPage])

  const displayedProducts = slicePage(filteredProducts)

  if (!selectedCategory) {
    return (
      <section>
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          placeholder={t("store.grid.searchPlaceholder")}
          clearLabel={t("store.grid.clearButton")}
        />
        <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
          <div className="bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            <Search className="text-muted-foreground h-8 w-8" />
          </div>
          <h2 className="mb-2 text-xl font-semibold">{t("store.grid.selectCategory")}</h2>
          <p className="text-muted-foreground max-w-md">
            {t("store.grid.selectCategoryDescription")}
          </p>
        </div>
      </section>
    )
  }

  if (filteredProducts.length === 0) {
    return (
      <section>
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          placeholder={t("store.grid.searchPlaceholder")}
          clearLabel={t("store.grid.clearButton")}
        />
        <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
          <div className="bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            <Search className="text-muted-foreground h-8 w-8" />
          </div>
          <h2 className="mb-2 text-xl font-semibold">{t("store.grid.noProducts")}</h2>
          <p className="text-muted-foreground max-w-md">{t("store.grid.noProductsDescription")}</p>
        </div>
      </section>
    )
  }

  return (
    <section>
      {/* Search Bar */}
      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        placeholder={t("store.grid.searchPlaceholder")}
        clearLabel={t("store.grid.clearButton")}
      />

      {/* Header */}
      <div className="border-border mb-6 flex items-center justify-between border-b pb-4">
        <h2 className="text-xl font-semibold">
          {selectedCategory && categoryNameToKey[selectedCategory]
            ? t(`store.sidebar.categories.${categoryNameToKey[selectedCategory]}`)
            : selectedCategory}
        </h2>
        <span className="text-muted-foreground text-sm">
          {totalResults} {t("store.grid.items")}
        </span>
      </div>

      {/* Store Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {displayedProducts.map((product) => (
          <div //Link
            key={product.id}
            //href={`/store/${product.id}${selectedCategory ? `?fromCategory=${encodeURIComponent(selectedCategory)}` : ""}`}
            className="group"
          >
            <div className="bg-card border-border overflow-hidden rounded-lg border transition-all duration-300 hover:shadow-lg">
              {/* Product Image */}
              <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-white">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                />

                {/* Hover Actions */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-white transition-colors hover:bg-gray-100">
                    <Eye className="text-foreground h-5 w-5" />
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="text-foreground group-hover:text-primary mb-2 line-clamp-2 text-sm font-medium transition-colors">
                  {product.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-primary font-bold">
                    NT${product.price.toLocaleString()}
                  </span>
                  {product.originalPrice && (
                    <span className="text-muted-foreground text-xs line-through">
                      NT${product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div> //Link
        ))}
      </div>

      <Pagination
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={setPage}
        scrollOnChange
      />
    </section>
  )
}
