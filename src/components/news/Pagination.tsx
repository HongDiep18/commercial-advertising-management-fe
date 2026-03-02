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

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const totalSlots = 7

    if (totalPages <= totalSlots) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
      return pages
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", totalPages)
      } else if (currentPage <= totalPages - 2) {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          1,
          "...",
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        )
      } else {
        pages.push(
          1,
          "...",
          currentPage - 2,
          currentPage - 1,
          currentPage,
          currentPage + 1,
          currentPage + 2,
          "...",
          totalPages
        )
      }
      return pages
    }
  }

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
        {getPageNumbers()?.map((page, index) => (
          <Button
            key={index}
            variant={currentPage === page ? "primary" : "outline"}
            size="sm"
            onClick={() => typeof page === "number" && onPageChange(page)}
            disabled={page === "..."}
            className={`flex h-10 w-10 items-center justify-center text-sm transition-all ${page === "..." ? "cursor-default" : "hover:!bg-header-red-dark/60 rounded-full hover:!text-white"} ${currentPage === page ? "bg-gray-200 font-bold text-black" : "text-gray-500"} `}
          >
            {page}
          </Button>
        ))}
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
    </div>
  )
}
