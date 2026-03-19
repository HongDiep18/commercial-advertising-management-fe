"use client"

import {
  useAdminOrders,
  useApproveAdminOrder,
  useRejectAdminOrder,
} from "@/api/ad-orders-admin/hooks"
import type { AdminOrderDto, AdminOrderStatus } from "@/api/ad-orders-admin/types"
import Button from "@/components/ui/Button"
import Card, { CardContent } from "@/components/ui/Card"
import Input from "@/components/ui/Input"
import TextColorBadge from "@/components/ui/TextColorBadge"
import { VndPrice } from "@/components/VndPrice"
import { useDebounce } from "@/hooks/useDebounce"
import { CheckCircle2, Eye, Mail, Search, XCircle } from "lucide-react"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { StatusBadge } from "../StatusBadge"
import { AdOrderDetailDialog } from "./AdOrderDetailDialog"
import { AdOrderStatusActionDialog } from "./AdOrderStatusActionDialog"
import { formatDateTimeForLocale } from "@/utils/datetime"
import { useQueryClient } from "@tanstack/react-query"
import { Toast, type ToastVariant } from "@/components/ui/Toast"

type StatusFilter = "all" | AdminOrderStatus
const ORDER_ACTION = {
  APPROVE: "approve",
  REJECT: "reject",
} as const
type ActionType = (typeof ORDER_ACTION)[keyof typeof ORDER_ACTION]
type ActionModalState = { type: ActionType | null; orderId: string | null; text: string }

export function AdOrdersManagement() {
  const { t, i18n } = useTranslation()
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderDto | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)
  const [actionModal, setActionModal] = useState<ActionModalState>({
    type: null,
    orderId: null,
    text: "",
  })
  const MAX_TEXT_LEN = 300
  const [toast, setToast] = useState<{ message: string; variant: ToastVariant; visible: boolean }>({
    message: "",
    variant: "info",
    visible: false,
  })
  const queryClient = useQueryClient()
  const { approve, isPending: isApproving } = useApproveAdminOrder()
  const { reject, isPending: isRejecting } = useRejectAdminOrder()

  const showToast = (message: string, variant: ToastVariant = "info") =>
    setToast({ message, variant, visible: true })
  const hideToast = () => setToast((prev) => ({ ...prev, visible: false }))
  const openActionModal = (type: ActionType, orderId: string) =>
    setActionModal({ type, orderId, text: "" })
  const closeActionModal = () => setActionModal({ type: null, orderId: null, text: "" })

  const { data, isLoading, isError } = useAdminOrders({
    search: debouncedSearchQuery || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
    page: 1,
    limit: 50,
    sortBy: "createdAt",
    sortOrder: "desc",
  })

  const visibleOrders = data?.orders ?? []

  const statusFilterConfig: Partial<Record<StatusFilter, { labelKey: string }>> = {
    all: { labelKey: "all" },
    PENDING: { labelKey: "pending" },
    APPROVED: { labelKey: "approved" },
    REJECTED: { labelKey: "rejected" },
  }

  const handleStatusAction = async (type: ActionType, id: string, text: string) => {
    try {
      setUpdatingOrderId(id)
      if (type === ORDER_ACTION.APPROVE) {
        await approve({ id, note: text })
      } else {
        await reject({ id, reason: text })
      }
      await queryClient.invalidateQueries({ queryKey: ["admin", "ad-orders"] })
      showToast(
        type === ORDER_ACTION.APPROVE
          ? t("admin.advertising.approvedSuccess") || "Advertising order approved."
          : t("admin.advertising.rejectedSuccess") || "Advertising order rejected.",
        "success"
      )
    } catch {
      showToast(
        t("admin.advertising.updateError") || "Failed to update advertising order.",
        "error"
      )
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const isApproveAction = actionModal.type === ORDER_ACTION.APPROVE
  const isRejectAction = actionModal.type === ORDER_ACTION.REJECT
  const isActionOpen = actionModal.type !== null

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder={t("admin.advertising.searchPlaceholder")}
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-1">
          {(Object.keys(statusFilterConfig) as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-lg px-3 py-2 text-xs ${
                statusFilter === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {s === "all"
                ? t("admin.companies.all")
                : t(`admin.status.${statusFilterConfig[s]?.labelKey}`)}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-0! pt-5!">
          {isLoading ? (
            <div className="text-muted-foreground p-6 text-sm">
              {t("admin.advertising.loadingOrders")}
            </div>
          ) : isError ? (
            <div className="text-destructive p-6 text-sm">{t("admin.advertising.ordersError")}</div>
          ) : visibleOrders.length === 0 ? (
            <div className="text-muted-foreground p-6 text-sm">
              {t("admin.advertising.noOrders")}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-border bg-body-table-dark-hover border-b">
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase">
                      {t("admin.advertising.status")}
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase">
                      {t("admin.advertising.companyName")}
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase">
                      {t("admin.advertising.packageManagementTable.category")}
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase">
                      {t("admin.advertising.contact")}
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase">
                      {t("admin.advertising.amount")}
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase">
                      {t("admin.advertising.submittedAt")}
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase">
                      {t("admin.advertising.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visibleOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-border/50 hover:bg-body-table-dark-hover border-b"
                    >
                      <td className="px-4 py-3">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="text-foreground px-4 py-3 text-sm font-medium">
                        {order.company?.nameVi ?? order.company?.nameCn ?? order.user.email}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {(() => {
                          const rawTypes = order.items
                            .map((item) => item.categoryType)
                            .filter((type): type is string => Boolean(type))
                          const uniqueTypes = Array.from(new Set(rawTypes))
                          if (uniqueTypes.length === 0)
                            return <span className="text-muted-foreground text-xs">-</span>

                          return (
                            <div className="flex flex-col gap-1">
                              {uniqueTypes.map((type) => (
                                <TextColorBadge key={type} colorKey={type}>
                                  {t(`admin.advertising.adCategory.${type}`)}
                                </TextColorBadge>
                              ))}
                            </div>
                          )
                        })()}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {order.company ? (
                          <div>
                            <p className="font-medium">{order.company.contactName}</p>
                            <p className="text-muted-foreground text-xs">{order.company.email}</p>
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-xs">{order.user.email}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        <VndPrice value={order.totalAmount} />
                      </td>
                      <td className="text-muted-foreground px-4 py-3 text-sm">
                        {formatDateTimeForLocale(order.createdAt, i18n.language)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {order.status === "PENDING" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={
                                  updatingOrderId === order.id || isApproving || isRejecting
                                }
                                title={t("admin.status.approved")}
                                onClick={() => openActionModal(ORDER_ACTION.APPROVE, order.id)}
                              >
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={
                                  updatingOrderId === order.id || isApproving || isRejecting
                                }
                                title={t("admin.status.rejected")}
                                onClick={() => openActionModal(ORDER_ACTION.REJECT, order.id)}
                              >
                                <XCircle className="h-4 w-4 text-red-600" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order)
                              setIsDetailOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <a href={`mailto:${order.company?.email ?? order.user.email}`}>
                              <Mail className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <AdOrderDetailDialog
        order={selectedOrder}
        open={isDetailOpen}
        onOpenChange={(open) => {
          setIsDetailOpen(open)
          if (!open) setSelectedOrder(null)
        }}
      />

      <AdOrderStatusActionDialog
        open={isActionOpen}
        onOpenChange={(open) => {
          if (!open) closeActionModal()
        }}
        title={isApproveAction ? t("admin.status.approved") : t("admin.status.rejected")}
        description={
          isApproveAction
            ? t("admin.advertising.confirmApprove") || "Approve this advertising order?"
            : t("admin.advertising.confirmReject") || "Reject this advertising order?"
        }
        label={
          isApproveAction
            ? t("admin.advertising.approveNote", { defaultValue: "Approval note" })
            : t("admin.advertising.rejectReason", { defaultValue: "Rejection reason" })
        }
        value={actionModal.text}
        maxLength={MAX_TEXT_LEN}
        required={isRejectAction}
        confirmLabel={isApproveAction ? t("admin.status.approved") : t("admin.status.rejected")}
        cancelLabel={t("common.cancel", { defaultValue: "Cancel" })}
        isSubmitting={isApproving || isRejecting}
        onValueChange={(value) => setActionModal((prev) => ({ ...prev, text: value }))}
        onConfirm={() => {
          const id = actionModal.orderId
          if (!id) return
          const type = actionModal.type
          if (!type) return
          void handleStatusAction(type, id, actionModal.text.trim()).then(closeActionModal)
        }}
      />

      <Toast
        message={toast.message}
        variant={toast.variant}
        visible={toast.visible}
        onClose={hideToast}
        duration={4500}
      />
    </div>
  )
}
