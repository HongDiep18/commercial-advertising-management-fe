"use client"

import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, ExternalLink, Eye, Megaphone, X } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useMyAdOrders } from "@/api/ad-orders/hooks"
import type { MyAdOrder } from "@/api/ad-orders/service"
import { VndPrice } from "@/components/VndPrice"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog"
import { formatDateTimeForLocale } from "@/utils/datetime"
import type { TFunction } from "i18next"

type StatusFilter = "ALL" | "DRAFT" | "SUBMITTED" | "PENDING" | "APPROVED" | "REJECTED"

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  SUBMITTED: "bg-blue-100 text-blue-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
}

const STATUS_OPTIONS: StatusFilter[] = [
  "ALL",
  "DRAFT",
  "SUBMITTED",
  "PENDING",
  "APPROVED",
  "REJECTED",
]

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
  const preview = packageNames.slice(0, 3).join(", ")
  const remaining = packageNames.length - 3
  return remaining > 0 ? `${preview} +${remaining}` : preview
}

function formatOrderId(orderId: string): string {
  if (!orderId) return "-"
  if (orderId.length <= 16) return orderId
  return `${orderId.slice(0, 8)}...${orderId.slice(-4)}`
}

function getOrderStartDate(order: MyAdOrder): string | null {
  const rawDates = order.items.map((item) => item.startDate).filter(Boolean)
  if (rawDates.length === 0) return null

  const parsedDates = rawDates
    .map((dateStr) => ({
      raw: dateStr,
      date: new Date(dateStr.trim().replace(" ", "T")),
    }))
    .filter((entry) => !Number.isNaN(entry.date.getTime()))
    .sort((a, b) => a.date.getTime() - b.date.getTime())

  if (parsedDates.length > 0) return parsedDates[0].raw
  return rawDates[0]
}

export function AccountAdOrdersSection() {
  const { t, i18n } = useTranslation()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState<MyAdOrder | null>(null)

  const query = useMemo(
    () => ({
      status: statusFilter === "ALL" ? undefined : statusFilter,
      page: currentPage,
      limit: 10,
      sortBy: "createdAt",
      sortOrder: "desc",
    }),
    [statusFilter, currentPage]
  )

  const { data, isLoading, isError } = useMyAdOrders(query, true)
  const orders = data?.orders ?? []
  const totalPages = Math.max(1, data?.pagination?.totalPages ?? 1)

  return (
    <Card className="h-fit lg:col-span-2">
      <Card.Header className="pb-4">
        <Card.Title className="flex items-center gap-2">
          <Megaphone className="text-primary h-5 w-5" />
          {t("account.adOrdersSectionTitle", { defaultValue: "All ad orders" })}
        </Card.Title>
        <p className="text-muted-foreground mt-1 text-sm">
          {t("account.adOrdersSectionDesc", {
            defaultValue: "View detailed status and spending for your ad orders.",
          })}
        </p>
      </Card.Header>

      <Card.Content>
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">
            {t("account.adOrdersFilterStatus", { defaultValue: "Filter by status" })}
          </label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as StatusFilter)
              setCurrentPage(1)
            }}
            className="focus:border-primary focus:ring-primary w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-1 focus:outline-none"
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status === "ALL"
                  ? t("account.adOrdersFilterAll", { defaultValue: "All" })
                  : getStatusLabel(status, t)}
              </option>
            ))}
          </select>
        </div>

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
          <div className="py-6 text-center">
            <p className="text-muted-foreground text-sm font-medium">
              {t("account.adOrdersNoData", { defaultValue: "No ad orders found" })}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              {t("account.adOrdersNoDataDesc", {
                defaultValue: "Try another status filter or place your first ad order.",
              })}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const packageNames = Array.from(
                new Set(order.items.map((item) => item.packageName).filter(Boolean))
              )
              const orderStatus = order.status?.toUpperCase() || ""
              const statusClass = STATUS_STYLES[orderStatus] ?? "bg-gray-100 text-gray-700"
              const orderStartDate = getOrderStartDate(order)

              return (
                <div key={order.id} className="bg-body-bg-light rounded-xl p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-foreground text-sm font-semibold">
                      {t("account.adOrdersOrderId", { defaultValue: "Order" })}:{" "}
                      {formatOrderId(order.id)}
                    </p>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusClass}`}
                      >
                        {getStatusLabel(order.status, t)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full border border-gray-300 !bg-white !text-gray-700 hover:!bg-gray-100"
                        onClick={() => setSelectedOrder(order)}
                        aria-label={t("account.adOrdersViewDetail", {
                          defaultValue: "View order details",
                        })}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-muted-foreground mt-2 text-sm">
                    {summarizePackages(packageNames)}
                  </p>

                  <div className="mt-2 grid gap-1 text-sm sm:grid-cols-2 lg:grid-cols-4">
                    <p>
                      <span className="text-muted-foreground">
                        {t("account.adOrdersCreatedAt", { defaultValue: "Created at" })}:
                      </span>
                      {formatDateTimeForLocale(order.createdAt, i18n.language)}
                    </p>
                    <p>
                      <span className="text-muted-foreground">
                        {t("account.adOrdersTotalAmount", { defaultValue: "Total" })}:
                      </span>
                      <VndPrice value={order.totalAmount} />
                    </p>
                    <p>
                      <span className="text-muted-foreground">
                        {t("account.adOrdersPackageStartAt", {
                          defaultValue: "Package start",
                        })}
                        :
                      </span>
                      {orderStartDate
                        ? formatDateTimeForLocale(orderStartDate, i18n.language)
                        : "-"}
                    </p>
                    <p>
                      <span className="text-muted-foreground">
                        {t("account.adOrdersItemsCount", {
                          count: order.items.length,
                          defaultValue: "{{count}} items",
                        })}
                      </span>
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
            <p className="text-muted-foreground text-sm">
              {t("account.page")} {currentPage} {t("account.of")} {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                {t("account.previousPage")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                {t("account.nextPage")}
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card.Content>

      <Dialog
        open={Boolean(selectedOrder)}
        onOpenChange={(open) => {
          if (!open) setSelectedOrder(null)
        }}
      >
        <DialogContent className="bg-body-bg-dark relative max-h-[90vh] max-w-2xl overflow-y-auto">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground absolute top-3 right-3 h-8 w-8"
            onClick={() => setSelectedOrder(null)}
            aria-label={t("account.closeModal")}
          >
            <X className="h-4 w-4" />
          </Button>

          <DialogHeader>
            <DialogTitle>
              {t("account.adOrdersDetailTitle", { defaultValue: "Order details" })}
            </DialogTitle>
            <DialogDescription>
              {t("account.adOrdersDetailDesc", {
                defaultValue: "Review package information and timeline for this order.",
              })}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4 px-5 pb-5">
              <div className="border-border grid gap-3 border-b pb-4 sm:grid-cols-2">
                <div className="bg-body-bg-dark-foreground rounded-lg p-3">
                  <p className="text-muted-foreground text-xs">
                    {t("account.adOrdersOrderId", { defaultValue: "Order" })}
                  </p>
                  <p className="text-sm font-medium">{selectedOrder.id}</p>
                </div>
                <div className="bg-body-bg-dark-foreground rounded-lg p-3">
                  <p className="text-muted-foreground text-xs">
                    {t("account.orderStatus", { defaultValue: "Status" })}
                  </p>
                  <p className="text-sm font-medium">{getStatusLabel(selectedOrder.status, t)}</p>
                </div>
                <div className="bg-body-bg-dark-foreground rounded-lg p-3">
                  <p className="text-muted-foreground text-xs">
                    {t("account.adOrdersCreatedAt", { defaultValue: "Created at" })}
                  </p>
                  <p className="text-sm font-medium">
                    {formatDateTimeForLocale(selectedOrder.createdAt, i18n.language)}
                  </p>
                </div>
                <div className="bg-body-bg-dark-foreground rounded-lg p-3">
                  <p className="text-muted-foreground text-xs">
                    {t("account.adOrdersTotalAmount", { defaultValue: "Total" })}
                  </p>
                  <p className="text-sm font-semibold">
                    <VndPrice value={selectedOrder.totalAmount} />
                  </p>
                </div>
              </div>

              <div>
                <p className="text-muted-foreground mb-2 text-xs">
                  {t("account.adOrdersDetailItemsTitle", { defaultValue: "Order items" })}
                </p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div
                      key={`${item.pricingId ?? item.pricingName}-${idx}`}
                      className="bg-body-bg-dark-foreground rounded-lg p-3"
                    >
                      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-medium">{item.packageName || "-"}</p>
                        <p className="text-sm font-semibold">
                          <VndPrice value={item.price} />
                        </p>
                      </div>

                      <div className="text-muted-foreground grid gap-1 text-xs sm:grid-cols-2">
                        <p>
                          {t("account.adOrdersDetailItemPricing", {
                            defaultValue: "Pricing",
                          })}
                          : {item.pricingName || "-"}
                        </p>
                        <p>
                          {t("account.adOrdersDetailItemStartDate", {
                            defaultValue: "Start date",
                          })}
                          : {formatDateTimeForLocale(item.startDate, i18n.language)}
                        </p>
                        <p>
                          {t("account.adOrdersDetailItemAssets", { defaultValue: "Assets" })}:{" "}
                          {item.assetsCount}
                        </p>
                        <p>
                          {t("account.adOrdersDetailItemDesignService", {
                            defaultValue: "Design service",
                          })}
                          :{" "}
                          {item.designServiceRequired
                            ? t("account.adOrdersDetailYes", { defaultValue: "Yes" })
                            : t("account.adOrdersDetailNo", { defaultValue: "No" })}
                        </p>
                      </div>

                      <div className="mt-2 text-xs">
                        {item.adLinkUrl ? (
                          <a
                            href={item.adLinkUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            {t("account.adOrdersDetailItemLink", { defaultValue: "Ad link" })}
                          </a>
                        ) : (
                          <p className="text-muted-foreground">
                            {t("account.adOrdersDetailNoLink", {
                              defaultValue: "No ad link provided",
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}
