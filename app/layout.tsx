import { cn } from "@/lib/utils"
import type { Metadata } from "next"
import { Figtree } from "next/font/google"
import { Toaster } from "../src/components/ui/sonner"
import "../src/index.css"
import { Providers } from "./providers"

const figtree = Figtree({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: "VN Buyer Guide",
  description: "Vietnam Buyer Guide - Connect Quality Business Partners",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={cn("font-sans", figtree.variable)}>
      <body>
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  )
}
