'use client'

import { useEffect } from 'react'
import '../src/i18n/config'

export function Providers({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // i18n is initialized in config.ts
    }, [])

    return <>{children}</>
}
