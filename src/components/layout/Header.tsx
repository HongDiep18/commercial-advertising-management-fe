"use client"

import { isDemoAdminUser } from "@/components/login/demo/demoUsers"
import Button from "@/components/ui/Button"
import { useUser, MembershipTier, UserRole } from "@/contexts/user-context"
import { FeatureKey } from "@/types"
import { ChevronDown, LogOut, Menu, Shield, User, X } from "lucide-react"
import Link from "next/link"
import { useEffect, useRef, useState, useMemo } from "react"
import { useTranslation } from "react-i18next"
import LanguageSelector from "./LanguageSelector"

type HeaderProps = {
  showSiteNav?: boolean
}

export default function Header({ showSiteNav = true }: HeaderProps) {
  const { t } = useTranslation()
  const { user, isLoggedIn, logout, canUseFeature } = useUser()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Generate directory URL based on user tier
  const directoryUrl = useMemo(() => {
    if (!user) return "/directory"

    const tier = user.membershipTier
    const role = user.role

    // Diamond and Admin get full access - no filter needed
    if (tier === MembershipTier.DIAMOND || role === UserRole.Admin) {
      return "/directory"
    }

    // Bronze, Silver, Gold users should be redirected to their primary industry
    if (user.primaryIndustry) {
      return `/directory?industry=${user.primaryIndustry}`
    }

    // Default to unfiltered if no primary industry set
    return "/directory"
  }, [user])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const closeMobileMenu = () => setIsMenuOpen(false)
  const handleLogout = () => {
    logout()
    setIsDropdownOpen(false)
    closeMobileMenu()
  }

  return (
    <header className="bg-header-red-dark fixed top-0 right-0 left-0 z-[70] text-white shadow-md">
      <div className="container mx-auto px-2 lg:px-2">
        <div className="flex h-16 items-center">
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/assets/images/logo.webp"
              alt="Logo"
              className="h-9 w-auto brightness-0 invert"
            />
          </Link>

          {showSiteNav && (
            <nav className="mx-auto hidden items-center gap-5 lg:flex xl:gap-6">
              <Link
                href="/about"
                className="text-sm font-medium whitespace-nowrap transition-colors hover:text-white/80"
              >
                {t("header.aboutUs")}
              </Link>
              <Link
                href={directoryUrl}
                className="text-sm font-medium whitespace-nowrap transition-colors hover:text-white/80"
              >
                {t("header.directory")}
              </Link>
              <Link
                href={process.env.NEXT_PUBLIC_STORE_URL || "https://vn-buyer-guide.myshopify.com/"}
                className="text-sm font-medium whitespace-nowrap transition-colors hover:text-white/80"
              >
                {t("header.store")}
              </Link>
              <Link
                href="/news"
                className="text-sm font-medium whitespace-nowrap transition-colors hover:text-white/80"
              >
                {t("header.news")}
              </Link>
              <Link
                href="/property"
                className="text-sm font-medium whitespace-nowrap transition-colors hover:text-white/80"
              >
                {t("header.property")}
              </Link>
              <Link
                href="/contact"
                className="text-sm font-medium whitespace-nowrap transition-colors hover:text-white/80"
              >
                {t("header.adContact")}
              </Link>
            </nav>
          )}

          <div
            className={`hidden items-center gap-1 md:flex lg:gap-1 ${showSiteNav ? "" : "ml-auto"}`}
          >
            <LanguageSelector variant="desktop" />

            {isLoggedIn && user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="true"
                >
                  <span>{user.name}</span>
                  <ChevronDown className="h-4 w-4 text-white/70" />
                </button>
                {isDropdownOpen && (
                  <div className="absolute top-full right-0 z-50 mt-1 w-48 rounded-lg border border-white/20 bg-white py-1 shadow-lg">
                    <Link
                      href="/account"
                      className="hover:bg-header-red-dark mx-1 flex items-center gap-2 rounded-md px-3 py-2 text-sm text-black transition-colors hover:text-white"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      {t("header.myAccount") || "我的帳戶"}
                    </Link>
                    {canUseFeature(FeatureKey.AdminPanel) && (
                      <Link
                        href={isDemoAdminUser(user) ? "/admin/demo" : "/admin"}
                        className="hover:!bg-header-red-dark mx-1 flex items-center gap-2 rounded-md px-3 py-2 text-sm text-black transition-colors hover:bg-white/10 hover:text-white"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <Shield className="h-4 w-4" />
                        {t("header.adminPanel") || "管理後台"}
                      </Link>
                    )}
                    <div className="my-1 border-t border-black/20" />
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="hover:!bg-header-red-dark !text-header-red-light mx-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-200 transition-colors hover:!text-white"
                    >
                      <LogOut className="h-4 w-4" />
                      {t("header.logout") || "登出"}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors hover:bg-white/10"
                >
                  {t("common.login")}
                </Link>
                <Link
                  href="/register"
                  className="text-header-red-dark rounded bg-white px-4 py-1.5 text-sm font-semibold whitespace-nowrap transition-colors hover:bg-white/90"
                >
                  {t("common.register")}
                </Link>
              </>
            )}
          </div>

          {(showSiteNav || isLoggedIn) && (
            <button
              className="p-2 text-white md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          )}
        </div>

        {isMenuOpen && (
          <div className="border-t border-white/20 py-4 md:hidden">
            <nav className="flex flex-col gap-3">
              {showSiteNav && (
                <>
                  <Link
                    href="/about"
                    className="py-2 text-sm font-medium transition-colors hover:text-white/80"
                    onClick={closeMobileMenu}
                  >
                    {t("header.aboutUs")}
                  </Link>
                  <Link
                    href={directoryUrl}
                    className="py-2 text-sm font-medium transition-colors hover:text-white/80"
                    onClick={closeMobileMenu}
                  >
                    {t("header.directory")}
                  </Link>
                  <Link
                    href={
                      process.env.NEXT_PUBLIC_STORE_URL || "https://vn-buyer-guide.myshopify.com/"
                    }
                    className="py-2 text-sm font-medium transition-colors hover:text-white/80"
                    onClick={closeMobileMenu}
                  >
                    {t("header.store")}
                  </Link>
                  <Link
                    href="/news"
                    className="py-2 text-sm font-medium transition-colors hover:text-white/80"
                    onClick={closeMobileMenu}
                  >
                    {t("header.news")}
                  </Link>
                  <Link
                    href="/property"
                    className="py-2 text-sm font-medium transition-colors hover:text-white/80"
                    onClick={closeMobileMenu}
                  >
                    {t("header.property")}
                  </Link>
                  <Link
                    href="/contact"
                    className="py-2 text-sm font-medium transition-colors hover:text-white/80"
                    onClick={closeMobileMenu}
                  >
                    {t("header.adContact")}
                  </Link>
                </>
              )}
              <div className="flex flex-col gap-2 border-t border-white/20 pt-4">
                <LanguageSelector variant="mobile" />
                {isLoggedIn && user ? (
                  <>
                    <div className="py-2 text-sm font-medium text-white/90">{user.name}</div>
                    <Link
                      href="/account"
                      className="flex items-center gap-2 py-2 text-sm transition-colors hover:text-white/80"
                      onClick={closeMobileMenu}
                    >
                      <User className="h-4 w-4" />
                      {t("header.myAccount") || "我的帳戶"}
                    </Link>
                    {canUseFeature(FeatureKey.AdminPanel) && (
                      <Link
                        href={isDemoAdminUser(user) ? "/admin/demo" : "/admin"}
                        className="flex items-center gap-2 py-2 text-sm transition-colors hover:text-white/80"
                        onClick={closeMobileMenu}
                      >
                        <Shield className="h-4 w-4" />
                        {t("header.adminPanel") || "管理後台"}
                      </Link>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      className="justify-start text-red-200 hover:bg-white/10 hover:text-red-100"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      {t("header.logout") || "登出"}
                    </Button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="rounded px-4 py-2 text-center text-sm font-medium transition-colors hover:bg-white/10"
                      onClick={closeMobileMenu}
                    >
                      {t("common.login")}
                    </Link>
                    <Link
                      href="/register"
                      className="text-header-red-dark rounded bg-white px-4 py-2 text-center text-sm font-semibold transition-colors hover:bg-white/90"
                      onClick={closeMobileMenu}
                    >
                      {t("common.register")}
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
