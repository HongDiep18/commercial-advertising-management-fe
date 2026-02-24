'use client'

import { TabType, getTabConfig } from '../../utils/contactHelpers'
import { useTranslation } from 'react-i18next'

interface TabNavigationProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const { t } = useTranslation()
  const tabConfig = getTabConfig(t)

  return (
    <section className="bg-body-bg-light border-b border-border sticky top-14 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex overflow-x-auto">
          {(Object.keys(tabConfig) as TabType[]).map((tab) => {
            const config = tabConfig[tab]
            return (
              <button
                key={tab}
                onClick={() => onTabChange(tab)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
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
