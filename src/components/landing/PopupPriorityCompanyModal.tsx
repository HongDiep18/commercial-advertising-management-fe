"use client"

import { usePopupPriorityCompanies } from "@/api/active-ads/hooks"
import Button from "@/components/ui/Button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/shadcn-dialog/dialog"
import { Building2, ExternalLink, X } from "lucide-react"
import Link from "next/link"
import { VisuallyHidden } from "radix-ui"
import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

const ROTATION_INTERVAL_MS = 10_000
const STORAGE_KEY = "popup-priority-hidden-date"

function getTodayKey(): string {
  return new Date().toDateString()
}

export default function PopupPriorityCompanyModal() {
  const { t } = useTranslation()
  const { data } = usePopupPriorityCompanies()
  const companies = useMemo(() => data ?? [], [data])
  const [activeCompanyIndex, setActiveCompanyIndex] = useState<number>(0)
  const [open, setOpen] = useState(false)
  const [isHiddenToday, setIsHiddenToday] = useState<boolean>(() => {
    if (typeof window === "undefined") return false
    const hiddenDate = window.localStorage.getItem(STORAGE_KEY)
    return hiddenDate === getTodayKey()
  })

  const safeCompanyIndex = companies.length === 0 ? 0 : Math.min(activeCompanyIndex, companies.length - 1)

  useEffect(() => {
    if (companies.length === 0) return
    if (isHiddenToday) return
    const timer = window.setTimeout(() => setOpen(true), 500)
    return () => window.clearTimeout(timer)
  }, [companies.length, isHiddenToday])

  useEffect(() => {
    if (!open) return
    if (companies.length <= 1) return
    const timer = window.setInterval(() => {
      setActiveCompanyIndex((prevIndex) => (prevIndex + 1) % companies.length)
    }, ROTATION_INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [companies.length, open])

  const handleClose = () => setOpen(false)

  const handleHideToday = () => {
    localStorage.setItem(STORAGE_KEY, getTodayKey())
    setIsHiddenToday(true)
    setOpen(false)
  }

  const company = companies[safeCompanyIndex] ?? null
  if (!company || isHiddenToday) return null

  const href = company.adLinkUrl || `/directory/${company.id}`

  if (!open) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        showCloseButton={false}
        className="bg-card border-border w-full max-w-lg gap-2 overflow-hidden rounded-xl border p-0 shadow-2xl"
      >
        <VisuallyHidden.Root>
          <DialogTitle>{company.name}</DialogTitle>
        </VisuallyHidden.Root>
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
          aria-label={t("popupPriority.close")}
          type="button"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="bg-muted relative aspect-[4/3] overflow-hidden">
          <img
            src={"/assets/images/professional-business-conference-with-people-netwo.jpg"}
            alt={company.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute right-4 bottom-4 left-4">
            <span className="bg-primary text-primary-foreground mb-2 inline-block rounded px-2 py-1 text-xs font-medium">
              {t("popupPriority.heroBadge")}
            </span>
            <h3 className="mb-1 text-xl font-bold text-white">{t("popupPriority.heroTitle")}</h3>
            <p className="text-sm text-white/80">{t("popupPriority.heroDescription")}</p>
          </div>
        </div>

        <div className="px-5 pt-3 pb-5">
          <div className="mb-4 flex items-center gap-3">
            {company.logoUrl ? (
              <div className="border-border h-10 w-10 shrink-0 overflow-hidden rounded-lg border">
                <img
                  src={company.logoUrl}
                  alt={company.name}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="bg-primary/10 text-primary border-border flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border">
                <Building2 className="h-5 w-5" />
              </div>
            )}

            <div className="min-w-0">
              <p className="text-foreground truncate text-sm font-semibold">{company.name}</p>
              <p className="text-muted-foreground truncate text-xs">
                {t("directory.categories." + company.industry)}
              </p>
            </div>
          </div>

          <p className="text-muted-foreground line-clamp-3 text-sm">{company.description}</p>

          <div className="mt-4 flex gap-2">
            <Button variant="primary" className="flex-1" asChild>
              <Link href={href} target={company.adLinkUrl ? "_blank" : undefined}>
                {t("popupPriority.view")}
                <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
            <Button variant="outline" className="flex-1" onClick={handleClose}>
              {t("popupPriority.close")}
            </Button>
          </div>

          <button
            onClick={handleHideToday}
            className="text-muted-foreground hover:text-foreground mt-3 w-full py-1 text-center text-xs transition-colors"
            type="button"
          >
            {t("popupPriority.hideToday")}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
