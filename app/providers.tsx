'use client'

import { useEffect } from 'react'
import '../src/i18n/config'
import { useTranslation } from 'react-i18next'
import { UserProvider } from '../src/contexts/user-context'

export function Providers({ children }: { children: React.ReactNode }) {
    const { i18n } = useTranslation()

    useEffect(() => {
        const savedLang = localStorage.getItem('i18nextLng')
        if (savedLang && ['en-US', 'zh-TW', 'vi-VN'].includes(savedLang)) {
            if (i18n.language !== savedLang) {
                i18n.changeLanguage(savedLang)
            }
        }
    }, [])

    return (
        <UserProvider>
            {children}
        </UserProvider>
    )
}
