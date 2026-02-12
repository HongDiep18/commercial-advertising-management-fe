import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import LanguageSelector from './LanguageSelector'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="fixed left-0 right-0 top-0 z-50 bg-header-red-dark text-white shadow-md">
      <div className="container mx-auto px-2 lg:px-2">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/src/assets/images/logo.webp"
              alt="Logo"
              className="h-9 w-auto brightness-0 invert"
            />
          </Link>

          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 lg:flex xl:gap-8">
            <Link
              to="/about"
              className="whitespace-nowrap text-sm font-medium transition-colors hover:text-white/80"
            >
              關於我們
            </Link>
            <Link
              to="/directory"
              className="whitespace-nowrap text-sm font-medium transition-colors hover:text-white/80"
            >
              企業名錄
            </Link>
            <Link
              to="/store"
              className="whitespace-nowrap text-sm font-medium transition-colors hover:text-white/80"
            >
              網路商店
            </Link>
            <Link
              to="/news"
              className="whitespace-nowrap text-sm font-medium transition-colors hover:text-white/80"
            >
              最新消息
            </Link>
            <Link
              to="/contact"
              className="whitespace-nowrap text-sm font-medium transition-colors hover:text-white/80"
            >
              廣告聯繫
            </Link>
          </nav>

          <div className="hidden items-center gap-3 md:flex lg:gap-4">
            <LanguageSelector variant="desktop" />

            <a
              href="/login"
              className="whitespace-nowrap rounded px-4 py-1.5 text-sm font-medium transition-colors hover:bg-header-red-dark"
            >
              登入
            </a>

            <a
              href="/register"
              className="whitespace-nowrap rounded bg-white px-4 py-1.5 text-sm font-semibold text-header-red-dark transition-colors hover:bg-white/90"
            >
              免費註冊
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
                to="/about"
                className="py-2 text-sm font-medium transition-colors hover:text-white/80"
                onClick={() => setIsMenuOpen(false)}
              >
                關於我們
              </Link>
              <Link
                to="/directory"
                className="py-2 text-sm font-medium transition-colors hover:text-white/80"
                onClick={() => setIsMenuOpen(false)}
              >
                企業名錄
              </Link>
              <Link
                to="/store"
                className="py-2 text-sm font-medium transition-colors hover:text-white/80"
                onClick={() => setIsMenuOpen(false)}
              >
                網路商店
              </Link>
              <Link
                to="/news"
                className="py-2 text-sm font-medium transition-colors hover:text-white/80"
                onClick={() => setIsMenuOpen(false)}
              >
                最新消息
              </Link>
              <Link
                to="/contact"
                className="py-2 text-sm font-medium transition-colors hover:text-white/80"
                onClick={() => setIsMenuOpen(false)}
              >
                廣告聯繫
              </Link>
              <div className="flex flex-col gap-2 border-t border-white/20 pt-4">
                <LanguageSelector variant="mobile" />
                <a
                  href="/login"
                  className="rounded px-4 py-2 text-center text-sm font-medium transition-colors hover:bg-header-red-dark"
                  onClick={() => setIsMenuOpen(false)}
                >
                  登入
                </a>
                <a
                  href="/register"
                  className="rounded bg-white px-4 py-2 text-center text-sm font-semibold text-header-red-dark transition-colors hover:bg-white/90"
                  onClick={() => setIsMenuOpen(false)}
                >
                  免費註冊
                </a>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
