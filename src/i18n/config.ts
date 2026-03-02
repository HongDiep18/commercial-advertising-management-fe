"use client"

import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import enUS from "./locales/en-US.json"
import zhTW from "./locales/zh-TW.json"
import viVN from "./locales/vi-VN.json"

if (!i18n.isInitialized) {
  const defaultLanguage = "zh-TW"

  i18n.use(initReactI18next).init({
    resources: {
      "en-US": {
        translation: enUS,
      },
      "zh-TW": {
        translation: zhTW,
      },
      "vi-VN": {
        translation: viVN,
      },
    },
    lng: defaultLanguage,
    fallbackLng: defaultLanguage,
    supportedLngs: ["en-US", "zh-TW", "vi-VN"],
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  })

  if (typeof window !== "undefined") {
    i18n.use(LanguageDetector)
  }
}

export default i18n
