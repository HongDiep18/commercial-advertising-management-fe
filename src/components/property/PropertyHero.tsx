"use client"

import { useTranslation } from "react-i18next"

export default function PropertyHero() {
  const { t, i18n } = useTranslation()

  return (
    <section className="relative h-[280px] md:h-[340px] overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/assets/images/news/news-travel-2.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />

      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
          {t('property.heroTitle')}
        </h1>
        <p className="text-white/80 max-w-2xl text-lg">
          {t('property.heroDescription')}
        </p>
      </div>
    </section>
  )
}