'use client'

import { useTranslation } from 'react-i18next'

export default function HeroSection() {
  const { t, i18n } = useTranslation()

  return (
    <section 
      className="relative h-[280px] md:h-[340px] overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url(/assets/images/contact/contact-banner.jpg)' }}
    >
      <div key={i18n.language} className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{t('adContact.heroTitle')}</h1>
        <p className="text-white/90 text-lg max-w-2xl leading-relaxed">
          {t('adContact.heroDescription')}
        </p>
      </div>
    </section>
  )
}
