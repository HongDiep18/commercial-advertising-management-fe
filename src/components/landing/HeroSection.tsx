"use client"

import type React from "react"
import { ArrowRight } from "lucide-react"
import { useTranslation } from "react-i18next"
import Button from "../ui/Button"

export default function HeroSection() {
  const { t } = useTranslation()

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault()
    const element = document.getElementById(targetId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }

  return (
    <section className="relative h-[450px] overflow-hidden lg:h-[650px]">
      <div className="absolute inset-0">
        <img
          src="/assets/images/taiwanese-vietnamese-business-meeting.jpg"
          alt="Taiwanese and Vietnamese Business Meeting"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
      </div>

      <div className="relative container mx-auto h-full px-4 lg:px-8">
        <div className="flex h-full max-w-3xl flex-col justify-center">
          <h1 className="mb-6 text-4xl leading-tight font-bold text-balance text-white lg:text-5xl">
            {t("hero.title")}
          </h1>

          <p className="mb-6 max-w-2xl text-base leading-relaxed text-pretty text-white lg:text-lg">
            {t("hero.subtitle")}
          </p>

          <div className="flex flex-wrap gap-4">
            <Button
              size="lg"
              variant="outline"
              className="border-white bg-white/10 font-semibold text-white backdrop-blur-sm hover:bg-white/20"
              asChild
            >
              <a href="/register">{t("hero.joinUs")}</a>
            </Button>
            <Button
              size="lg"
              variant="primary"
              className="!bg-header-red-dark hover:bg-header-red-dark/90 font-semibold text-white"
              asChild
            >
              <a href="#directory" onClick={(e) => handleScroll(e, "directory")}>
                {t("hero.findPartners")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
          </div>
        </div>
      </div>

      <div className="from-body-bg-dark via-body-bg-dark/95 absolute right-0 bottom-0 left-0 h-40 bg-gradient-to-t to-transparent" />
    </section>
  )
}
