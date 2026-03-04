"use client"

import Link from "next/link"
import { User, Shield, Edit3 } from "lucide-react"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import type { User as UserType } from "@/contexts/user-context"
import type { MembershipTier } from "@/contexts/user-context"
import type { TFunction } from "i18next"
import { UserRole } from "@/contexts/user-context"

type TierConfig = { label: string; bgColor: string; color: string }

type AccountHeroCardProps = {
  user: UserType
  memberTier: MembershipTier
  tierConfig: TierConfig
  companyLogo: string | null
  logoUploaded: boolean
  t: TFunction
  onViewBenefits: () => void
  onEditProfile: () => void
}

export function AccountHeroCard({
  user,
  memberTier,
  tierConfig,
  companyLogo,
  logoUploaded,
  t,
  onViewBenefits,
  onEditProfile,
}: AccountHeroCardProps) {
  return (
    <Card className="bg-card/80 border-0 shadow-lg">
      <Card.Content className="p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row">
          <div
            className={`border-border flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 ${!companyLogo ? tierConfig.bgColor : ""}`}
          >
            {companyLogo ? (
              <img
                src={companyLogo}
                alt={t("account.companyLogo") || "公司 Logo"}
                className="h-full w-full object-cover"
              />
            ) : (
              <User className={`h-12 w-12 ${tierConfig.color}`} />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <h1 className="text-foreground text-2xl font-bold">{user.name}</h1>
              <span
                className={`rounded-full px-3 py-1 text-sm font-medium ${tierConfig.bgColor} ${tierConfig.color}`}
              >
                {user.role === UserRole.Admin
                  ? t("account.tiers.admin") || "管理員"
                  : t("account.tiers." + memberTier) || tierConfig.label}
              </span>
            </div>
            <p className="text-muted-foreground">{user.email}</p>
            <p className="text-muted-foreground mt-1 text-sm">
              {t("account.memberSince") || "會員加入日期"}：{user.createdAt}
            </p>

            <div className="border-border mt-4 flex flex-wrap gap-2 border-t pt-4">
              <Button
                variant="outline"
                size="sm"
                className="hover:!bg-header-red-dark bg-transparent hover:text-white"
                onClick={onViewBenefits}
              >
                <Shield className="mr-1.5 h-4 w-4" />
                {t("account.viewBenefits") || "查看會員權益"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="hover:!bg-header-red-dark relative bg-transparent hover:text-white"
                onClick={onEditProfile}
              >
                <Edit3 className="mr-1.5 h-4 w-4" />
                {t("account.editProfile") || "編輯會員資料"}
                {!logoUploaded && (
                  <span className="bg-primary text-primary-foreground absolute -top-2 -right-2 flex h-5 w-5 animate-pulse items-center justify-center rounded-full text-xs">
                    !
                  </span>
                )}
              </Button>
              {user.role === UserRole.Admin && (
                <Button
                  size="sm"
                  asChild
                  className="hover:!bg-header-red-dark/80 !bg-header-red-dark border !border-gray-400"
                >
                  <Link href="/admin">
                    <Shield className="mr-1.5 h-4 w-4" />
                    {t("account.goAdmin") || "進入管理後台"}
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card.Content>
    </Card>
  )
}
