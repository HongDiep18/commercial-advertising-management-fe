'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import { Calendar, ChevronRight, Filter } from 'lucide-react'
import Header from '../../src/components/layout/Header'
import Footer from '../../src/components/layout/Footer'
import Button from '../../src/components/ui/Button'
import { newsCategories, industryCategories, mockNews } from '../../src/data/newsMockData'

export default function NewsPage() {
  const { t, i18n } = useTranslation()
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([])
  const [showIndustryFilter, setShowIndustryFilter] = useState(false)

  
  const getCategoryName = (categoryId: string) => {
    return t(`news.categories.${categoryId}`, { defaultValue: categoryId })
  }

  
  const getIndustryName = (industryId: string) => {
    return t(`directory.categories.${industryId}`, { defaultValue: industryId })
  }

  
  const toggleCategory = (categoryId: string) => {
    if (categoryId === 'all') {
      setSelectedCategories([])
      return
    }
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  
  const toggleIndustry = (industryId: string) => {
    setSelectedIndustries((prev) =>
      prev.includes(industryId)
        ? prev.filter((id) => id !== industryId)
        : [...prev, industryId]
    )
  }

  
  const filteredNews = mockNews.filter((news) => {
    const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(news.category)
    const industryMatch = selectedIndustries.length === 0 || selectedIndustries.some((id) => (news.industries as readonly string[]).includes(id))
    return categoryMatch && industryMatch
  })

  return (
    <main className="min-h-screen">
      <Header />
      <div className="pt-14 ">
        {/* Hero Section with Banner Image */}
        <section className="relative h-[280px] md:h-[320px] overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center">
            <img src="/assets/images/news/news-banner.jpg" alt="News Banner" className="w-full h-full object-cover" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
          <div key={i18n.language} className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{t('news.heroTitle')}</h1>
            <p className="text-white/80 max-w-2xl text-lg">
              {t('news.heroDescription')}
            </p>
          </div>
        </section>

        {/* Filter Section */}
        <section className="bg-body-bg-dark  border-b border-border sticky top-14 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Main Category Tabs */}
            <div className="flex items-center justify-between py-4">
              <div className="flex bg-body-bg-dark-button items-center gap-2 overflow-x-auto">
                {newsCategories.map((category) => {
                  const isSelected =
                    category.id === 'all'
                      ? selectedCategories.length === 0
                      : selectedCategories.includes(category.id)
                  return (
                    <button
                      key={category.id}
                      onClick={() => toggleCategory(category.id)}
                      className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'text-black hover:opacity-80'
                      }`}
                      style={
                        !isSelected
                          ? { backgroundColor: 'var(--color-body-bg-dark-button)' }
                          : undefined
                      }
                    >
                      {getCategoryName(category.id)}
                    </button>
                  )
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowIndustryFilter(!showIndustryFilter)}
                className={`!border-header-red-dark hover:!bg-header-red-dark/80 hover:!text-white ${showIndustryFilter ? '!border-header-red-dark text-primary ' : ''}`}
              >
                <Filter className="w-4 h-4 mr-2" />
                {t('news.industryFilter')}
                {selectedIndustries.length > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 bg-primary text-primary-foreground text-xs rounded ">
                    {selectedIndustries.length}
                  </span>
                )}
              </Button>
            </div>

            {/* Industry Filter (Expandable) */}
            {showIndustryFilter && (
              <div className="pb-4 border-t border-border pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm text-muted-foreground">{t('news.industryCategory')}</span>
                  {selectedIndustries.length > 0 && (
                    <button
                      onClick={() => setSelectedIndustries([])}
                      className="text-xs text-primary hover:underline"
                    >
                      {t('news.clearAll')}（{selectedIndustries.length}）
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {industryCategories.map((industry) => {
                    const isSelected = selectedIndustries.includes(industry.id)
                    return (
                      <button
                        key={industry.id}
                        onClick={() => toggleIndustry(industry.id)}
                        className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                          isSelected
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background text-muted-foreground border-border hover:border-primary hover:text-primary'
                        }`}
                      >
                        {getIndustryName(industry.id)}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* News List */}
        <section className="bg-body-bg-dark">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {filteredNews.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground">{t('news.noNews')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNews.map((news) => {
                const newsTitle = t(`news.items.${news.id}.title`, { defaultValue: news.title })
                const newsExcerpt = t(`news.items.${news.id}.excerpt`, { defaultValue: news.excerpt })
                const author = news.category === 'regulation' ? t('news.authorRegulation') : t('news.author')

                return (
                  <Link
                    key={news.id}
                    href={`/news/${news.id}`}
                    className="group bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {/* Image */}
                    <div className="relative aspect-[16/9] bg-muted overflow-hidden">
                      <img
                        src={news.image || '/placeholder.svg'}
                        alt={newsTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Category Badge */}
                      <div className="absolute top-3 left-3">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            news.category === 'life'
                              ? 'bg-green-100 text-green-700'
                              : news.category === 'travel'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {getCategoryName(news.category)}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      {/* Date */}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <Calendar className="w-3 h-3" />
                        <span>{news.date}</span>
                        <span className="mx-1">|</span>
                        <span>{author}</span>
                      </div>

                      {/* Title */}
                      <h3 className="font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {newsTitle}
                      </h3>

                      {/* Excerpt */}
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{newsExcerpt}</p>

                      {/* Industry Tags */}
                      <div className="flex flex-nowrap gap-1.5 overflow-hidden">
                        {news.industries.slice(0, 2).map((industryId) => (
                          <span
                            key={industryId}
                            className="px-2 py-0.5 text-xs text-black rounded whitespace-nowrap"
                            style={{ backgroundColor: 'var(--color-body-bg-dark-button)' }}
                          >
                            {getIndustryName(industryId)}
                          </span>
                        ))}
                        {news.industries.length > 2 && (
                          <span 
                            className="px-2 py-0.5 text-xs text-black rounded whitespace-nowrap"
                            style={{ backgroundColor: 'var(--color-body-bg-dark-button)' }}
                          >
                            +{news.industries.length - 2}
                          </span>
                        )}
                      </div>

                      {/* Read More */}
                      <div className="flex items-center text-primary text-sm mt-3 group-hover:underline">
                        {t('news.readMore')}
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </div>
                    </div>
                  </Link>
                )
              })}
              </div>
            )}
          </div>
        </section>

        <Footer />
      </div>
    </main>
  )
}
