"use client"

import { usePathname } from "next/navigation"
import { ReactNode } from "react"

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isDemoRoute = pathname?.startsWith("/admin/demo") ?? false

  return (
    <>
      {isDemoRoute && (
        <div
          className="bg-amber-500 px-4 py-2 text-center text-sm font-medium text-amber-950"
          role="status"
          aria-live="polite"
        >
          Demo mode — data is mock only; no real admin APIs are used.
        </div>
      )}
      {children}
    </>
  )
}
