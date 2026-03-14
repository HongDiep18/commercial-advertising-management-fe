import type { Metadata } from "next"
import { getCompanyData } from "@/data/mockCompanies"
import CompanyDetailPageClient from "@/components/company/CompanyDetailPageClient"

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const company = getCompanyData(id)
  const title = [company.nameEn || company.nameCn, "VN Buyer Guide"].filter(Boolean).join(" | ")
  const description =
    company.introduction?.replace(/\s+/g, " ").trim().slice(0, 160) ||
    `${company.nameEn || company.nameCn} - ${company.category}. VN Buyer Guide company profile.`

  return {
    title,
    description,
    openGraph: {
      title,
      description: description.slice(0, 200),
      type: "website",
    },
  }
}

export default async function CompanyDetailPage({ params }: Props) {
  const { id } = await params
  return <CompanyDetailPageClient companyId={id} />
}
