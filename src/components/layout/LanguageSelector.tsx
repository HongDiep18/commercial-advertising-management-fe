'use client'

import { useState, useRef, useEffect } from 'react'
import { Globe, ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'

type Language = 'en-US' | 'zh-TW' | 'vi-VN'

const languages: Record<Language, string> = {
  'en-US': 'English',
  'zh-TW': '繁體中文',
  'vi-VN': 'Tiếng Việt',
}

interface LanguageSelectorProps {
  variant?: 'desktop' | 'mobile'
}

export default function LanguageSelector({
  variant = 'desktop',
}: LanguageSelectorProps) {
  const { i18n } = useTranslation()
  const getInitialLanguage = (): Language => {
    const lang = i18n.language
    if (lang === 'en-US' || lang === 'zh-TW' || lang === 'vi-VN') {
      return lang as Language
    }
    return 'zh-TW'
  }
  const [currentLanguage, setCurrentLanguage] = useState<Language>(getInitialLanguage())
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      if (lng === 'en-US' || lng === 'zh-TW' || lng === 'vi-VN') {
        setCurrentLanguage(lng as Language)
      }
    }
    i18n.on('languageChanged', handleLanguageChanged)
    return () => {
      i18n.off('languageChanged', handleLanguageChanged)
    }
  }, [i18n])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsLanguageDropdownOpen(false)
      }
    }

    if (isLanguageDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isLanguageDropdownOpen])

  const handleLanguageChange = (lang: Language) => {
    i18n.changeLanguage(lang)
    setCurrentLanguage(lang)
    setIsLanguageDropdownOpen(false)
  }

  if (variant === 'mobile') {
    return (
      <div className="relative">
        <button
          onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
          className="flex w-full items-center gap-1.5 rounded px-2 py-2 text-white transition-colors hover:bg-white/10"
        >
          <Globe className="h-4 w-4" />
          <span className="text-sm font-medium">
            {languages[currentLanguage]}
          </span>
          <ChevronDown className="ml-auto h-3 w-3" />
        </button>

        {isLanguageDropdownOpen && (
          <div className="mt-2 w-full rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
            <button
              onClick={() => handleLanguageChange('zh-TW')}
              className="w-full px-4 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-100"
            >
              繁體中文
            </button>
            <button
              onClick={() => handleLanguageChange('en-US')}
              className="w-full px-4 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-100"
            >
              English
            </button>
            <button
              onClick={() => handleLanguageChange('vi-VN')}
              className="w-full px-4 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-100"
            >
              Tiếng Việt
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
        className="flex cursor-pointer items-center gap-1.5 rounded px-2 py-1.5 text-white transition-colors hover:bg-header-red-dark"
      >
        <Globe className="h-4 w-4" />
        <span className="hidden text-sm font-medium sm:inline">
          {languages[currentLanguage]}
        </span>
        <ChevronDown className="h-3 w-3" />
      </button>

      {isLanguageDropdownOpen && (
        <div className="absolute right-0 z-50 mt-2 w-40 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
          <button
            onClick={() => handleLanguageChange('zh-TW')}
            className="w-full px-4 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-100"
          >
            繁體中文
          </button>
          <button
            onClick={() => handleLanguageChange('en-US')}
            className="w-full px-4 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-100"
          >
            English
          </button>
          <button
            onClick={() => handleLanguageChange('vi-VN')}
            className="w-full px-4 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-100"
          >
            Tiếng Việt
          </button>
        </div>
      )}
    </div>
  )
}
