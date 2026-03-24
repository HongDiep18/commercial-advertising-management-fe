"use client"

import { useTranslation } from "react-i18next"

const STATUS_KEYS = [
  "pending",
  "approved",
  "rejected",
  "active",
  "available",
  "draft",
  "paused",
  "published",
  "unpublished",
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
  available: "bg-emerald-100 text-emerald-700",
  draft: "bg-slate-100 text-slate-700",
  paused: "bg-amber-100 text-amber-700",
  published: "bg-green-100 text-green-700",
  unpublished: "bg-slate-200 text-slate-700",
  sold: "bg-blue-100 text-blue-700",
  suspended: "bg-red-100 text-red-700",
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-amber-100 text-amber-700",
  closed: "bg-green-100 text-green-700",
}

export function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation()
  const key = status.toLowerCase()
  const label = STATUS_KEYS.includes(key as (typeof STATUS_KEYS)[number])
    ? t(`admin.status.${key}`)
    : status
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[key] || "bg-muted text-muted-foreground"}`}
    >
      {label}
    </span>
  )
}
