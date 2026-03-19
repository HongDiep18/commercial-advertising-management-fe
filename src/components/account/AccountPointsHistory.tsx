"use client"

import { useState } from "react"
import { Gift, ArrowRight, ImageIcon, Megaphone, ShoppingCart, TrendingUp, TrendingDown } from "lucide-react"
import { useTranslation } from "react-i18next"
import { format } from "date-fns"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import { usePointsHistory } from "@/api/loyalty"
import { PointsSource } from "@/api/loyalty/types"
import { AccountPointsHistoryModal } from "./AccountPointsHistoryModal"

// Icon mapping for transaction sources
const SOURCE_ICONS = {
  [PointsSource.REGISTRATION]: Gift,
  [PointsSource.LOGO_UPLOAD]: ImageIcon,
  [PointsSource.AD_PURCHASE]: Megaphone,
  [PointsSource.STORE_PURCHASE]: ShoppingCart,
  [PointsSource.ADMIN_ADJUSTMENT]: TrendingUp,
  [PointsSource.ADMIN_DEDUCTION]: TrendingDown,
}

const SOURCE_COLORS = {
  [PointsSource.REGISTRATION]: "bg-green-100 text-green-600",
  [PointsSource.LOGO_UPLOAD]: "bg-blue-100 text-blue-600",
  [PointsSource.AD_PURCHASE]: "bg-purple-100 text-purple-600",
  [PointsSource.STORE_PURCHASE]: "bg-orange-100 text-orange-600",
  [PointsSource.ADMIN_ADJUSTMENT]: "bg-emerald-100 text-emerald-600",
  [PointsSource.ADMIN_DEDUCTION]: "bg-red-100 text-red-600",
}

// Skeleton loader component
function AccountPointsHistorySkeleton() {
  return (
    <Card className="h-fit animate-pulse">
      <Card.Header className="pb-4">
        <div className="h-6 bg-gray-300 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
      </Card.Header>
      <Card.Content>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-300 rounded-xl"></div>
          ))}
        </div>
      </Card.Content>
    </Card>
  )
}

// Error state component
function AccountPointsHistoryError() {
  const { t } = useTranslation()
  return (
    <Card className="h-fit border-red-200 bg-red-50">
      <Card.Header className="pb-4">
        <Card.Title className="flex items-center gap-2 text-red-600">
          <Gift className="h-5 w-5" />
          {t("account.pointsHistory") || "點數紀錄"}
        </Card.Title>
      </Card.Header>
      <Card.Content>
        <p className="text-sm text-red-600">{t("account.errorLoadingHistory")}</p>
      </Card.Content>
    </Card>
  )
}

// Empty state component
function AccountPointsHistoryEmpty() {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <Gift className="h-12 w-12 text-gray-400" />
      <p className="mt-2 font-medium text-gray-700">{t("account.noPointsHistory")}</p>
      <p className="text-sm text-gray-500">{t("account.noPointsHistoryDesc")}</p>
    </div>
  )
}

export function AccountPointsHistory() {
  const { t } = useTranslation()
  const [showAllModal, setShowAllModal] = useState(false)
  const { data, isLoading, isError } = usePointsHistory({ page: 1, limit: 5 })

  if (isLoading) return <AccountPointsHistorySkeleton />
  if (isError) return <AccountPointsHistoryError />

  const transactions = data?.data || []
  const totalPoints = transactions.length > 0 ? transactions[0].balance : 0

  return (
    <>
      <Card className="h-fit">
        <Card.Header className="pb-4">
          <Card.Title className="flex items-center gap-2">
            <Gift className="text-primary h-5 w-5" />
            {t("account.pointsHistory") || "點數紀錄"}
          </Card.Title>
          <p className="text-muted-foreground mt-1 text-sm">
            {t("account.totalPoints") || "累計獲得"} {totalPoints.toLocaleString()}{" "}
            {t("account.points") || "點"}
          </p>
        </Card.Header>
        <Card.Content>
          {transactions.length === 0 ? (
            <AccountPointsHistoryEmpty />
          ) : (
            <>
              <div className="space-y-3">
                {transactions.map((transaction) => {
                  const Icon = SOURCE_ICONS[transaction.source] || Gift
                  const colorClass = SOURCE_COLORS[transaction.source] || "bg-gray-100 text-gray-600"
                  const isPositive = transaction.points >= 0

                  return (
                    <div
                      key={transaction.id}
                      className="bg-body-bg-dark flex items-center gap-4 rounded-xl p-4"
                    >
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colorClass}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-foreground font-medium">{transaction.description}</p>
                        <p className="text-muted-foreground mt-0.5 text-sm">
                          {format(new Date(transaction.createdAt), "yyyy-MM-dd HH:mm")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${isPositive ? "text-green-600" : "text-red-600"}`}>
                          {isPositive ? "+" : ""}{transaction.points.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
              <Button
                variant="ghost"
                className="hover:!bg-header-red-dark mt-4 w-full border !border-gray-400 bg-transparent hover:!text-white"
                onClick={() => setShowAllModal(true)}
              >
                {t("account.viewAllRecords") || "查看全部紀錄"}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </>
          )}
        </Card.Content>
      </Card>

      {/* Modal */}
      <AccountPointsHistoryModal open={showAllModal} onClose={() => setShowAllModal(false)} />
    </>
  )
}
