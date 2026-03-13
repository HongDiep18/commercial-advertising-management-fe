"use client"

import { useFeaturedCompanies } from "@/api/companies/hooks"
import { Award, MapPin, Phone } from "lucide-react"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import Badge from "../ui/Badge"
import Card from "../ui/Card"

export default function FeaturedCompanies() {
  const { t } = useTranslation()
  const { data, isLoading, isError } = useFeaturedCompanies()
  const companies = useMemo(() => data ?? [], [data])
  const [activeIndex, setActiveIndex] = useState<number>(0)

  useEffect(() => {
    if (companies.length <= 3) return
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 3) % companies.length)
    }, 10_000)
    return () => window.clearInterval(timer)
  }, [companies.length])

  const visibleCompanies = useMemo(() => {
    if (companies.length <= 3) return companies
    const result = []
    for (let i = 0; i < 3; i++) {
      result.push(companies[(activeIndex + i) % companies.length])
    }
    return result
  }, [activeIndex, companies])

  return (
    <section id="featured" className="bg-body-bg-light py-20">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <h2 className="mb-4 text-3xl font-bold">{t("featuredCompanies.title")}</h2>
            <p className="text-muted-foreground text-base">{t("featuredCompanies.subtitle")}</p>
          </div>
          <Link
            href="/directory"
            className="text-primary hidden font-normal hover:underline md:block"
          >
            {t("featuredCompanies.viewMore")}
          </Link>
        </div>

        <div className="grid items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <div className="text-muted-foreground py-8 text-sm">
              {t("directory.loading") || "Loading..."}
            </div>
          ) : isError ? (
            <div className="text-muted-foreground py-8 text-sm">
              {t("error.failedToLoadCompanies") || "Failed to load data"}
            </div>
          ) : companies.length === 0 ? (
            <div className="text-muted-foreground py-8 text-sm">{t("directory.noResults")}</div>
          ) : (
            visibleCompanies.map((company) => {
              const isVerified = Boolean(company.featuredHighlight)
              return (
                <Link key={company.id} href={`/directory/${company.id}`} className="block h-full">
                  <Card className="group border-border animate-in fade-in-0 flex h-full cursor-pointer flex-col overflow-hidden pt-12 transition-all duration-500 hover:shadow-xl">
                    <div className="bg-muted aspect-video overflow-hidden">
                      <img
                        src={company.logoUrl || "/placeholder.svg"}
                        alt={company.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="bg-body-bg-light flex flex-1 flex-col p-6">
                      <div className="mb-3 flex items-start justify-between">
                        <Badge variant="body-bg-light" className="text-xs">
                          {t(`directory.categories.${company.industry}`, {
                            defaultValue: company.industry,
                          })}
                        </Badge>
                        {isVerified ? (
                          <div className="text-primary flex items-center gap-1">
                            <Award className="h-4 w-4" />
                            <span className="text-xs font-normal">
                              {t("featuredCompanies.verified")}
                            </span>
                          </div>
                        ) : null}
                      </div>

                      <h3 className="group-hover:text-primary mb-2 line-clamp-1 text-base font-semibold transition-colors">
                        {company.name}
                      </h3>

                      <p className="text-muted-foreground mb-4 line-clamp-2 text-sm">
                        {company.description}
                      </p>

                      <div className="text-muted-foreground mt-auto flex flex-col gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{company.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{company.phone}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              )
            })
          )}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link href="/directory" className="text-primary font-normal hover:underline">
            {t("featuredCompanies.viewMore")}
          </Link>
        </div>
      </div>
    </section>
  )
}
