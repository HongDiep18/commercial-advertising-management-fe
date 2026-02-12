import type { Metadata } from 'next'
import '../src/index.css'
import { Providers } from './providers'

export const metadata: Metadata = {
    title: 'VN Buyer Guide',
    description: 'Vietnam Buyer Guide - Connect Quality Business Partners',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="vi">
            <body>
                <Providers>{children}</Providers>
            </body>
        </html>
    )
}
