'use client'

import Link from "next/link"
import { MapPin, Phone, Award } from "lucide-react"
import { useMemo } from "react"
import Card from "../ui/Card"
import Badge from "../ui/Badge"
import { useTranslation } from "react-i18next"

const companyIds = ["textile-1", "finance-1", "machinery-1"]

const companyData = {
  "textile-1": {
    phone: "0274-3553278",
    verified: true,
    image: "/assets/images/companies/TNHH-LI-SHIN.png",
  },
  "finance-1": {
    phone: "+84 (90) 8489826",
    verified: true,
    image: "/assets/images/companies/DBS.jpg",
  },
  "machinery-1": {
    phone: "028-37153233",
    verified: true,
    image: "/assets/images/companies/tsaihsiung-construction.jpg",
  },
}

export default function FeaturedCompanies() {
  const { t } = useTranslation()

  const companies = useMemo(() => {
    return companyIds.map((id) => ({
      id,
      name: t(`featuredCompanies.companies.${id}.name`),
      industry: t(`featuredCompanies.companies.${id}.industry`),
      location: t(`featuredCompanies.companies.${id}.location`),
      description: t(`featuredCompanies.companies.${id}.description`),
      phone: companyData[id as keyof typeof companyData].phone,
      verified: companyData[id as keyof typeof companyData].verified,
      image: companyData[id as keyof typeof companyData].image,
    }))
  }, [t])

  return (
    <section id="featured" className="bg-body-bg-light py-20">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <h2 className="mb-4 text-3xl font-bold">{t("featuredCompanies.title")}</h2>
            <p className="text-base text-muted-foreground">{t("featuredCompanies.subtitle")}</p>
          </div>
          <Link
            href="/directory"
            className="hidden font-normal text-primary hover:underline md:block"
          >
            {t("featuredCompanies.viewMore")}
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <Link key={company.id} href={`/directory/${company.id}`}>
              <Card
                className="group cursor-pointer overflow-hidden border-border pt-12 transition-all duration-300 hover:shadow-xl"
              >
                <div className="aspect-video overflow-hidden bg-muted">
                  <img
                    src={company.image || "/placeholder.svg"}
                    alt={company.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-6 bg-body-bg-light">
                  <div className="mb-3 flex items-start justify-between ">
                    <Badge variant="body-bg-light" className="text-xs ">
                      {company.industry}
                    </Badge>
                    {company.verified && (
                      <div className="flex items-center gap-1 text-primary ">
                        <Award className="h-4 w-4" />
                        <span className="text-xs font-normal ">{t("featuredCompanies.verified")}</span>
                      </div>
                    )}
                  </div>

                  <h3 className="mb-2 line-clamp-1 text-base font-semibold transition-colors group-hover:text-primary">
                    {company.name}
                  </h3>

                  <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{company.description}</p>

                  <div className="flex flex-col gap-2 text-sm text-muted-foreground ">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{company.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{company.phone}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link href="/directory" className="font-normal text-primary hover:underline">
            {t("featuredCompanies.viewMore")}
          </Link>
        </div>
      </div>
    </section>
  )
}
