import type { Metadata } from "next"
import CompanyDetailPageClient from "@/components/company/CompanyDetailPageClient"

type Props = { params: Promise<{ id: string }> }

export const metadata: Metadata = {
  title: "Company Detail | VN Buyer Guide",
  description: "VN Buyer Guide - Company Directory",
  openGraph: {
    title: "Company Detail | VN Buyer Guide",
    description: "VN Buyer Guide - Company Directory",
    type: "website",
  },
}

export default async function CompanyDetailPage({ params }: Props) {
  const { id } = await params
  return <CompanyDetailPageClient companyId={id} />
}
