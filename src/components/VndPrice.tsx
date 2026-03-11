"use client"

import type { ReactElement } from "react"
import clsx from "clsx"

type VndPriceProps = {
  value: number | null | undefined
  className?: string
  showCurrency?: boolean
}

function formatVndAmount(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(value)
}

export function VndPrice({ value, className, showCurrency = true }: VndPriceProps): ReactElement {
  if (value === null || value === undefined) {
    return <span className={clsx("text-muted-foreground", className)}>—</span>
  }

  const formatted = formatVndAmount(value)
  const display = showCurrency ? `${formatted} VND` : formatted

  return <span className={className}>{display}</span>
}

