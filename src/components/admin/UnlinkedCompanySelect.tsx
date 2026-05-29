"use client"

import { useMemo, useState } from "react"
import { Building2, Check, ChevronDown, RefreshCw, Search } from "lucide-react"
import { useTranslation } from "react-i18next"

import type { AdminUnlinkedCompanyItem, AdminUnlinkedCompanyStatus } from "@/api/admin-companies/types"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover"
import { cn } from "@/lib/utils"

function primaryCompanyName(c: AdminUnlinkedCompanyItem): string {
  return (
    c.companyNameVi?.trim() ||
    c.companyNameEn?.trim() ||
    c.companyNameZh?.trim() ||
    c.taxId?.trim() ||
    c.id
  )
}

function secondaryCompanyLine(c: AdminUnlinkedCompanyItem): string | null {
  const primary = primaryCompanyName(c)
  const names = [c.companyNameVi, c.companyNameEn, c.companyNameZh]
    .map((n) => n?.trim())
    .filter((n): n is string => Boolean(n))
  const others = [...new Set(names)].filter((n) => n !== primary)
  return others.length > 0 ? others.join(" · ") : null
}

function companyEmail(c: AdminUnlinkedCompanyItem): string | null {
  const row = c.contacts?.find((ct) => String(ct.type).toLowerCase() === "email")
  return row?.value?.trim() || null
}

function statusBadgeClass(status: AdminUnlinkedCompanyStatus | string): string {
  switch (status) {
    case "APPROVED":
      return "border-emerald-200 bg-emerald-50 text-emerald-800"
    case "PENDING":
      return "border-amber-200 bg-amber-50 text-amber-900"
    case "REJECTED":
      return "border-red-200 bg-red-50 text-red-800"
    case "DELETED":
      return "border-border bg-muted text-muted-foreground"
    default:
      return "border-border bg-muted text-muted-foreground"
  }
}

type Props = {
  value: string
  onValueChange: (companyId: string) => void
  companies: AdminUnlinkedCompanyItem[]
  isLoading?: boolean
  isError?: boolean
  disabled?: boolean
  onRetry?: () => void
}

export function UnlinkedCompanySelect({
  value,
  onValueChange,
  companies,
  isLoading = false,
  isError = false,
  disabled = false,
  onRetry,
}: Props) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  const selected = useMemo(
    () => (value ? companies.find((c) => c.id === value) : undefined),
    [companies, value]
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return companies
    return companies.filter((c) => {
      const haystack = [
        primaryCompanyName(c),
        secondaryCompanyLine(c),
        c.taxId,
        c.country,
        companyEmail(c),
        c.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [companies, query])

  const triggerLabel = selected ? primaryCompanyName(selected) : null
  const isDisabled = disabled || isLoading || isError

  return (
    <Popover open={open} onOpenChange={(next) => !isDisabled && setOpen(next)}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={isDisabled}
          className={cn(
            "border-border bg-body-bg-light ring-offset-background focus:ring-primary flex h-10 w-full min-w-0 items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none",
            isDisabled && "pointer-events-none cursor-not-allowed bg-gray-100 opacity-60"
          )}
        >
          <span className="flex min-w-0 flex-1 items-center gap-2 text-left">
            <Building2 className="text-muted-foreground h-4 w-4 shrink-0" />
            <span
              className={cn("min-w-0 truncate", triggerLabel ? "text-foreground" : "text-muted-foreground")}
            >
              {isLoading
                ? t("common.loading", { defaultValue: "Loading..." })
                : isError
                  ? t("admin.users.companyListLoadError", {
                      defaultValue: "Unable to load companies.",
                    })
                  : triggerLabel ||
                    t("admin.users.companySearchPlaceholder", {
                      defaultValue: "Select a company without a user account...",
                    })}
            </span>
          </span>
          <ChevronDown
            className={cn("h-4 w-4 shrink-0 transition-transform", open && "rotate-180")}
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={6}
        className="z-[100] w-[min(100vw-2rem,32rem)] min-w-[var(--radix-popover-trigger-width,18rem)] p-0"
      >
        <div className="border-border flex flex-col gap-2 border-b p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-foreground text-sm font-medium">
              {t("admin.users.unlinkedCompanyListTitle", {
                defaultValue: "Companies without a user",
              })}
            </p>
            {!isLoading && !isError && (
              <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                {t("admin.users.unlinkedCompanyListCount", {
                  count: companies.length,
                  defaultValue: "{{count}} available",
                })}
              </span>
            )}
          </div>
          <div className="relative">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("common.search", { defaultValue: "Search" })}
              className="h-9 pl-8"
              disabled={isLoading || isError}
            />
          </div>
        </div>

        <div className="max-h-72 overflow-y-auto p-2">
          {isLoading ? (
            <div className="space-y-2 p-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-muted/60 h-14 animate-pulse rounded-md" />
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center gap-3 px-4 py-6 text-center">
              <p className="text-muted-foreground text-sm">
                {t("admin.users.companyListLoadError", {
                  defaultValue: "Unable to load companies.",
                })}
              </p>
              {onRetry ? (
                <Button type="button" variant="outline" size="sm" onClick={() => onRetry()}>
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                  {t("common.retry", { defaultValue: "Retry" })}
                </Button>
              ) : null}
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground px-3 py-6 text-center text-sm">
              {query.trim()
                ? t("common.noResults", { defaultValue: "No results." })
                : t("admin.users.noUnlinkedCompanies", {
                    defaultValue: "No companies without a user account.",
                  })}
            </p>
          ) : (
            <ul className="space-y-1" role="listbox">
              {filtered.map((c) => {
                const isSelected = value === c.id
                const secondary = secondaryCompanyLine(c)
                const email = companyEmail(c)
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      className={cn(
                        "hover:bg-secondary flex w-full items-start gap-2 rounded-md border px-2.5 py-2 text-left transition-colors",
                        isSelected
                          ? "border-primary/30 bg-primary/5 ring-primary/20 ring-1"
                          : "border-transparent"
                      )}
                      onClick={() => {
                        onValueChange(c.id)
                        setOpen(false)
                        setQuery("")
                      }}
                    >
                      <span className="mt-0.5 flex w-5 shrink-0 justify-center">
                        {isSelected ? (
                          <Check className="text-primary h-4 w-4" />
                        ) : (
                          <Building2 className="text-muted-foreground h-4 w-4" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="text-foreground line-clamp-2 text-sm font-medium">
                          {primaryCompanyName(c)}
                        </span>
                        {secondary ? (
                          <span className="text-muted-foreground mt-0.5 block truncate text-xs">
                            {secondary}
                          </span>
                        ) : null}
                        <span className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
                          {c.taxId ? (
                            <span>
                              {t("admin.users.companyTaxIdShort", {
                                defaultValue: "Tax ID",
                              })}
                              : {c.taxId}
                            </span>
                          ) : null}
                          {email ? <span className="truncate">{email}</span> : null}
                        </span>
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "mt-0.5 shrink-0 rounded-md px-1.5 py-0 text-[10px] font-medium",
                          statusBadgeClass(c.status)
                        )}
                      >
                        {t(`admin.users.companyStatus.${c.status}`, { defaultValue: c.status })}
                      </Badge>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
