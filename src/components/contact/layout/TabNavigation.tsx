"use client"

import { TabType, getTabConfig } from "@/utils/contactHelpers"
import { useTranslation } from "react-i18next"

interface TabNavigationProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const { t } = useTranslation()
  const tabConfig = getTabConfig(t)

  return (
    <section className="bg-body-bg-light border-border sticky top-14 z-40 border-b">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex overflow-x-auto">
          {(Object.keys(tabConfig) as TabType[]).map((tab) => {
            const config = tabConfig[tab]
            return (
              <button
                key={tab}
                onClick={() => onTabChange(tab)}
                className={`flex items-center gap-2 border-b-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground hover:border-border border-transparent"
                }`}
              >
                {config.title}
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
