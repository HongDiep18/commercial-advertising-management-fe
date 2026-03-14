import type { Metadata } from "next"
import AboutPageClient from "../../src/components/about/AboutPageClient"

export const metadata: Metadata = {
  title: "About Us | VN Buyer Guide - Vietnam Buyer Guide",
  description:
    "Learn about VN Buyer Guide: connecting quality business partners in Vietnam. Taiwanese enterprises, industry classification, and company information for finding ideal partners and creating business opportunities.",
  openGraph: {
    title: "About Us | VN Buyer Guide - Vietnam Buyer Guide",
    description: "Learn about VN Buyer Guide: connecting quality business partners in Vietnam.",
    type: "website",
  },
}

export default function AboutPage() {
  return <AboutPageClient />
}
