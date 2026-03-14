import type { Metadata } from "next"
import PropertyPageClient from "../../src/components/property/PropertyPageClient"

export const metadata: Metadata = {
  title: "Property | VN Buyer Guide - Real Estate & Listings in Vietnam",
  description:
    "Browse property listings in Vietnam: land, factory, warehouse, house, and office for sale or rent. Connect with quality property owners and agents via VN Buyer Guide.",
  openGraph: {
    title: "Property | VN Buyer Guide - Real Estate & Listings in Vietnam",
    description:
      "Browse property listings in Vietnam: land, factory, warehouse, house, and office for sale or rent.",
    type: "website",
  },
}

export default function PropertyPage() {
  return <PropertyPageClient />
}
