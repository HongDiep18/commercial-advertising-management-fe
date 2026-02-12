'use client'

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import enUS from './locales/en-US.json'
import zhTW from './locales/zh-TW.json'
import viVN from './locales/vi-VN.json'

if (!i18n.isInitialized) {
  const isBrowser = typeof window !== 'undefined'
  
  // Get saved language from localStorage if available
  let savedLanguage: string | undefined
  if (isBrowser) {
    savedLanguage = localStorage.getItem('i18nextLng') || undefined
  }

  i18n
    .use(LanguageDetector)
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
      lng: savedLanguage || (isBrowser ? undefined : 'zh-TW'),
      fallbackLng: 'zh-TW',
      supportedLngs: ['en-US', 'zh-TW', 'vi-VN'],
      detection: {
        order: ['localStorage', 'navigator', 'htmlTag'],
        caches: ['localStorage'],
        lookupLocalStorage: 'i18nextLng',
      },
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    })
}

export default i18n
