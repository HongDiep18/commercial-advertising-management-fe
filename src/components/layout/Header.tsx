'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import LanguageSelector from './LanguageSelector'

export default function Header() {
  const { t } = useTranslation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="fixed left-0 right-0 top-0 z-50 bg-header-red-dark text-white shadow-md">
      <div className="container mx-auto px-2 lg:px-2">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/assets/images/logo.webp"
              alt="Logo"
              className="h-9 w-auto brightness-0 invert"
            />
          </Link>

          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 lg:flex xl:gap-8">
            <Link
              href="/about"
              className="whitespace-nowrap text-sm font-medium transition-colors hover:text-white/80"
            >
              {t('header.aboutUs')}
            </Link>
            <Link
              href="/directory"
              className="whitespace-nowrap text-sm font-medium transition-colors hover:text-white/80"
            >
              {t('header.directory')}
            </Link>
            <Link
              href="/store"
              className="whitespace-nowrap text-sm font-medium transition-colors hover:text-white/80"
            >
              {t('header.store')}
            </Link>
            <Link
              href="/news"
              className="whitespace-nowrap text-sm font-medium transition-colors hover:text-white/80"
            >
              {t('header.news')}
            </Link>
            <Link
              href="/contact"
              className="whitespace-nowrap text-sm font-medium transition-colors hover:text-white/80"
            >
              {t('header.adContact')}
            </Link>
          </nav>

          <div className="hidden items-center gap-3 md:flex lg:gap-4">
            <LanguageSelector variant="desktop" />

            <a
              href="/login"
              className="whitespace-nowrap rounded px-4 py-1.5 text-sm font-medium transition-colors hover:bg-header-red-dark"
            >
              {t('common.login')}
            </a>

            <a
              href="/register"
              className="whitespace-nowrap rounded bg-white px-4 py-1.5 text-sm font-semibold text-header-red-dark transition-colors hover:bg-white/90"
            >
              {t('common.register')}
            </a>
          </div>

          <button
            className="p-2 text-white md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {isMenuOpen && (
          <div className="border-t border-white/20 py-4 md:hidden">
            <nav className="flex flex-col gap-3">
              <Link
                href="/about"
                className="py-2 text-sm font-medium transition-colors hover:text-white/80"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('header.aboutUs')}
              </Link>
              <Link
                href="/directory"
                className="py-2 text-sm font-medium transition-colors hover:text-white/80"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('header.directory')}
              </Link>
              <Link
                href="/store"
                className="py-2 text-sm font-medium transition-colors hover:text-white/80"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('header.store')}
              </Link>
              <Link
                href="/news"
                className="py-2 text-sm font-medium transition-colors hover:text-white/80"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('header.news')}
              </Link>
              <Link
                href="/contact"
                className="py-2 text-sm font-medium transition-colors hover:text-white/80"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('header.adContact')}
              </Link>
              <div className="flex flex-col gap-2 border-t border-white/20 pt-4">
                <LanguageSelector variant="mobile" />
                <a
                  href="/login"
                  className="rounded px-4 py-2 text-center text-sm font-medium transition-colors hover:bg-header-red-dark"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('common.login')}
                </a>
                <a
                  href="/register"
                  className="rounded bg-white px-4 py-2 text-center text-sm font-semibold text-header-red-dark transition-colors hover:bg-white/90"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('common.register')}
                </a>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
