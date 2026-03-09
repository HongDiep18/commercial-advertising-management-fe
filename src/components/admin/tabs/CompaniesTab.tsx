"use client"

import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { format, isValid } from "date-fns"
import { CheckCircle2, Eye, X, XCircle } from "lucide-react"
import Button from "@/components/ui/Button"
import Card, { CardContent } from "@/components/ui/Card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog"
import { StatusBadge } from "../StatusBadge"
import { Toast, type ToastVariant } from "@/components/ui/Toast"
import { PROFILE_REQUEST_FILTERS } from "../constants"
import { useAdminData } from "../AdminDataContext"
import {
  type ProfileRequestFilterId,
  type ProfileRequestRow,
  ProfileRequestStatus,
  getProfileRequestFilterState,
} from "@/types/admin"

function formatSubmittedAt(dateStr: string, locale: string): string {
  if (!dateStr?.trim()) return dateStr ?? ""

  const normalized = dateStr.trim().replace(" ", "T")
  const date = new Date(normalized)

  if (!isValid(date)) return dateStr
  const hasTime = /T\d| \d{1,2}:/.test(dateStr.trim())

  if (locale === "zh-TW")
    return hasTime ? format(date, "yyyy年M月d日 HH:mm") : format(date, "yyyy年M月d日")
  if (locale === "vi-VN")
    return hasTime ? format(date, "dd/MM/yyyy HH:mm") : format(date, "dd/MM/yyyy")
  return hasTime ? format(date, "MMM d, yyyy 'at' h:mm a") : format(date, "MMM d, yyyy")
}

export function CompaniesTab() {
  const { t, i18n } = useTranslation()
  const {
    companyRequests,
    companyRequestsLoading,
    companyRequestsError,
    updateCompanyRequestStatus,
  } = useAdminData()
  const [filter, setFilter] = useState<ProfileRequestFilterId>("all")
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<ProfileRequestRow | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [toast, setToast] = useState<{ message: string; variant: ToastVariant; visible: boolean }>({
    message: "",
    variant: "info",
    visible: false,
  })

  const showToast = (message: string, variant: ToastVariant = "info") =>
    setToast({ message, variant, visible: true })
  const hideToast = () => setToast((prev) => ({ ...prev, visible: false }))

  const { statusCounts, filtered } = useMemo(
    () => getProfileRequestFilterState(companyRequests, filter),
    [companyRequests, filter]
  )

  if (companyRequestsLoading) {
    return (
      <div className="text-muted-foreground flex min-h-[200px] items-center justify-center">
        {t("common.loading", "Loading...")}
      </div>
    )
  }
  if (companyRequestsError) {
    return (
      <div className="text-destructive flex min-h-[200px] flex-col items-center justify-center gap-2">
        <p>{companyRequestsError}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Toast
        message={toast.message}
        variant={toast.variant}
        visible={toast.visible}
        onClose={hideToast}
      />
      <div className="border-rounded-lg flex items-center gap-2">
        {PROFILE_REQUEST_FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`!body-bg-dark-foreground rounded-lg px-3 py-1.5 text-sm transition-colors ${
              filter === f.id
                ? "bg-primary text-primary-foreground"
                : "!bg-body-bg-dark-foreground text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {f.useCount ? t(f.labelKey, { count: statusCounts[f.id] }) : t(f.labelKey)}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="!p-0 !pt-5">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-border bg-body-table-dark-hover border-b border-gray-300">
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase">
                    {t("admin.companies.companyName")}
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase">
                    {t("admin.companies.contact")}
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase">
                    {t("admin.companies.industry")}
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase">
                    {t("admin.companies.submittedDate")}
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase">
                    {t("admin.companies.status")}
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase">
                    {t("admin.companies.actions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr
                    key={row.id}
                    className="border-border hover:bg-muted/20 hover:bg-body-table-dark-hover border-b"
                  >
                    <td className="px-4 py-3">
                      <p className="text-foreground text-sm font-medium">{row.companyName}</p>
                      <p className="text-muted-foreground text-xs">{row.email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm">{row.contactPerson}</td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">{row.industry}</td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">
                      {formatSubmittedAt(row.submittedAt, i18n.language)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {row.status === ProfileRequestStatus.PENDING && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 !text-green-600 hover:!bg-green-700 hover:!text-green-700 hover:!text-white"
                              aria-label={t("admin.status.approved")}
                              disabled={!!updatingId}
                              onClick={() => {
                                if (!updateCompanyRequestStatus) return
                                setUpdatingId(row.id)
                                updateCompanyRequestStatus(row.id, ProfileRequestStatus.APPROVED)
                                  .then(() =>
                                    showToast(t("admin.companies.approvedSuccess"), "success")
                                  )
                                  .catch(() => showToast(t("admin.companies.updateError"), "error"))
                                  .finally(() => setUpdatingId(null))
                              }}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 !text-red-600 hover:!bg-red-700 hover:!text-red-700 hover:!text-white"
                              aria-label={t("admin.status.rejected")}
                              disabled={!!updatingId}
                              onClick={() => {
                                if (!updateCompanyRequestStatus) return
                                setUpdatingId(row.id)
                                updateCompanyRequestStatus(row.id, ProfileRequestStatus.REJECTED)
                                  .then(() =>
                                    showToast(t("admin.companies.rejectedSuccess"), "success")
                                  )
                                  .catch(() => showToast(t("admin.companies.updateError"), "error"))
                                  .finally(() => setUpdatingId(null))
                              }}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:!bg-primary h-8 hover:!text-white"
                          aria-label={t("common.view", "View")}
                          onClick={() => {
                            setSelectedRequest(row)
                            setIsDetailOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="bg-body-bg-dark relative max-h-[90vh] max-w-2xl overflow-y-auto">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground absolute top-3 right-3 h-8 w-8"
            onClick={() => setIsDetailOpen(false)}
            aria-label={t("admin.companies.closeDialog")}
          >
            <X className="h-4 w-4" />
          </Button>
          {selectedRequest && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedRequest.companyName}</DialogTitle>
                <DialogDescription>
                  {t("admin.companies.submittedOn")}{" "}
                  {formatSubmittedAt(selectedRequest.submittedAt, i18n.language)}
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 space-y-4 px-5">
                <div className="border-border grid gap-3 border-b pb-4 sm:grid-cols-2">
                  <div className="bg-body-bg-dark-foreground rounded-lg p-3">
                    <p className="text-muted-foreground text-xs">{t("admin.companies.contact")}</p>
                    <p className="text-sm font-medium">{selectedRequest.contactPerson}</p>
                  </div>
                  <div className="bg-body-bg-dark-foreground rounded-lg p-3">
                    <p className="text-muted-foreground text-xs">{t("admin.companies.email")}</p>
                    <p className="text-sm font-medium">{selectedRequest.email}</p>
                  </div>
                  <div className="bg-body-bg-dark-foreground rounded-lg p-3">
                    <p className="text-muted-foreground text-xs">{t("admin.companies.industry")}</p>
                    <p className="text-sm font-medium">{selectedRequest.industry}</p>
                  </div>
                  <div className="bg-body-bg-dark-foreground rounded-lg p-3">
                    <p className="text-muted-foreground text-xs">{t("admin.companies.country")}</p>
                    <p className="text-sm font-medium">{selectedRequest.country}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 border-t py-4">
                  <p className="text-muted-foreground text-xs">{t("admin.companies.status")}</p>
                  <StatusBadge status={selectedRequest.status} />
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
