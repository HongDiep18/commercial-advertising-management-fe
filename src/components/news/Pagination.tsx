"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import Button from "@/components/ui/Button"

export interface PaginationProps {
  totalPages: number
  currentPage: number
  onPageChange: (page: number) => void
  scrollOnChange?: boolean
}

export function Pagination({
  totalPages,
  currentPage,
  onPageChange,
  scrollOnChange = false,
}: PaginationProps) {
  const handlePageChange = (page: number) => {
    onPageChange(page)
    if (scrollOnChange) {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  if (totalPages <= 1) return null

  return (
    <div className="mt-8 flex items-center justify-end gap-2 border-t border-gray-300 pt-6">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="bg-background h-9 w-9 border border-gray-500 p-0"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-1">
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNum: number
          if (totalPages <= 5) {
            pageNum = i + 1
          } else if (currentPage <= 3) {
            pageNum = i + 1
          } else if (currentPage >= totalPages - 2) {
            pageNum = totalPages - 4 + i
          } else {
            pageNum = currentPage - 2 + i
          }

          return (
            <Button
              key={pageNum}
              variant={currentPage === pageNum ? "primary" : "outline"}
              size="sm"
              onClick={() => handlePageChange(pageNum)}
              className={`h-9 w-9 p-0 ${currentPage === pageNum ? "bg-header-red-dark hover:bg-header-red-dark/100" : "bg-background hover:!bg-header-red-dark border border-gray-400 hover:!text-white"}`}
            >
              {pageNum}
            </Button>
          )
        })}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-9 w-9 border border-gray-400 p-0"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      <select
        value={currentPage}
        onChange={(e) => handlePageChange(Number(e.target.value))}
        className="bg-body-bg-dark focus:ring-primary/20 h-9 rounded-md border border-gray-400 px-2 text-sm focus:ring-2 focus:outline-none"
      >
        {Array.from({ length: totalPages }, (_, i) => (
          <option key={i + 1} value={i + 1}>
            {i + 1}
          </option>
        ))}
      </select>
    </div>
  )
}
