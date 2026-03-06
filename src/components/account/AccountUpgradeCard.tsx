"use client"

import { TrendingUp, ArrowRight } from "lucide-react"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import type { User as UserType } from "@/contexts/user-context"
import type { MembershipTier } from "@/contexts/user-context"
import { UserRole } from "@/contexts/user-context"
import { MEMBERSHIP_CONFIG, MEMBERSHIP_THRESHOLDS } from "@/contexts/user-context"
import type { TFunction } from "i18next"

type TierConfig = { label: string; bgColor: string; color: string }

type NextTierInfo = { nextTier: MembershipTier | null; pointsNeeded: number }

type AccountUpgradeCardProps = {
  user: UserType
  memberTier: MembershipTier
  tierConfig: TierConfig
  totalPoints: number
  nextTierInfo: NextTierInfo | null
  progressInTier: number
  t: TFunction
  onHowToUpgrade: () => void
}

export function AccountUpgradeCard({
  user,
  memberTier,
  tierConfig,
  totalPoints,
  nextTierInfo,
  progressInTier,
  t,
  onHowToUpgrade,
}: AccountUpgradeCardProps) {
  if (!nextTierInfo || nextTierInfo.nextTier == null) return null

  const nextThreshold = MEMBERSHIP_THRESHOLDS[nextTierInfo.nextTier]
  const nextLabel = MEMBERSHIP_CONFIG[nextTierInfo.nextTier].label

  return (
    <Card className="border-primary/20 from-primary/5 to-primary/10 h-fit bg-gradient-to-br">
      <Card.Header className="pb-4">
        <Card.Title className="text-primary flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          {t("account.upgradeProgress") || "升級進度"}
        </Card.Title>
        <p className="text-muted-foreground mt-1 text-sm">
          {t("account.currentTier") || "目前等級"}：
          {user.role === UserRole.Admin
            ? t("account.tiers.admin")
            : t("account.tiers." + memberTier) || tierConfig.label}{" "}
          | {t("account.nextTier") || "下一等級"}：{nextLabel}
        </p>
      </Card.Header>
      <Card.Content className="space-y-5">
        <div>
          <div className="mb-3 flex justify-between text-sm">
            <span className="text-foreground font-medium">
              {totalPoints.toLocaleString()} / {nextThreshold.toLocaleString()}{" "}
              {t("account.points") || "點"}
            </span>
            <span className="text-primary font-semibold">
              {Math.min(100, Math.max(0, progressInTier)).toFixed(1)}%
            </span>
          </div>
          <div className="bg-body-bg-dark-foreground h-4 w-full overflow-hidden rounded-full">
            <div
              className="bg-primary h-full rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(100, Math.max(0, progressInTier))}%`,
              }}
            />
          </div>
        </div>
        <div className="bg-background/60 flex flex-col items-start justify-between gap-4 rounded-xl p-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-muted-foreground text-sm">
              {t("account.pointsToUpgrade") || "距離升級還需"}
            </p>
            <p className="text-primary text-2xl font-bold">
              {nextTierInfo.pointsNeeded.toLocaleString()} {t("account.points") || "點"}
            </p>
          </div>
          <Button
            className="!bg-header-red-dark hover:!bg-header-red-dark/80 hover:!text-white"
            onClick={onHowToUpgrade}
          >
            {t("account.howToUpgrade") || "查看升級方式"}
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </Card.Content>
    </Card>
  )
}
