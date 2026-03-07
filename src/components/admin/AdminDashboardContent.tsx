"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Shield } from "lucide-react"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { ADMIN_TABS } from "./constants"
import {
  DashboardTab,
  CompaniesTab,
  StoreTab,
  NewsTab,
  AdvertisingTab,
  PropertyTab,
  UsersTab,
} from "./tabs"

export function AdminDashboardContent() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState("dashboard")

  const renderTab = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardTab />
      case "companies":
        return <CompaniesTab />
      case "store":
        return <StoreTab />
      case "news":
        return <NewsTab />
      case "advertising":
        return <AdvertisingTab />
      case "property":
        return <PropertyTab />
      case "users":
        return <UsersTab />
      default:
        return <DashboardTab />
    }
  }

  return (
    <main className="bg-body-bg-dark min-h-screen">
      <Header />

      <div className="pt-14">
        <section className="from-primary to-primary/80 text-primary-foreground bg-gradient-to-r py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{t("admin.title")}</h1>
                <p className="text-primary-foreground/80 text-sm">{t("admin.subtitle")}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-border bg-body-bg-dark sticky top-14 z-40 border-b border-gray-300">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="-mb-px flex items-center gap-1 overflow-x-auto py-1">
              {ADMIN_TABS.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                      isActive
                        ? "border-primary text-primary"
                        : "text-muted-foreground hover:text-foreground hover:border-border border-transparent"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {t(`admin.tabs.${tab.id}`)}
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{renderTab()}</div>
      </div>

      <Footer />
    </main>
  )
}
