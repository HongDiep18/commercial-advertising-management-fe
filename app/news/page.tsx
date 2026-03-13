import { Suspense } from "react"
import type { Metadata } from "next"
import Header from "../../src/components/layout/Header"
import Footer from "../../src/components/layout/Footer"
import { NewsListClient } from "../../src/components/news/NewsListClient"
import { NewsPageSkeleton } from "../../src/components/news/NewsPageSkeleton"
import { getServerNewsList, getServerNewsCategories } from "../../src/api/newsServer"

export const metadata: Metadata = {
  title: "News | VN Buyer Guide",
  description: "Cập nhật tin tức mới nhất về thị trường Việt Nam – doanh nghiệp, đầu tư và hơn thế nữa.",
  openGraph: {
    title: "Tin tức | VN Buyer Guide",
    description: "Cập nhật tin tức mới nhất về thị trường Việt Nam.",
    type: "website",
  },
}

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string; subcategory?: string }>
}) {
  const { page: pageStr, category: categorySlug, subcategory: subcategoryId } = await searchParams
  const page = Math.max(1, Number(pageStr ?? "1") || 1)

  const [initialNews, initialCategories] = await Promise.all([
    getServerNewsList(page, 6, { categorySlug, subcategoryId }),
    getServerNewsCategories(),
  ])

  const initialData = {
    news: initialNews.data,
    categories: initialCategories,
    total: initialNews.total ?? 0,
    totalPages: initialNews.totalPages ?? 1,
  }

  return (
    <main className="min-h-screen">
      <Header />
      <div className="pt-14">
        <Suspense fallback={<NewsPageSkeleton />}>
          <NewsListClient initialData={initialData} />
        </Suspense>

        <Footer />
      </div>
    </main>
  )
}
