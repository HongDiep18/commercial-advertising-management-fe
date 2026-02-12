import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import enUS from './locales/en-US.json'
import zhCN from './locales/zh-CN.json'
import viVN from './locales/vi-VN.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      'en-US': {
        translation: enUS,
      },
      'zh-CN': {
        translation: zhCN,
      },
      'vi-VN': {
        translation: viVN,
      },
    },
    fallbackLng: 'zh-CN', 
    supportedLngs: ['en-US', 'zh-CN', 'vi-VN'],
    interpolation: {
      escapeValue: false, 
    },
    detection: {
      
      order: ['localStorage', 'navigator', 'htmlTag'],
      
      caches: ['localStorage'],
    },
  })

export default i18n
