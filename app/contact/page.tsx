import type { Metadata } from "next"
import ContactPageClient from "../../src/components/contact/ContactPageClient"

export const metadata: Metadata = {
  title: "Contact & Advertising | VN Buyer Guide - Ad Packages & Inquiries",
  description:
    "Contact VN Buyer Guide for advertising: platform ads, directory listings, and product placements. View pricing, submit inquiries, and place ad orders.",
  openGraph: {
    title: "Contact & Advertising | VN Buyer Guide - Ad Packages & Inquiries",
    description:
      "Contact VN Buyer Guide for advertising: platform ads, directory listings, and product placements. View pricing and place orders.",
    type: "website",
  },
}

export default function ContactPage() {
  return <ContactPageClient />
}
