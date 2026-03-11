"use client"

import { useEffect, useState } from "react"

/**
 * Debounce a changing value. The returned value updates only after
 * `delayMs` has elapsed without further changes.
 */
export function useDebounce<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer: number = window.setTimeout(() => {
      setDebouncedValue(value)
    }, delayMs)
    return () => window.clearTimeout(timer)
  }, [value, delayMs])

  return debouncedValue
}

