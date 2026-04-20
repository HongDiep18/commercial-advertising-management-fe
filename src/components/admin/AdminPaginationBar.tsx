"use client"

import Button from "@/components/ui/Button"
import type { Dispatch, SetStateAction } from "react"
import { useTranslation } from "react-i18next"

export type AdminPaginationBarProps = {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  setPage: Dispatch<SetStateAction<number>>
}

export function AdminPaginationBar({ pagination, setPage }: AdminPaginationBarProps) {
  const { t } = useTranslation()

  return (
    <div className="flex items-center justify-between text-sm">
      <p className="text-muted-foreground text-xs">
        {t("admin.pagination.rangeOf", {
          from: (pagination.page - 1) * pagination.limit + 1,
          to: Math.min(pagination.page * pagination.limit, pagination.total),
          total: pagination.total,
          defaultValue: "{{from}}–{{to}} of {{total}}",
        })}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          disabled={pagination.page <= 1}
          onClick={() => setPage((p) => p - 1)}
        >
          {t("admin.pagination.previous", { defaultValue: "Previous" })}
        </Button>
        <span className="text-muted-foreground text-xs">
          {t("admin.pagination.pageOfTotal", {
            page: pagination.page,
            totalPages: pagination.totalPages,
            defaultValue: "{{page}} / {{totalPages}}",
          })}
        </span>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          disabled={pagination.page >= pagination.totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          {t("admin.pagination.next", { defaultValue: "Next" })}
        </Button>
      </div>
    </div>
  )
}
