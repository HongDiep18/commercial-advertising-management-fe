"use client"

import { useTranslation } from "react-i18next"
import Header from "../../src/components/layout/Header"
import Footer from "../../src/components/layout/Footer"
import { useNewsList } from "../../src/components/news/useNewsList"
import { NewsFilters } from "../../src/components/news/NewsFilters"
import { NewsCardList } from "../../src/components/news/NewsCard"

export default function NewsPage() {
  const { t, i18n } = useTranslation()

  const {
    news: filteredNews,
    totalPages,
    currentPage,
    setPage,
    loading,
    error,
    categoryList,
    subcategoryList,
    selectedCategorySlugs,
    selectedSubcategorySlugs,
    showSubcategoryFilter,
    setSelectedCategorySlugs,
    setShowSubcategoryFilter,
    toggleSubcategory,
    clearSubcategories,
  } = useNewsList()

  return (
    <main className="min-h-screen">
      <Header />
      <div className="pt-14">
        <section className="relative h-[280px] overflow-hidden md:h-[320px]">
          <div className="absolute inset-0 bg-cover bg-center">
            <img
              src="/assets/images/news/news-banner.jpg"
              alt="News Banner"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
          <div
            key={i18n.language}
            className="relative mx-auto flex h-full max-w-7xl flex-col justify-center px-4 sm:px-6 lg:px-8"
          >
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
          selectedSubcategorySlugs={selectedSubcategorySlugs}
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
            {!loading && !error && filteredNews.length === 0 && (
              <div className="py-16 text-center">
                <p className="text-muted-foreground">{t("news.noNews")}</p>
              </div>
            )}
            {!loading && !error && filteredNews.length > 0 && (
              <NewsCardList
                items={filteredNews}
                lang={i18n.language}
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={setPage}
              />
            )}
          </div>
        </section>

        <Footer />
      </div>
    </main>
  )
}
