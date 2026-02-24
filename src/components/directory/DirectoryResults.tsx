'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { categories } from './DirectorySidebar'
import { useUser, MEMBERSHIP_THRESHOLDS } from '../../contexts/user-context'
import Button from '../ui/Button'
import { maskCompanyName } from '../../utils/companyHelpers'
import { useTranslation } from 'react-i18next'



const generateCompaniesForCategory = (categoryId: string, categoryName: string, count: number, t: (key: string, options?: { defaultValue?: string }) => string) => {
  const companyPrefixes: Record<string, string> = {
    textile: '紡織',
    shoes: '鞋業',
    vehicle: '汽車零件',
    furniture: '家具',
    construction: '建材',
    electronics: '電子',
    machinery: '機械',
    plastic: '塑膠',
    agriculture: '農業',
    metal: '金屬',
    paper: '紙器包裝',
    logistics: '物流',
    finance: '金融',
    gifts: '禮品',
    tourism: '旅遊',
    food: '食品',
    education: '教育',
    other: '服務',
  }

  const prefix = companyPrefixes[categoryId] || '公司'

  return Array.from({ length: count }, (_, i) => {
    const companyId = `${categoryId}-${i + 1}`

    
    if (companyId === 'textile-1') {
      return {
        id: companyId,
        name: t(`companyDetail.companies.${companyId}.nameCn`, { defaultValue: '力鑫工業責任有限公司' }),
        category: categoryName,
        image: '/assets/images/companies/TNHH-LI-SHIN.png',
      }
    }

    
    if (companyId === 'textile-2') {
      return {
        id: companyId,
        name: t(`companyDetail.companies.${companyId}.nameCn`, { defaultValue: '越南立春責任有限公司' }),
        category: categoryName,
        image: '/assets/images/companies/CTY-FASWELL-VN.png',
      }
    }

    
    if (companyId === 'finance-1') {
      return {
        id: companyId,
        name: t(`companyDetail.companies.${companyId}.nameCn`, { defaultValue: '星展銀行（越南）有限公司' }),
        category: categoryName,
        image: '/assets/images/companies/DBS.jpg',
      }
    }

    
    if (companyId === 'machinery-1') {
      return {
        id: companyId,
        name: t(`companyDetail.companies.${companyId}.nameCn`, { defaultValue: '蔡雄商業有限公司' }),
        category: categoryName,
        image: '/assets/images/companies/tsaihsiung-construction.jpg',
      }
    }

    return {
      id: companyId,
      name: t(`companyDetail.companies.${companyId}.nameCn`, { defaultValue: `${prefix}公司 ${i + 1}` }),
      category: categoryName,
      image: '/assets/images/companies/product-design-concept.png',
    }
  })
}



interface DirectoryResultsProps {
  selectedCategory: string | null
  searchTerm: string
  setSearchTerm: (term: string) => void
}

const ITEMS_PER_PAGE = 20


function SearchBar({ searchTerm, setSearchTerm }: { searchTerm: string; setSearchTerm: (term: string) => void }) {
  const { t } = useTranslation()
  return (
    <div className="mb-6">
      <div className="relative max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder={t('directory.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-400 rounded-lg bg-body-bg-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 text-sm transition-all"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-sm"
          >
            {t('directory.clear')}
          </button>
        )}
      </div>
    </div>
  )
}

export function DirectoryResults({ selectedCategory, searchTerm, setSearchTerm }: DirectoryResultsProps) {
  const { t, i18n } = useTranslation()
  const { user, isLoggedIn, getTotalPoints } = useUser()
  
  
  
  const totalPoints = getTotalPoints()
  const isGuest = !isLoggedIn || !user || totalPoints < MEMBERSHIP_THRESHOLDS.bronze

  
  const companiesByCategory = useMemo(() => {
    const result: Record<string, ReturnType<typeof generateCompaniesForCategory>> = {}
    categories.forEach((cat) => {
      const translatedName = t(`directory.categories.${cat.id}`, { defaultValue: cat.name })
      const count = Math.min(cat.count, 100) 
      result[cat.id] = generateCompaniesForCategory(cat.id, translatedName, count, t)
    })
    return result
  }, [t])
  
  const filterKey = `${selectedCategory || ''}-${searchTerm}`
  const [pageState, setPageState] = useState<{ key: string; page: number }>({ key: filterKey, page: 1 })
  
  
  if (pageState.key !== filterKey) {
    setPageState({ key: filterKey, page: 1 })
  }
  
  const currentPage = pageState.page
  const setCurrentPage = (page: number) => setPageState((prev) => ({ ...prev, page }))

  
  const currentCompanies = selectedCategory ? companiesByCategory[selectedCategory] || [] : []

  
  const filteredCompanies = searchTerm
    ? currentCompanies.filter(
        (company) =>
          company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          company.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : currentCompanies

  const currentCategory = selectedCategory ? categories.find((c) => c.id === selectedCategory) : null
  
  const displayTotalResults = searchTerm ? filteredCompanies.length : (currentCategory?.count || 0)
  
  const totalResults = filteredCompanies.length
  const totalPages = Math.ceil(totalResults / ITEMS_PER_PAGE)

  
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const displayedCompanies = filteredCompanies.slice(startIndex, endIndex)

  
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  
  if (!selectedCategory) {
    return (
      <section>
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">{t('directory.selectCategory')}</h2>
          <p className="text-muted-foreground max-w-md">
            {t('directory.selectCategoryDescription')}
          </p>
        </div>
      </section>
    )
  }

  return (
    <section>
      {/* Search Bar */}
      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      {/* Header with category and count */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
        <h2 key={i18n.language} className="text-xl font-semibold">
          {currentCategory ? t(`directory.categories.${currentCategory.id}`, { defaultValue: currentCategory.name }) : ''}
        </h2>
        <span className="text-sm text-muted-foreground">{displayTotalResults.toLocaleString()} {t('directory.results')}</span>
      </div>

      {/* No results message */}
      {filteredCompanies.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t('directory.noResults')}</p>
        </div>
      ) : (
        <>
          {/* Company Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {displayedCompanies.map((company) => (
              <Link
                key={company.id}
                href={`/directory/${company.id}${selectedCategory ? `?fromCategory=${encodeURIComponent(selectedCategory)}` : ''}`}
                className="group"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-muted rounded-sm mb-2">
                  <img
                    src={company.image || '/placeholder.svg'}
                    alt={company.name}
                    className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${isGuest ? 'blur-[3px]' : ''}`}
                  />
                </div>
                <h3 className="text-xs font-medium group-hover:underline line-clamp-2">
                  {isGuest ? maskCompanyName(company.name) : company.name}
                </h3>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-end gap-2 mt-8 pt-6 border-t border-gray-300">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-9 w-9 p-0 border border-gray-500 bg-background"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {/* Page numbers */}
              <div className="flex items-center gap-1 ">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className={`h-9 w-9 p-0 ${currentPage === pageNum ? 'bg-header-red-dark hover:bg-header-red-dark/100' : 'border border-gray-400 bg-background hover:!bg-header-red-dark hover:!text-white'}`}
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-9 w-9 p-0 border border-gray-400"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              {/* Page jump selector */}
              <select
                value={currentPage}
                onChange={(e) => handlePageChange(Number(e.target.value))}
                className="h-9 px-2 border border-gray-400 rounded-md bg-body-bg-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {Array.from({ length: totalPages }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>
          )}
        </>
      )}
    </section>
  )
}
