"use client"

import { useTranslation } from "react-i18next"

const STATUS_KEYS = [
  "pending",
  "approved",
  "rejected",
  "active",
  "draft",
  "paused",
  "published",
  "sold",
  "suspended",
  "new",
  "contacted",
  "closed",
] as const

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  active: "bg-green-100 text-green-700",
  draft: "bg-slate-100 text-slate-700",
  paused: "bg-amber-100 text-amber-700",
  published: "bg-green-100 text-green-700",
  sold: "bg-blue-100 text-blue-700",
  suspended: "bg-red-100 text-red-700",
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-amber-100 text-amber-700",
  closed: "bg-green-100 text-green-700",
}

export function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation()
  const label = STATUS_KEYS.includes(status as (typeof STATUS_KEYS)[number])
    ? t(`admin.status.${status}`)
    : status
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status] || "bg-muted text-muted-foreground"}`}
    >
      {label}
    </span>
  )
}
