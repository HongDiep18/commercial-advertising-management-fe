"use client"

import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import enUS from "./locales/en-US.json"
import zhTW from "./locales/zh-TW.json"
import viVN from "./locales/vi-VN.json"

if (!i18n.isInitialized) {
  let defaultLanguage: "en-US" | "zh-TW" | "vi-VN" = "zh-TW"
  if (typeof window !== "undefined") {
    const saved = window.localStorage.getItem("i18nextLng")
    if (saved === "en-US" || saved === "zh-TW" || saved === "vi-VN") {
      defaultLanguage = saved
    }
  }

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
}

export default i18n
