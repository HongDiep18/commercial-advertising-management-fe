"use client"

import Image from "next/image"
import { useTranslation } from "react-i18next"
import { useNewsList, type NewsListInitialData } from "./useNewsList"
import { NewsFilters } from "./NewsFilters"
import { NewsCardList } from "./NewsCard"

export function NewsListClient({ initialData }: { initialData?: NewsListInitialData }) {
  const { t, i18n } = useTranslation()

  const {
    news,
    totalPages,
    currentPage,
    setPage,
    loading,
    error,
    categoryList,
    subcategoryList,
    selectedCategorySlugs,
    selectedSubcategoryIds,
    showSubcategoryFilter,
    setSelectedCategorySlugs,
    setShowSubcategoryFilter,
    toggleSubcategory,
    clearSubcategories,
  } = useNewsList(initialData)

  return (
    <>
      <section className="relative h-[280px] overflow-hidden md:h-[320px]">
        <div className="absolute inset-0">
          <Image
            src="/assets/images/news/news-banner.jpg"
            alt="News Banner"
            fill
            priority
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-center px-4 sm:px-6 lg:px-8">
          <h1 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            {t("news.heroTitle")}
          </h1>
          <p className="max-w-2xl text-lg text-white/80">{t("news.heroDescription")}</p>
        </div>
      </section>

      <NewsFilters
        categoryList={categoryList}
        subcategoryList={subcategoryList}
        selectedCategorySlugs={selectedCategorySlugs}
        selectedSubcategoryIds={selectedSubcategoryIds}
        showSubcategoryFilter={showSubcategoryFilter}
        lang={i18n.language}
        onCategoryChange={setSelectedCategorySlugs}
        onSubcategoryToggle={toggleSubcategory}
        onToggleFilterPanel={() => setShowSubcategoryFilter((v) => !v)}
        onClearSubcategories={clearSubcategories}
      />

      <section className="bg-body-bg-dark">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {loading && (
            <div className="py-16 text-center">
              <p className="text-muted-foreground">
                {t("news.loading", { defaultValue: "載入中..." })}
              </p>
            </div>
          )}
          {error && (
            <div className="py-16 text-center">
              <p className="text-destructive">{error}</p>
            </div>
          )}
          {!loading && !error && news.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-muted-foreground">{t("news.noNews")}</p>
            </div>
          )}
          {!loading && !error && news.length > 0 && (
            <NewsCardList
              items={news}
              lang={i18n.language}
              totalPages={totalPages}
              currentPage={currentPage}
              onPageChange={setPage}
            />
          )}
        </div>
      </section>
    </>
  )
}
