"use client"

import { useRouter } from "next/navigation"
import { useTranslation } from "react-i18next"
import { useUser, UserRole } from "@/contexts/user-context"
import { DEMO_ACCOUNTS, DEMO_TITLE_FALLBACKS } from "./demoConstants"
import { DEMO_USERS } from "./demoUsers"

interface DemoLoginButtonsProps {
  disabled?: boolean
}

export function DemoLoginButtons({ disabled = false }: DemoLoginButtonsProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const { setUser } = useUser()

  const handleDemoLogin = (tier: string) => {
    const demoUser = DEMO_USERS[tier]
    if (demoUser) {
      setUser(demoUser)
      router.push(tier === UserRole.Admin ? "/account" : "/account")
    }
  }

  return (
    <div className="flex flex-wrap justify-center gap-2 pt-2">
      {DEMO_ACCOUNTS.map((account) => (
        <button
          key={account.tier}
          type="button"
          onClick={() => handleDemoLogin(account.tier)}
          disabled={disabled}
          className="text-muted-foreground/60 hover:text-muted-foreground text-xs underline disabled:opacity-50"
        >
          {t(`login.demo.${account.tier}`) || DEMO_TITLE_FALLBACKS[account.tier] || account.tier}
        </button>
      ))}
    </div>
  )
}
