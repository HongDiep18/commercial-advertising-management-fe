'use client'

import { useEffect } from 'react'
import '../src/i18n/config'
import { useTranslation } from 'react-i18next'

export function Providers({ children }: { children: React.ReactNode }) {
    const { i18n } = useTranslation()

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedLang = localStorage.getItem('i18nextLng')
            if (savedLang && i18n.language !== savedLang) {
                i18n.changeLanguage(savedLang)
            }
        }
    }, [i18n])

    return <>{children}</>
}
