"use client"

import { useTranslation } from "react-i18next"

export default function HeroSection() {
  const { t, i18n } = useTranslation()

  return (
    <section
      className="relative h-[280px] overflow-hidden bg-cover bg-center bg-no-repeat md:h-[340px]"
      style={{ backgroundImage: "url(/assets/images/contact/contact-banner.jpg)" }}
    >
      <div
        key={i18n.language}
        className="relative mx-auto flex h-full max-w-7xl flex-col justify-center px-4 sm:px-6 lg:px-8"
      >
        <h1 className="mb-4 text-3xl font-bold text-white md:text-4xl">
          {t("adContact.heroTitle")}
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-white/90">
          {t("adContact.heroDescription")}
        </p>
      </div>
    </section>
  )
}
