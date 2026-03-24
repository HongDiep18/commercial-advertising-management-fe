"use client"

import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  CheckCircle2,
  Eye,
  Pencil,
  Trash2,
  X,
  XCircle,
  ToggleLeft,
  ToggleRight,
} from "lucide-react"
import Button from "@/components/ui/Button"
import Card, { CardContent } from "@/components/ui/Card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog"
import { AccountProfileModal } from "@/components/account"
import { useUser } from "@/contexts/user-context"
import { StatusBadge } from "../StatusBadge"
import { Toast, type ToastVariant } from "@/components/ui/Toast"
import { PROFILE_REQUEST_FILTERS } from "../constants"
import { useAdminData } from "../AdminDataContext"
import {
  getProfileRequestFilterState,
  isCompanyActive,
  type ProfileRequestFilterId,
  type ProfileRequestRow,
  ProfileRequestStatus,
} from "@/types/admin"
import { companyDetailToRequestRow } from "@/api/companies/adminCompany.mapper"
import { getCompanyDetail } from "@/api/companies/service"
import { extractUserIdFromProfileRequest, getProfileRequestById } from "@/api/admin"
import { formatDateTimeForLocale } from "@/utils/datetime"
import { isAdminRole } from "@/utils/adminRole"
import { useCompanyEdit } from "./useCompanyEdit"

export function CompaniesTab() {
  const { t, i18n } = useTranslation()
  const { user } = useUser()
  const canEditCompanyProfile = isAdminRole(user?.role)
  const {
    companyRequests,
    companyRequestsLoading,
    companyRequestsError,
    updateCompanyRequestStatus,
    updateUserActive,
    deleteCompany,
    refetchCompanyRequests,
  } = useAdminData()
  const [filter, setFilter] = useState<ProfileRequestFilterId>("all")
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<ProfileRequestRow | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [viewOpening, setViewOpening] = useState(false)
  const [toast, setToast] = useState<{ message: string; variant: ToastVariant; visible: boolean }>({
    message: "",
    variant: "info",
    visible: false,
  })

  const [companyEmailById, setCompanyEmailById] = useState<Record<string, string>>({})

  const showToast = (message: string, variant: ToastVariant = "info") =>
    setToast({ message, variant, visible: true })
  const hideToast = () => setToast((prev) => ({ ...prev, visible: false }))

  const companyEdit = useCompanyEdit({
    canEditCompanyProfile,
    language: i18n.language,
    t,
    onShowToast: showToast,
    onRefetchCompanyRequests: refetchCompanyRequests,
    onCompanyEmailResolved: (companyId, email) => {
      setCompanyEmailById((prev) => {
        const next = { ...prev }
        if (email) next[companyId] = email
        else delete next[companyId]
        return next
      })
    },
  })

  const resolveUserIdForRow = async (row: ProfileRequestRow): Promise<string | null> => {
    if (row.userId) return row.userId

    const detail = await getProfileRequestById(row.id)
    const userId = extractUserIdFromProfileRequest(detail)

    if (!userId) {
      showToast(t("admin.companies.userIdRequired", "User ID not available for this row"), "error")
      return null
    }

    return userId
  }

  const handleToggleActive = async (row: ProfileRequestRow, nextActive: boolean) => {
    if (!updateUserActive) return

    const userId = await resolveUserIdForRow(row)
    if (!userId) return

    setUpdatingId(row.id)
    updateUserActive(userId, nextActive)
      .then(() =>
        showToast(
          nextActive
            ? t("admin.companies.enabledSuccess", "Account enabled")
            : t("admin.companies.disabledSuccess", "Account disabled"),
          "success"
        )
      )
      .catch(() => showToast(t("admin.companies.updateError"), "error"))
      .finally(() => setUpdatingId(null))
  }

  const handleDeleteCompanyClick = async (row: ProfileRequestRow) => {
    if (!deleteCompany) return

    const confirmed = window.confirm(
      t(
        "admin.companies.deleteCompanyConfirm",
        "Delete this company? The user will be deactivated."
      )
    )
    if (!confirmed) return

    const userId = await resolveUserIdForRow(row)
    if (!userId) return

    setUpdatingId(row.id)
    deleteCompany(userId)
      .then(() =>
        showToast(t("admin.companies.deleteCompanySuccess", "Company deleted"), "success")
      )
      .catch(() =>
        showToast(t("admin.companies.deleteCompanyError", "Failed to delete company"), "error")
      )
      .finally(() => setUpdatingId(null))
  }

  const openCompanyView = async (row: ProfileRequestRow) => {
    setViewOpening(true)
    try {
      const companyId = row.companyId?.trim()
      if (!companyId) {
        setSelectedRequest(row)
        setIsDetailOpen(true)
        return
      }
      try {
        const detail = await getCompanyDetail(companyId)
        if (detail && typeof detail === "object") {
          const mapped = companyDetailToRequestRow(detail as Record<string, unknown>, row)
          setSelectedRequest(mapped)
          if (typeof detail.email === "string" && detail.email.trim()) {
            setCompanyEmailById((prev) => ({ ...prev, [companyId]: detail.email.trim() }))
          }
        } else {
          setSelectedRequest(row)
        }
      } catch {
        setSelectedRequest(row)
      }
      setIsDetailOpen(true)
    } finally {
      setViewOpening(false)
    }
  }

  const { statusCounts, filtered } = useMemo(
    () => getProfileRequestFilterState(companyRequests, filter),
    [companyRequests, filter]
  )

  useEffect(() => {
    let cancelled = false
    const loadCompanyEmails = async () => {
      const companyIds = filtered
        .map((r) => r.companyId)
        .filter((id): id is string => typeof id === "string" && id.trim().length > 0)

      if (companyIds.length === 0) return

      const distinct = Array.from(new Set(companyIds))
      const idsToFetch = distinct.filter((id) => !companyEmailById[id])
      if (idsToFetch.length === 0) return

      const pairs = await Promise.all(
        idsToFetch.map(async (id) => {
          try {
            const detail = await getCompanyDetail(id)
            return typeof detail?.email === "string" && detail.email.trim()
              ? ([id, detail.email] as const)
              : null
          } catch {
            return null
          }
        })
      )

      if (cancelled) return

      setCompanyEmailById((prev) => {
        const next = { ...prev }
        for (const pair of pairs) {
          if (!pair) continue
          const [id, email] = pair
          next[id] = email
        }
        return next
      })
    }

    void loadCompanyEmails()
    return () => {
      cancelled = true
    }
  }, [filtered, companyEmailById])

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
                      <p className="text-muted-foreground text-xs">
                        {row.companyId && companyEmailById[row.companyId]
                          ? companyEmailById[row.companyId]
                          : row.email}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-sm">{row.contactName}</td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">{row.industry}</td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">
                      {formatDateTimeForLocale(row.submittedAt, i18n.language)}
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
                        {row.status === ProfileRequestStatus.APPROVED &&
                          (() => {
                            const active = isCompanyActive(row)
                            const nextActive = !active
                            return (
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`h-8 ${
                                  active
                                    ? "!text-green-600 hover:!bg-green-700 hover:!text-white"
                                    : "!text-red-600 hover:!bg-red-700 hover:!text-white"
                                }`}
                                aria-label={
                                  active
                                    ? t("admin.companies.disableAccount", "Disable account")
                                    : t("admin.companies.enableAccount", "Enable account")
                                }
                                title={
                                  active
                                    ? t("admin.companies.enableAccount", "Enable account")
                                    : t("admin.companies.disableAccount", "Disable account")
                                }
                                disabled={!!updatingId}
                                onClick={() => handleToggleActive(row, nextActive)}
                              >
                                {active ? (
                                  <ToggleLeft className="h-4 w-4" />
                                ) : (
                                  <ToggleRight className="h-4 w-4" />
                                )}
                              </Button>
                            )
                          })()}
                        {row.status === ProfileRequestStatus.APPROVED && deleteCompany && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 !text-red-600 hover:!bg-red-700 hover:!text-white"
                            aria-label={t("admin.companies.deleteCompany", "Delete company")}
                            disabled={!!updatingId}
                            onClick={() => handleDeleteCompanyClick(row)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                        {row.status === ProfileRequestStatus.APPROVED && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:!bg-primary h-8 hover:!text-white"
                            aria-label={t("admin.companies.edit", "Edit")}
                            disabled={!!updatingId || companyEdit.state.editOpening}
                            onClick={() => companyEdit.actions.openCompanyEdit(row)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:!bg-primary h-8 hover:!text-white"
                          aria-label={t("common.view", "View")}
                          disabled={viewOpening}
                          onClick={() => void openCompanyView(row)}
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
                  {formatDateTimeForLocale(selectedRequest.submittedAt, i18n.language)}
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 space-y-4 px-5">
                <div className="border-border grid gap-3 border-b pb-4 sm:grid-cols-2">
                  <div className="bg-body-bg-dark-foreground rounded-lg p-3">
                    <p className="text-muted-foreground text-xs">{t("admin.companies.contact")}</p>
                    <p className="text-sm font-medium">{selectedRequest.contactName}</p>
                  </div>
                  <div className="bg-body-bg-dark-foreground rounded-lg p-3">
                    <p className="text-muted-foreground text-xs">{t("admin.companies.email")}</p>
                    <p className="text-sm font-medium">
                      {selectedRequest.companyId && companyEmailById[selectedRequest.companyId]
                        ? companyEmailById[selectedRequest.companyId]
                        : selectedRequest.email}
                    </p>
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

      {companyEdit.state.editModalOpen && (
        <AccountProfileModal
          open
          onClose={companyEdit.actions.closeCompanyEdit}
          profileData={companyEdit.state.editProfile}
          onProfileChange={companyEdit.actions.handleEditProfileChange}
          fieldErrors={companyEdit.state.editFieldErrors}
          companyLogo={companyEdit.state.editLogo.url}
          onLogoUpload={companyEdit.actions.handleEditLogoUpload}
          fileInputRef={companyEdit.ui.editFileInputRef}
          logoUploaded={companyEdit.state.editLogo.uploaded}
          onSave={() => void companyEdit.actions.handleSaveCompanyEdit()}
          isSaving={companyEdit.state.editSaving}
          countries={companyEdit.ui.countries}
          availableRegions={companyEdit.ui.availableRegions}
          regionValue={companyEdit.ui.regionValue}
          hasCountry={companyEdit.ui.hasCountry}
          readOnly={!canEditCompanyProfile}
          t={t}
        />
      )}
    </div>
  )
}
