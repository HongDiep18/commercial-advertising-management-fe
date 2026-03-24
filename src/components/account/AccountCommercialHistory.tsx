"use client"

import { ArrowRight, Megaphone } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useMyAdOrders } from "@/api/ad-orders/hooks"
import { VndPrice } from "@/components/VndPrice"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import { formatDateTimeForLocale } from "@/utils/datetime"
import type { TFunction } from "i18next"

type AccountCommercialHistoryProps = {
  t: TFunction
  onViewAll?: () => void
}

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  SUBMITTED: "bg-blue-100 text-blue-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
}

function getStatusLabel(status: string, t: TFunction): string {
  const upper = status?.toUpperCase() || ""
  if (upper === "DRAFT") return t("account.orderStatusDraft", { defaultValue: "Draft" })
  if (upper === "SUBMITTED") {
    return t("account.orderStatusSubmitted", { defaultValue: "Submitted" })
  }
  if (upper === "PENDING") return t("account.orderStatusPending", { defaultValue: "Pending" })
  if (upper === "APPROVED") {
    return t("account.orderStatusApproved", { defaultValue: "Approved" })
  }
  if (upper === "REJECTED") {
    return t("account.orderStatusRejected", { defaultValue: "Rejected" })
  }
  return status || "-"
}

function summarizePackages(packageNames: string[]): string {
  if (packageNames.length === 0) return "-"
  const preview = packageNames.slice(0, 2).join(", ")
  const remaining = packageNames.length - 2
  return remaining > 0 ? `${preview} +${remaining}` : preview
}

export function AccountCommercialHistory({ t, onViewAll }: AccountCommercialHistoryProps) {
  const { i18n } = useTranslation()
  const { data, isLoading, isError } = useMyAdOrders(
    {
      page: 1,
      limit: 4,
      sortBy: "createdAt",
      sortOrder: "desc",
    },
    true
  )

  const orders = data?.orders ?? []

  return (
    <Card className="h-fit lg:col-span-2">
      <Card.Header className="pb-4">
        <Card.Title className="flex items-center gap-2">
          <Megaphone className="text-primary h-5 w-5" />
          {t("account.adHistory") || "廣告投放 / 消費紀錄"}
        </Card.Title>
        <p className="text-muted-foreground mt-1 text-sm">
          {t("account.adHistoryDesc") || "您的廣告投放與消費歷史"}
        </p>
      </Card.Header>
      <Card.Content>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="bg-body-bg-light animate-pulse rounded-xl p-4">
                <div className="h-4 w-2/3 rounded bg-gray-300" />
                <div className="mt-2 h-3 w-1/2 rounded bg-gray-300" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <p className="text-sm text-red-600">
            {t("account.errorLoadingOrders", { defaultValue: "Error loading ad orders" })}
          </p>
        ) : orders.length === 0 ? (
          <div className="py-4 text-center">
            <p className="text-muted-foreground text-sm font-medium">
              {t("account.noAdOrders", { defaultValue: "No ad orders yet" })}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              {t("account.noAdOrdersDesc", {
                defaultValue: "Place your first ad order from the Advertising Contact page.",
              })}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const packageNames = Array.from(
                new Set(order.items.map((item) => item.packageName).filter(Boolean))
              )
              const statusClass = STATUS_STYLES[order.status] ?? "bg-gray-100 text-gray-700"

              return (
                <div
                  key={order.id}
                  className="bg-body-bg-light flex items-center gap-4 rounded-xl p-4"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                    <Megaphone className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground truncate text-sm font-medium">
                      {summarizePackages(packageNames)}
                    </p>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      {formatDateTimeForLocale(order.createdAt, i18n.language)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-foreground text-sm font-semibold">
                      <VndPrice value={order.totalAmount} />
                    </p>
                    <p className="mt-1">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusClass}`}>
                        {getStatusLabel(order.status, t)}
                      </span>
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <Button
          variant="ghost"
          className="hover:!bg-header-red-dark mt-4 w-full border !border-gray-400 bg-transparent hover:!text-white"
          onClick={onViewAll}
        >
          {t("account.viewAllRecords") || "查看全部紀錄"}
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </Card.Content>
    </Card>
  )
}
