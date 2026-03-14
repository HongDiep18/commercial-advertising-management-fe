import type { Metadata } from "next"
import HomePageClient from "../src/components/landing/HomePageClient"

export const metadata: Metadata = {
  title: "VN Buyer Guide | Vietnam Buyer Guide - Connect Quality Business Partners",
  description:
    "Vietnam Buyer Guide - Connect Quality Business Partners. Find Taiwanese enterprises in Vietnam, industry classification and company information for ideal partners and business opportunities.",
  openGraph: {
    title: "VN Buyer Guide | Vietnam Buyer Guide - Connect Quality Business Partners",
    description:
      "Vietnam Buyer Guide - Connect Quality Business Partners. Find enterprises in Vietnam, industry classification and company information.",
    type: "website",
  },
}

export default function HomePage() {
  return <HomePageClient />
}
