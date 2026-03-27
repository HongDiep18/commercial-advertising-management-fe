"use client"

import Link from "next/link"
import { Info, X, Gift, ImageIcon, Megaphone, ShoppingCart } from "lucide-react"
import Button from "@/components/ui/Button"
import { CONTRIBUTION_VALUES } from "@/contexts/user-context"
import type { TFunction } from "i18next"

type AccountUpgradeModalProps = {
  open: boolean
  onClose: () => void
  t: TFunction
}

export function AccountUpgradeModal({ open, onClose, t }: AccountUpgradeModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-body-bg-dark mt-12 max-h-[85vh] w-full max-w-md overflow-y-auto rounded-lg">
        <div className="bg-body-bg-dark sticky top-0 z-10 flex items-center justify-between border-b border-gray-400 px-6 py-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Info className="text-primary h-5 w-5" />
            {t("account.howToGetPoints") || "如何獲得貢獻值"}
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
        <div className="space-y-6 p-6">
          <div className="space-y-4">
            <h3 className="text-muted-foreground text-sm font-medium">
              1. {t("account.laborContribution") || "勞力貢獻"}
            </h3>
            <div className="space-y-3">
              <div className="bg-body-bg-dark-foreground flex items-center justify-between rounded-lg p-3 text-sm">
                <span className="flex items-center gap-2">
                  <Gift className="text-primary h-4 w-4" />
                  {t("account.registerAndFill") || "註冊並填寫自家資料"}
                </span>
                <span className="text-primary font-semibold">
                  +{CONTRIBUTION_VALUES.registration.toLocaleString()}
                </span>
              </div>
              <p className="text-muted-foreground ml-2 text-xs">
                {t("account.newbieBonus") || "新手禮包（直接升銅牌）"}
              </p>
              <div className="bg-body-bg-dark-foreground flex items-center justify-between rounded-lg p-3 text-sm">
                <span className="flex items-center gap-2">
                  <ImageIcon className="text-primary h-4 w-4" />
                  {t("account.uploadLogoTask") || "(任務) 上傳自家 Logo"}
                </span>
                <span className="text-primary font-semibold">
                  +{CONTRIBUTION_VALUES.logo.toLocaleString()}
                </span>
              </div>
              <p className="text-muted-foreground ml-2 text-xs">
                {t("account.uploadLogoHint") || "鼓勵完善門面"}
              </p>
            </div>
          </div>
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-muted-foreground text-sm font-medium">
              2. {t("account.commercialSpending") || "商業消費"}
            </h3>
            <div className="space-y-3">
              <div className="bg-body-bg-dark-foreground flex items-center justify-between rounded-lg p-3 text-sm">
                <span className="flex items-center gap-2">
                  <Megaphone className="text-primary h-4 w-4" />
                  {t("account.buyAd") || "購買廣告"}
                </span>
                <span className="text-primary font-semibold">1 VND = 1 {t("account.points")}</span>
              </div>
              <p className="text-muted-foreground ml-2 text-xs">
                {t("account.buyAdDiamondHint") || "花 55 萬買廣告，直接送鑽石會員"}
              </p>

              <div className="bg-body-bg-dark-foreground flex items-center justify-between rounded-lg p-3 text-sm">
                <span className="flex items-center gap-2">
                  <ShoppingCart className="text-primary h-4 w-4" />
                  {t("account.shopSpending") || "商城消費"}
                </span>
                <span className="text-primary font-semibold">1 VND = 1 {t("account.points")}</span>
              </div>
              <p className="text-muted-foreground ml-2 text-xs">
                {t("account.shopSpendingHint") || "買茶葉送名錄，升級看全站資料"}
              </p>
            </div>
          </div>
          <div className="space-y-3 border-t pt-4">
            <Button
              className="!bg-header-red-dark hover:!bg-header-red-dark/80 w-full hover:!text-white"
              asChild
            >
              <Link href="/contact">
                <Megaphone className="mr-2 h-4 w-4" />
                {t("account.goToAd") || "前往投放廣告"}
              </Link>
            </Button>
            <Button
              variant="outline"
              className="hover:!bg-header-red-dark w-full border !border-gray-400 bg-transparent hover:!text-white"
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
