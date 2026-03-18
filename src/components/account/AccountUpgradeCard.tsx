"use client"

import { TrendingUp, ArrowRight } from "lucide-react"
import { useTranslation } from "react-i18next"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import { useTierInfo } from "@/api/loyalty"
import { MEMBERSHIP_CONFIG, MEMBERSHIP_THRESHOLDS } from "@/contexts/user-context"

type AccountUpgradeCardProps = {
  onHowToUpgrade: () => void
}

// Skeleton loader component
function AccountUpgradeCardSkeleton() {
  return (
    <Card className="border-primary/20 from-primary/5 to-primary/10 h-fit bg-gradient-to-br animate-pulse">
      <Card.Header className="pb-4">
        <div className="h-6 bg-gray-300 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-2/3"></div>
      </Card.Header>
      <Card.Content className="space-y-5">
        <div>
          <div className="mb-3 flex justify-between">
            <div className="h-4 bg-gray-300 rounded w-1/3"></div>
            <div className="h-4 bg-gray-300 rounded w-12"></div>
          </div>
          <div className="h-4 bg-gray-300 rounded w-full"></div>
        </div>
        <div className="h-24 bg-gray-300 rounded-xl"></div>
      </Card.Content>
    </Card>
  )
}

// Error state component
function AccountUpgradeCardError() {
  const { t } = useTranslation()
  return (
    <Card className="border-red-200 bg-red-50 h-fit">
      <Card.Header className="pb-4">
        <Card.Title className="text-red-600 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          {t("account.upgradeProgress") || "升級進度"}
        </Card.Title>
      </Card.Header>
      <Card.Content>
        <p className="text-sm text-red-600">{t("account.errorLoadingHistory")}</p>
      </Card.Content>
    </Card>
  )
}

export function AccountUpgradeCard({ onHowToUpgrade }: AccountUpgradeCardProps) {
  const { t } = useTranslation()
  const { data: tierInfo, isLoading, isError } = useTierInfo()

  if (isLoading) return <AccountUpgradeCardSkeleton />
  if (isError || !tierInfo) return <AccountUpgradeCardError />

  const currentTier = tierInfo.currentTier
  const currentPoints = tierInfo.currentPoints
  const nextTier = tierInfo.nextTier
  const pointsToNextTier = tierInfo.pointsToNextTier

  const tierConfig = MEMBERSHIP_CONFIG[currentTier as keyof typeof MEMBERSHIP_CONFIG]

  // If already at max tier, show completion card
  if (!nextTier || pointsToNextTier === null) {
    return (
      <Card className="border-primary/20 from-primary/5 to-primary/10 h-fit bg-gradient-to-br">
        <Card.Header className="pb-4">
          <Card.Title className="text-primary flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {t("account.upgradeProgress") || "升級進度"}
          </Card.Title>
          <p className="text-muted-foreground mt-1 text-sm">
            {t("account.currentTier") || "目前等級"}：
            {t(`account.tiers.${currentTier}`) || tierConfig?.label || currentTier}{" "}
            <span className="text-amber-600 font-semibold">
              ({t("account.maxTier") || "最高等級"})
            </span>
          </p>
        </Card.Header>
        <Card.Content className="space-y-5">
          <div>
            <div className="mb-3 flex justify-between text-sm">
              <span className="text-foreground font-medium">
                {currentPoints.toLocaleString()} {t("account.points") || "點"}
              </span>
              <span className="text-amber-600 font-semibold">100%</span>
            </div>
            <div className="bg-body-bg-dark-foreground h-4 w-full overflow-hidden rounded-full">
              <div
                className="bg-gradient-to-r from-amber-500 to-yellow-500 h-full rounded-full transition-all duration-300"
                style={{ width: "100%" }}
              />
            </div>
          </div>
          <div className="bg-background/60 rounded-xl p-4 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              {t("account.congratulations") || "恭喜！"}
            </p>
            <p className="font-medium">
              {t("account.diamondMemberStatus") || "您已達到最高鑽石會員等級"}
            </p>
          </div>
        </Card.Content>
      </Card>
    )
  }

  // Calculate progress percentage for non-max tiers
  const nextThreshold = MEMBERSHIP_THRESHOLDS[nextTier as keyof typeof MEMBERSHIP_THRESHOLDS]
  const currentThreshold = MEMBERSHIP_THRESHOLDS[currentTier as keyof typeof MEMBERSHIP_THRESHOLDS]
  const progressInTier = nextThreshold > 0
    ? ((currentPoints - currentThreshold) / (nextThreshold - currentThreshold)) * 100
    : 0

  const nextTierConfig = MEMBERSHIP_CONFIG[nextTier as keyof typeof MEMBERSHIP_CONFIG]

  return (
    <Card className="border-primary/20 from-primary/5 to-primary/10 h-fit bg-gradient-to-br">
      <Card.Header className="pb-4">
        <Card.Title className="text-primary flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          {t("account.upgradeProgress") || "升級進度"}
        </Card.Title>
        <p className="text-muted-foreground mt-1 text-sm">
          {t("account.currentTier") || "目前等級"}：
          {t(`account.tiers.${currentTier}`) || tierConfig?.label || currentTier}{" "}
          | {t("account.nextTier") || "下一等級"}：
          {t(`account.tiers.${nextTier}`) || nextTierConfig?.label || nextTier}
        </p>
      </Card.Header>
      <Card.Content className="space-y-5">
        <div>
          <div className="mb-3 flex justify-between text-sm">
            <span className="text-foreground font-medium">
              {currentPoints.toLocaleString()} / {nextThreshold.toLocaleString()}{" "}
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
              {pointsToNextTier.toLocaleString()} {t("account.points") || "點"}
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
