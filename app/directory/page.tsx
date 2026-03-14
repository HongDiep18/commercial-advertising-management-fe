import type { Metadata } from "next"
import DirectoryPageClient from "../../src/components/directory/DirectoryPageClient"

export const metadata: Metadata = {
  title: "Company Directory | VN Buyer Guide - Find Businesses in Vietnam",
  description:
    "Browse the VN Buyer Guide company directory: find Taiwanese enterprises in Vietnam by industry, category, and location. Search companies and connect with quality business partners.",
  openGraph: {
    title: "Company Directory | VN Buyer Guide - Find Businesses in Vietnam",
    description:
      "Browse the company directory: find enterprises in Vietnam by industry and location. Connect with quality business partners.",
    type: "website",
  },
}

export default function DirectoryPage() {
  return <DirectoryPageClient />
}
