"use client"

import { useMemo, useState } from "react"
import { ChevronDown, Check } from "lucide-react"

import Input from "@/components/ui/Input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover"

export type SearchableSelectOption = { value: string; label: string }

type Props = {
  value?: string
  onValueChange: (value: string) => void
  options?: SearchableSelectOption[]
  placeholder?: string
  disabled?: boolean
  searchPlaceholder?: string
  emptyText?: string
}

export function SearchableSelect({
  value,
  onValueChange,
  options,
  placeholder = "Select...",
  disabled,
  searchPlaceholder = "Search...",
  emptyText = "No results.",
}: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  const safeOptions = useMemo(() => options ?? [], [options])

  const selected = useMemo(
    () => (value ? safeOptions.find((o) => o.value === value) : undefined),
    [safeOptions, value]
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return safeOptions
    return safeOptions.filter((o) => o.label.toLowerCase().includes(q))
  }, [safeOptions, query])

  return (
    <Popover open={open} onOpenChange={(v) => !disabled && setOpen(v)}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={`border-border bg-body-bg-light ring-offset-background placeholder:text-muted-foreground focus:ring-primary flex h-10 w-full min-w-0 items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none ${
            disabled ? "pointer-events-none cursor-not-allowed bg-gray-100 opacity-60" : ""
          }`}
        >
          <span
            className={`min-w-0 flex-1 truncate text-left ${
              selected?.label ? "" : "text-muted-foreground"
            }`}
          >
            {selected?.label || placeholder}
          </span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="border-border bg-card w-[--radix-popover-trigger-width] p-2 shadow-lg"
      >
        <div className="space-y-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            autoFocus
          />
          <div className="max-h-60 overflow-auto">
            {filtered.length === 0 ? (
              <div className="text-muted-foreground px-2 py-2 text-sm">{emptyText}</div>
            ) : (
              <div className="space-y-1">
                {filtered.map((o) => {
                  const isSelected = value === o.value
                  return (
                    <button
                      key={o.value}
                      type="button"
                      className="hover:bg-secondary flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm"
                      onClick={() => {
                        onValueChange(o.value)
                        setOpen(false)
                        setQuery("")
                      }}
                    >
                      <span className="w-4">
                        {isSelected ? <Check className="h-4 w-4" /> : null}
                      </span>
                      <span className="min-w-0 flex-1 truncate">{o.label}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
