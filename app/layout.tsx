import type { Metadata } from "next"
import "../src/index.css"
import { Providers } from "./providers"
import { Figtree } from "next/font/google";
import { cn } from "@/lib/utils";

const figtree = Figtree({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "VN Buyer Guide",
  description: "Vietnam Buyer Guide - Connect Quality Business Partners",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={cn("font-sans", figtree.variable)}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
