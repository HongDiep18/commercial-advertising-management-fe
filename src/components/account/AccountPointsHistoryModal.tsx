"use client"

import { useState } from "react"
import { X, Gift, ImageIcon, Megaphone, ShoppingCart, TrendingUp, TrendingDown, ChevronLeft, ChevronRight } from "lucide-react"
import { useTranslation } from "react-i18next"
import { format } from "date-fns"
import Button from "@/components/ui/Button"
import { usePointsHistory } from "@/api/loyalty"
import { PointsSource } from "@/api/loyalty/types"
import type { PointsTransaction } from "@/api/loyalty/types"

type AccountPointsHistoryModalProps = {
  open: boolean
  onClose: () => void
}

const ITEMS_PER_PAGE = 20

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
  [PointsSource.REGISTRATION]: "text-green-600 bg-green-100",
  [PointsSource.LOGO_UPLOAD]: "text-blue-600 bg-blue-100",
  [PointsSource.AD_PURCHASE]: "text-purple-600 bg-purple-100",
  [PointsSource.STORE_PURCHASE]: "text-orange-600 bg-orange-100",
  [PointsSource.ADMIN_ADJUSTMENT]: "text-emerald-600 bg-emerald-100",
  [PointsSource.ADMIN_DEDUCTION]: "text-red-600 bg-red-100",
}

export function AccountPointsHistoryModal({ open, onClose }: AccountPointsHistoryModalProps) {
  const { t } = useTranslation()
  const [currentPage, setCurrentPage] = useState(1)
  const [sourceFilter, setSourceFilter] = useState<PointsSource | "ALL">("ALL")

  const { data, isLoading, isError } = usePointsHistory({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    source: sourceFilter === "ALL" ? undefined : sourceFilter,
  })

  if (!open) return null

  const transactions = data?.data || []
  const totalPages = data?.meta.totalPages || 1
  const total = data?.meta.total || 0

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const getSourceIcon = (source: PointsSource) => {
    const Icon = SOURCE_ICONS[source] || Gift
    return Icon
  }

  const getSourceColor = (source: PointsSource) => {
    return SOURCE_COLORS[source] || "text-gray-600 bg-gray-100"
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-body-bg-dark mt-12 max-h-[85vh] w-full max-w-4xl overflow-y-auto rounded-lg">
        {/* Header */}
        <div className="bg-body-bg-dark border-border sticky top-0 z-10 flex items-center justify-between border-b border-gray-300 px-6 py-4">
          <h2 className="text-lg font-semibold">
            {t("account.pointsHistoryModal")}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label={t("account.closeModal")}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Filter */}
        <div className="border-b border-gray-300 px-6 py-4">
          <label className="mb-2 block text-sm font-medium">
            {t("account.filterBySource")}
          </label>
          <select
            value={sourceFilter}
            onChange={(e) => {
              setSourceFilter(e.target.value as PointsSource | "ALL")
              setCurrentPage(1) // Reset to page 1 when filter changes
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">{t("account.sourceAll")}</option>
            <option value={PointsSource.REGISTRATION}>{t("account.sourceRegistration")}</option>
            <option value={PointsSource.LOGO_UPLOAD}>{t("account.sourceLogoUpload")}</option>
            <option value={PointsSource.AD_PURCHASE}>{t("account.sourceAdPurchase")}</option>
            <option value={PointsSource.STORE_PURCHASE}>{t("account.sourceStorePurchase")}</option>
            <option value={PointsSource.ADMIN_ADJUSTMENT}>{t("account.sourceAdminAdjustment")}</option>
            <option value={PointsSource.ADMIN_DEDUCTION}>{t("account.sourceAdminDeduction")}</option>
          </select>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-primary mx-auto"></div>
                <p className="text-sm text-gray-600">{t("account.loadingHistory")}</p>
              </div>
            </div>
          )}

          {isError && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-sm text-red-600">{t("account.errorLoadingHistory")}</p>
              </div>
            </div>
          )}

          {!isLoading && !isError && transactions.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Gift className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 font-medium text-gray-700">{t("account.noPointsHistory")}</p>
                <p className="text-sm text-gray-500">{t("account.noPointsHistoryDesc")}</p>
              </div>
            </div>
          )}

          {!isLoading && !isError && transactions.length > 0 && (
            <>
              <div className="mb-4 text-sm text-gray-600">
                {t("account.allTransactions")} ({total})
              </div>
              <div className="space-y-3">
                {transactions.map((transaction: PointsTransaction) => {
                  const Icon = getSourceIcon(transaction.source)
                  const colorClass = getSourceColor(transaction.source)
                  const isPositive = transaction.points >= 0

                  return (
                    <div
                      key={transaction.id}
                      className="flex items-center gap-4 rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className={`rounded-full p-2 ${colorClass}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(transaction.createdAt), "yyyy-MM-dd HH:mm")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${isPositive ? "text-green-600" : "text-red-600"}`}>
                          {isPositive ? "+" : ""}{transaction.points.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          {t("account.transactionBalance")}: {transaction.balance.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
                  <div className="text-sm text-gray-600">
                    {t("account.page")} {currentPage} {t("account.of")} {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      {t("account.previousPage")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                    >
                      {t("account.nextPage")}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-300 px-6 py-4">
          <Button
            className="!bg-header-red-dark hover:!bg-header-red-dark/80 w-full"
            onClick={onClose}
          >
            {t("account.closeModal")}
          </Button>
        </div>
      </div>
    </div>
  )
}
