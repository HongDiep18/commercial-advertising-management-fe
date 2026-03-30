"use client"

import { useAdOrderPreview } from "@/api/ad-orders/hooks"
import HomePageClient from "@/components/landing/HomePageClient"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

const PREVIEW_KEY = "pendingPreview"

export default function AdPreviewPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const router = useRouter()
  const { t } = useTranslation()
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null)
  // Prevents React 18 Strict Mode's double-invoke from clearing localStorage
  // on the first run and failing on the second run.
  const checkedRef = useRef(false)

  useEffect(() => {
    if (checkedRef.current) return
    checkedRef.current = true

    const pending = localStorage.getItem(PREVIEW_KEY)
    const allowed = pending === orderId
    if (allowed) localStorage.removeItem(PREVIEW_KEY)
    queueMicrotask(() => setIsAllowed(allowed))
  }, [orderId])

  const { data, isLoading, isError } = useAdOrderPreview(
    isAllowed === true ? orderId : ""
  )

  if (isAllowed === null) return null

  if (!isAllowed) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-lg font-semibold">{t("adPreview.notAccessibleTitle")}</p>
        <p className="text-muted-foreground text-sm">{t("adPreview.notAccessibleDesc")}</p>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-primary text-sm underline-offset-2 hover:underline"
        >
          {t("adPreview.goBack")}
        </button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground text-sm">{t("adPreview.loading")}</p>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-lg font-semibold">{t("adPreview.errorTitle")}</p>
        <p className="text-muted-foreground text-sm">{t("adPreview.errorDesc")}</p>
      </div>
    )
  }

  return (
    <HomePageClient
      previewOrderId={orderId}
      previewPopupPriority={data.popupPriority}
      previewPopupRotational={data.popupRotational}
      previewFeaturedCompanies={data.featuredCompanies}
    />
  )
}
