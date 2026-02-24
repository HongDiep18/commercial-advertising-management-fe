'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import { Calendar, Tag, ArrowLeft, Share2, Printer, User, Clock } from 'lucide-react'
import Header from '../../../src/components/layout/Header'
import Footer from '../../../src/components/layout/Footer'
import Button from '../../../src/components/ui/Button'
import { mockNews } from '../../../src/data/newsMockData'
import { newsContent } from '../../../src/data/newsContent'


function ContentRenderer({ content }: { content: string }) {
  const paragraphs = content.split('\n\n')

  return (
    <div className="space-y-6">
      {paragraphs.map((paragraph, index) => {
        
        if (paragraph.startsWith('## ')) {
          return (
            <h2
              key={index}
              className="text-xl font-bold text-foreground mt-8 mb-4 pb-2 border-b border-border"
            >
              {paragraph.replace('## ', '')}
            </h2>
          )
        }

        
        if (paragraph.startsWith('### ')) {
          return (
            <h3 key={index} className="text-lg font-semibold text-foreground mt-6 mb-3">
              {paragraph.replace('### ', '')}
            </h3>
          )
        }

        
        if (paragraph.startsWith('| ')) {
          const rows = paragraph.split('\n').filter((row) => !row.startsWith('|---'))
          return (
            <div key={index} className="overflow-x-auto my-6">
              <table className="min-w-full border border-border rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-muted">
                    {rows[0]
                      ?.split('|')
                      .filter((cell) => cell.trim())
                      .map((cell, cellIndex) => (
                        <th
                          key={cellIndex}
                          className="px-4 py-3 text-left text-sm font-semibold text-foreground border-b border-border"
                        >
                          {cell.trim()}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(1).map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className={rowIndex % 2 === 0 ? 'bg-background' : 'bg-muted/30'}
                    >
                      {row
                        .split('|')
                        .filter((cell) => cell.trim())
                        .map((cell, cellIndex) => (
                          <td
                            key={cellIndex}
                            className="px-4 py-3 text-sm text-muted-foreground border-b border-border"
                          >
                            {cell.trim()}
                          </td>
                        ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }

        
        if (paragraph.startsWith('1. ') || paragraph.startsWith('- ')) {
          const items = paragraph.split('\n')
          const isOrdered = paragraph.startsWith('1. ')

          return (
            <ul
              key={index}
              className={`my-4 space-y-2 ${isOrdered ? 'list-decimal' : 'list-disc'} list-outside ml-6`}
            >
              {items.map((item, itemIndex) => {
                const cleanItem = item.replace(/^[\d]+\.\s|^-\s/, '')
                return (
                  <li key={itemIndex} className="text-muted-foreground leading-relaxed">
                    {cleanItem.split('**').map((part, partIndex) =>
                      partIndex % 2 === 1 ? (
                        <strong key={partIndex} className="text-foreground font-semibold">
                          {part}
                        </strong>
                      ) : (
                        part
                      )
                    )}
                  </li>
                )
              })}
            </ul>
          )
        }

        
        if (
          paragraph.startsWith('*') &&
          paragraph.endsWith('*') &&
          !paragraph.includes('**')
        ) {
          return (
            <p key={index} className="text-sm text-muted-foreground italic my-2">
              {paragraph.replace(/^\*|\*$/g, '')}
            </p>
          )
        }

        
        return (
          <p key={index} className="text-muted-foreground leading-relaxed">
            {paragraph.split('**').map((part, partIndex) =>
              partIndex % 2 === 1 ? (
                <strong key={partIndex} className="text-foreground font-semibold">
                  {part}
                </strong>
              ) : (
                part
              )
            )}
          </p>
        )
      })}
    </div>
  )
}

export default function NewsDetailPage() {
  const params = useParams()
  const { t } = useTranslation()
  const id = params.id as string
  const news = mockNews.find((n) => n.id === id)
  const content = newsContent[id] || ''
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  const getCategoryName = (categoryId: string) => {
    return t(`news.categories.${categoryId}`, { defaultValue: categoryId })
  }

  const getCategoryStyle = (categoryId: string) => {
    switch (categoryId) {
      case 'life':
        return 'bg-green-100 text-green-700'
      case 'travel':
        return 'bg-blue-100 text-blue-700'
      case 'regulation':
        return 'bg-amber-100 text-amber-700'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const getIndustryName = (industryId: string) => {
    return t(`directory.categories.${industryId}`, { defaultValue: industryId })
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: news?.title || '',
          text: news?.excerpt || '',
          url: window.location.href,
        })
      } catch (err) {
        console.error(err)
      }
    } else {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleBackToNews = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!news) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="pt-14">
          <div className="max-w-4xl mx-auto px-4 py-16 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-muted-foreground">?</span>
            </div>
            <h1 className="text-2xl font-bold mb-4">{t('news.notFound', { defaultValue: '找不到此新聞' })}</h1>
            <p className="text-muted-foreground mb-6">
              {t('news.notFoundDescription', {
                defaultValue: '您要查看的新聞可能已被移除或連結有誤',
              })}
            </p>
            <Link href="/news">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('news.backToList', { defaultValue: '返回新聞列表' })}
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  const newsTitle = t(`news.items.${news.id}.title`, { defaultValue: news.title })
  const newsExcerpt = t(`news.items.${news.id}.excerpt`, { defaultValue: news.excerpt })
  const author =
    news.category === 'regulation'
      ? t('news.authorRegulation')
      : t('news.author')

  return (
    <main className="min-h-screen bg-body-bg-dark">
      <Header />
      <div className="pt-14">
        {/* Hero Image */}
        <div className="relative h-[300px] md:h-[400px] overflow-hidden">
          <img
            src={news.image || '/placeholder.svg'}
            alt={newsTitle}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          {/* Back Button */}
          <div className="absolute top-4 left-4">
            <Link
              href="/news"
              onClick={handleBackToNews}
              className="inline-flex items-center px-3 py-2 bg-black/50 hover:bg-black/70 text-white text-sm rounded-lg backdrop-blur-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('news.backToList', { defaultValue: '返回最新消息' })}
            </Link>
          </div>

          {/* Category Badge on Image */}
          <div className="absolute bottom-6 left-4 md:left-8">
            <span
              className={`px-3 py-1.5 text-sm font-medium rounded-lg ${getCategoryStyle(news.category)}`}
            >
              {getCategoryName(news.category)}
            </span>
          </div>
        </div>

        {/* Article Content */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 pb-16">
          {/* Article Card */}
          <div className="bg-body-bg-light rounded-xl shadow-lg border border-border overflow-hidden">
            {/* Header */}
            <div className="p-6 md:p-8 border-b border-border">
              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4 leading-tight">
                {newsTitle}
              </h1>

              {/* Meta Info */}
              <div className="flex items-center flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {news.date}
                </span>
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  {author}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {t('news.readTime', { defaultValue: '閱讀時間' })} {t(`news.items.${news.id}.readTime`, { defaultValue: '5 分鐘' })}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-4 ">
                <Button variant="outline" size="sm" onClick={handleShare} className="border !border-gray-500 !bg-body-bg-dark hover:!bg-header-red-dark/80 hover:!text-white">
                  <Share2 className="w-4 h-4 mr-2 " />
                  {copied
                    ? t('news.linkCopied', { defaultValue: '已複製連結' })
                    : t('news.share', { defaultValue: '分享' })}
                </Button>
                <Button variant="outline" size="sm" onClick={handlePrint} className="border !border-gray-500 !bg-body-bg-dark hover:!bg-header-red-dark/80 hover:!text-white">
                  <Printer className="w-4 h-4 mr-2" />
                  {t('news.print', { defaultValue: '列印' })}
                </Button>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 md:p-8">
              {/* Excerpt */}
              <div className="bg-body-bg-dark rounded-lg p-4 mb-8 border-l-4 border-primary">
                <p className="text-foreground font-medium">{newsExcerpt}</p>
              </div>

              {/* Main Content */}
              <ContentRenderer content={content} />
            </div>

            {/* Footer - Industry Tags */}
            <div className="p-6 md:p-8 bg-body-bg-dark border-t border-border">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">
                  {t('news.relatedIndustries', { defaultValue: '相關行業分類' })}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {news.industries.map((industryId) => {
                  return (
                    <Link
                      key={industryId}
                      href={`/directory?category=${industryId}`}
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                      className="px-3 py-1.5 text-sm text-muted-foreground rounded-full border border-border !bg-body-bg-light hover:!bg-header-red-dark hover:text-primary-foreground hover:border-primary transition-colors"
                    >
                      {getIndustryName(industryId)}
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </article>

        <Footer />
      </div>
    </main>
  )
}
