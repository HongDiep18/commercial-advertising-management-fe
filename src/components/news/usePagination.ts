"use client"

import { useState, useCallback } from "react"

export interface UsePaginationOptions {
  totalItems: number
  pageSize: number
}

export interface UsePaginationReturn<T> {
  currentPage: number
  setPage: (page: number) => void
  totalPages: number
  startIndex: number
  endIndex: number
  slicePage: (list: T[]) => T[]
}

export function usePagination<T = unknown>({
  totalItems,
  pageSize,
}: UsePaginationOptions): UsePaginationReturn<T> {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  const setPage = useCallback(
    (page: number) => {
      setCurrentPage(Math.max(1, Math.min(totalPages, page)))
    },
    [totalPages]
  )

  const safePage = Math.min(Math.max(1, currentPage), totalPages)
  const startIndex = (safePage - 1) * pageSize
  const endIndex = startIndex + pageSize

  const slicePage = useCallback(
    (list: T[]) => list.slice(startIndex, endIndex),
    [startIndex, endIndex]
  )

  return {
    currentPage: safePage,
    setPage,
    totalPages,
    startIndex,
    endIndex,
    slicePage,
  }
}
