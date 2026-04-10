"use client"

import { useMemo, useState } from "react"
import { Check, ChevronDown } from "lucide-react"

import Input from "@/components/ui/Input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover"

export type SearchableMultiSelectOption = { value: string; label: string }

type Props = {
  value: string[]
  onValueChange: (next: string[]) => void
  options?: SearchableMultiSelectOption[]
  placeholder?: string
  disabled?: boolean
  searchPlaceholder?: string
  emptyText?: string
  /** Scroll area max height; ~5 rows at default padding */
  listMaxHeightClassName?: string
  /** Override trigger text when at least one item is selected */
  formatSummary?: (selectedValues: string[], options: SearchableMultiSelectOption[]) => string
}

export function SearchableMultiSelect({
  value,
  onValueChange,
  options,
  placeholder = "Select...",
  disabled,
  searchPlaceholder = "Search...",
  emptyText = "No results.",
  listMaxHeightClassName = "max-h-[11.25rem]",
  formatSummary: formatSummaryProp,
}: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  const safeOptions = useMemo(() => options ?? [], [options])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return safeOptions
    return safeOptions.filter((o) => o.label.toLowerCase().includes(q))
  }, [safeOptions, query])

  const selectedLabels = value
    .map((v) => safeOptions.find((o) => o.value === v)?.label)
    .filter(Boolean) as string[]

  const summary = (() => {
    if (value.length === 0) return ""
    if (formatSummaryProp) return formatSummaryProp(value, safeOptions)
    if (selectedLabels.length === 0) return ""
    if (selectedLabels.length <= 2) return selectedLabels.join(", ")
    return `${selectedLabels.length} selected`
  })()

  const summaryTitle = selectedLabels.length > 2 ? selectedLabels.join(", ") : undefined

  const toggle = (id: string) => {
    if (value.includes(id)) {
      onValueChange(value.filter((x) => x !== id))
    } else {
      onValueChange([...value, id])
    }
  }

  return (
    <Popover open={open} onOpenChange={(v) => !disabled && setOpen(v)}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          title={summaryTitle}
          className={`border-border bg-body-bg-light ring-offset-background placeholder:text-muted-foreground focus:ring-primary flex h-10 w-full min-w-0 items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none ${
            disabled ? "pointer-events-none cursor-not-allowed bg-gray-100 opacity-60" : ""
          }`}
        >
          <span
            className={`min-w-0 flex-1 truncate text-left ${
              summary ? "" : "text-muted-foreground"
            }`}
          >
            {summary || placeholder}
          </span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="border-border bg-card max-w-[min(100vw-2rem,28rem)] min-w-[260px] p-2 shadow-lg"
      >
        <div className="space-y-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            autoFocus
          />
          <div className={`${listMaxHeightClassName} overflow-y-auto overscroll-contain`}>
            {filtered.length === 0 ? (
              <div className="text-muted-foreground px-2 py-2 text-sm">{emptyText}</div>
            ) : (
              <ul className="m-0 list-none space-y-0 p-0">
                {filtered.map((o) => {
                  const checked = value.includes(o.value)
                  return (
                    <li key={o.value}>
                      <button
                        type="button"
                        disabled={disabled}
                        className="hover:bg-secondary flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-2 text-left text-sm disabled:cursor-not-allowed"
                        onClick={() => toggle(o.value)}
                      >
                        <span
                          className="border-border text-primary flex h-4 w-4 shrink-0 items-center justify-center rounded border bg-transparent"
                          aria-hidden
                        >
                          {checked ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
                        </span>
                        <span className="min-w-0 flex-1 leading-snug">{o.label}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
