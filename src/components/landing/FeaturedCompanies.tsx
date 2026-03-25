import { useFeaturedCompanies } from "@/api/companies/hooks"
import { getFirstActiveAdAssetImageUrl } from "@/lib/ad-assets"
import { Award, MapPin, Phone } from "lucide-react"
import Link from "next/link"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import Badge from "../ui/Badge"
import Card from "../ui/Card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel"

export default function FeaturedCompanies() {
  const { t } = useTranslation()
  const { data, isLoading, isError } = useFeaturedCompanies()
  const companies = useMemo(() => (data ?? []).slice(0, 4), [data])

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

        {isLoading ? (
          <div className="text-muted-foreground py-8 text-sm">
            {t("companyDetail.loading", { defaultValue: "Loading..." })}
          </div>
        ) : isError ? (
          <div className="text-muted-foreground py-8 text-sm">
            {t("error.failedToLoadCompanies") || "Failed to load data"}
          </div>
        ) : companies.length === 0 ? (
          <div className="text-muted-foreground py-8 text-sm">{t("directory.noResults")}</div>
        ) : (
          <Carousel opts={{ align: "start", loop: companies.length > 1 }} className="mx-12">
            <CarouselContent>
              {companies.map((company) => {
                const isVerified = Boolean(company.featuredHighlight)
                const imageUrl = getFirstActiveAdAssetImageUrl(
                  company,
                  company.logoUrl || "/placeholder.svg"
                )
                return (
                  <CarouselItem key={company.id} className="md:basis-1/2 lg:basis-1/3">
                    <Link href={`/directory/${company.id}`} className="block h-full">
                      <Card className="group border-border animate-in fade-in-0 flex h-full cursor-pointer flex-col overflow-hidden pt-12 transition-all duration-500 hover:shadow-xl">
                        <div className="bg-muted aspect-video overflow-hidden">
                          <img
                            src={imageUrl}
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
                              <span>{company.country || "-"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              <span>{company.phone}</span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  </CarouselItem>
                )
              })}
            </CarouselContent>
            <CarouselPrevious className="-left-4" />
            <CarouselNext className="-right-4" />
          </Carousel>
        )}

        <div className="mt-8 text-center md:hidden">
          <Link href="/directory" className="text-primary font-normal hover:underline">
            {t("featuredCompanies.viewMore")}
          </Link>
        </div>
      </div>
    </section>
  )
}
