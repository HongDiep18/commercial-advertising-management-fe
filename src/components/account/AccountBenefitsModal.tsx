"use client"

import { Shield, X, CheckCircle2 } from "lucide-react"
import Button from "@/components/ui/Button"
import { MembershipTier, MEMBERSHIP_CONFIG, MEMBERSHIP_THRESHOLDS } from "@/contexts/user-context"
import type { TFunction } from "i18next"

type AccountBenefitsModalProps = {
  open: boolean
  onClose: () => void
  memberTier: MembershipTier
  t: TFunction
}

const TIERS: MembershipTier[] = Object.values(MembershipTier)

export function AccountBenefitsModal({ open, onClose, memberTier, t }: AccountBenefitsModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-body-bg-dark mt-12 max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-lg">
        <div className="bg-body-bg-dark border-border sticky top-0 z-10 flex items-center justify-between border-b border-gray-300 px-6 py-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Shield className="text-primary h-5 w-5" />
            {t("account.membershipBenefits") || "會員等級與權益"}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label={t("common.close") || "關閉"}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="space-y-4 p-6">
          {TIERS.map((tier) => {
            const config = MEMBERSHIP_CONFIG[tier]
            const isCurrentTier = memberTier === tier
            return (
              <div
                key={tier}
                className={`rounded-lg border-2 p-4 ${isCurrentTier ? "border-primary bg-primary/5" : "border-border border-gray-300"
                  }`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${config.bgColor} ${config.color}`}
                    >
                      {t(`account.tiers.${tier}`) || config.label}
                    </span>
                    {isCurrentTier && (
                      <span className="text-primary text-xs font-medium">
                        （{t("account.currentTierLabel") || "目前等級"}）
                      </span>
                    )}
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-medium text-primary">{MEMBERSHIP_THRESHOLDS[tier].toLocaleString()} {t("account.points")}</p>
                    <p className="text-muted-foreground text-xs font-medium">
                      {t(`account.tierSpending.${tier}`) || config.spendingRequired}
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  {config.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-600" />
                      <span>
                        {t(`account.tierBenefits.${tier}.${i}`, { defaultValue: benefit })}
                      </span>
                    </div>
                  ))}
                  {config.restrictions.length > 0 &&
                    config.restrictions.map((restriction, i) => (
                      <div
                        key={`r-${i}`}
                        className="text-muted-foreground flex items-center gap-2 text-sm"
                      >
                        <X className="h-4 w-4 flex-shrink-0 text-red-500" />
                        <span>
                          {t(`account.tierRestrictions.${tier}.${i}`, {
                            defaultValue: restriction,
                          })}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )
          })}
          <div className="border-t pt-4">
            <Button
              className="!bg-header-red-dark hover:!bg-header-red-dark/80 w-full"
              onClick={onClose}
            >
              {t("common.close") || "關閉"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
