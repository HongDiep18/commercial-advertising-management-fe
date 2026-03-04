"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useTranslation } from "react-i18next"
import { categoryNameToKey } from "@/components/store/StoreSidebar"
import { Search, Eye } from "lucide-react"
import { Pagination } from "@/components/news/Pagination" 
import { usePagination } from "@/components/news/usePagination"

const ITEMS_PER_PAGE = 12

// Mock product data
const productsByCategory: Record<string, Array<{ id: string; name: string; category: string; price: number; originalPrice?: number; image: string }>> = {}

// Vietnam Buyer's Guide
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

// Taiwan Tea
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

// Tea Gift Sets
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


// All products combined
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
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-400 rounded-lg bg-body-bg-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 text-sm transition-all"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-sm"
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

  // Get current category data
  const currentProducts = productsByCategory[selectedCategory ?? ""] ?? []

  // Filter by search term if provided
  const filteredProducts = searchTerm
    ? currentProducts.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : currentProducts

  const totalResults = filteredProducts.length
  const {
    currentPage,
    setPage,
    totalPages,
    slicePage,
  } = usePagination<Product>({
    totalItems: totalResults,
    pageSize: ITEMS_PER_PAGE,
  })

  useEffect(() => {
    setPage(1)
  }, [selectedCategory, searchTerm, setPage])

  const displayedProducts = slicePage(filteredProducts)


  // Empty state - no category selected
  if (!selectedCategory) {
    return (
      <section>
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          placeholder={t('store.grid.searchPlaceholder')}
          clearLabel={t('store.grid.clearButton')}
        />
        <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">{t('store.grid.selectCategory')}</h2>
          <p className="text-muted-foreground max-w-md">
            {t('store.grid.selectCategoryDescription')}
          </p>
        </div>
      </section>
    )
  }

  // Empty state - no results
  if (filteredProducts.length === 0) {
    return (
      <section>
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          placeholder={t('store.grid.searchPlaceholder')}
          clearLabel={t('store.grid.clearButton')}
        />
        <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">{t('store.grid.noProducts')}</h2>
          <p className="text-muted-foreground max-w-md">
            {t('store.grid.noProductsDescription')}
          </p>
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
        placeholder={t('store.grid.searchPlaceholder')}
        clearLabel={t('store.grid.clearButton')}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
        <h2 className="text-xl font-semibold">
          {selectedCategory && categoryNameToKey[selectedCategory]
            ? t(`store.sidebar.categories.${categoryNameToKey[selectedCategory]}`)
            : selectedCategory}
        </h2>
        <span className="text-sm text-muted-foreground">{totalResults} {t('store.grid.items')}</span>
      </div>

      {/* Store Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayedProducts.map((product) => (
          <Link
            key={product.id}
            href={`/store/${product.id}${selectedCategory ? `?fromCategory=${encodeURIComponent(selectedCategory)}` : ""}`}
            className="group"
          >
            <div className="bg-card rounded-lg overflow-hidden border border-border hover:shadow-lg transition-all duration-300">
              {/* Product Image */}
              <div className="relative aspect-square bg-white flex items-center justify-center overflow-hidden">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105"
                />
                
                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="w-12 h-12 bg-white rounded-md flex items-center justify-center hover:bg-gray-100 transition-colors">
                    <Eye className="w-5 h-5 text-foreground" />
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="text-sm font-medium text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-primary font-bold">
                    NT${product.price.toLocaleString()}
                  </span>
                  {product.originalPrice && (
                    <span className="text-xs text-muted-foreground line-through">
                      NT${product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
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
