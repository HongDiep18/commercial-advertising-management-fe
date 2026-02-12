'use client'

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import enUS from './locales/en-US.json'
import zhTW from './locales/zh-TW.json'
import viVN from './locales/vi-VN.json'


if (!i18n.isInitialized) {
  const isBrowser = typeof window !== 'undefined'
  
  i18n
    .use(initReactI18next)
    .init({
      resources: {
        'en-US': {
          translation: enUS,
        },
        'zh-TW': {
          translation: zhTW,
        },
        'vi-VN': {
          translation: viVN,
        },
      },
      lng: isBrowser ? undefined : 'zh-TW', 
      fallbackLng: 'zh-TW',
      supportedLngs: ['en-US', 'zh-TW', 'vi-VN'],
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false, 
      },
    })

  
  if (isBrowser) {
    i18n.use(LanguageDetector).init({
      detection: {
        order: ['localStorage', 'navigator', 'htmlTag'],
        caches: ['localStorage'],
      },
    })
  }
}

export default i18n
