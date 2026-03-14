import type { Metadata } from "next"
import StorePageClient from "../../src/components/store/StorePageClient"

export const metadata: Metadata = {
  title: "Online Store | VN Buyer Guide - Products & Shopping",
  description:
    "VN Buyer Guide online store: browse products and shop. Find quality offerings from businesses in the Vietnam Buyer Guide network.",
  openGraph: {
    title: "Online Store | VN Buyer Guide - Products & Shopping",
    description:
      "VN Buyer Guide online store: browse products and shop from the Vietnam Buyer Guide network.",
    type: "website",
  },
}

export default function StorePage() {
  return <StorePageClient />
}
