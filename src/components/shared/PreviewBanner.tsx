"use client"

import { Eye, X } from "lucide-react"
import { useTranslation } from "react-i18next"

type Props = {
  orderId: string
}

export default function PreviewBanner({ orderId }: Props) {
  const { t } = useTranslation()

  return (
    <div className="flex h-10 items-center justify-between bg-amber-400 px-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-amber-900">
        <Eye className="h-4 w-4 shrink-0" />
        <span>
          {t("previewBanner.previewMode")} —{" "}
          <span className="font-mono text-xs font-normal opacity-70">
            {t("previewBanner.order")} {orderId.slice(0, 8)}…
          </span>
        </span>
      </div>
      <button
        type="button"
        onClick={() => window.close()}
        className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-amber-900 transition-colors hover:bg-amber-500"
      >
        <X className="h-3.5 w-3.5" />
        {t("previewBanner.close")}
      </button>
    </div>
  )
}
