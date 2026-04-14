"use client"

import { patchCompanyActive } from "@/api/admin"
import { useCompanyRequestsPage, useCompanyRequestsTabCounts } from "@/api/admin/hooks"
import {
  adminCompanyDetailToRequestsTableCache,
  type AdminCompanyRequestsTableRowCache,
} from "@/api/admin-companies/mapper"
import { adminCompaniesKeys, useAdminCompanyDetailsByIds } from "@/api/admin-companies/hooks"
import { formatIndustryForDisplay } from "@/api/companies/adminCompany.mapper"
import { AdminPaginationBar } from "@/components/admin/AdminPaginationBar"
import { AdminCompanyEditDialog } from "@/components/admin/company/AdminCompanyEditDialog"
import { CompanyActiveAdsDialog } from "@/components/admin/company/CompanyActiveAdsDialog"
import { CompanyDeleteDialog } from "@/components/admin/company/CompanyDeleteDialog"
import Button from "@/components/ui/Button"
import Card, { CardContent } from "@/components/ui/Card"
import { Toast, type ToastVariant } from "@/components/ui/Toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useUser } from "@/contexts/user-context"
import {
  isCompanyActive,
  type ProfileRequestFilterId,
  type ProfileRequestRow,
  ProfileRequestStatus,
} from "@/types/admin"
import { isAdminRole } from "@/utils/adminRole"
import { formatDateTimeForLocale } from "@/utils/datetime"
import {
  CheckCircle2,
  Megaphone,
  Pencil,
  ToggleLeft,
  ToggleRight,
  Trash2,
  XCircle,
} from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useAdminData } from "../AdminDataContext"
import { PROFILE_REQUEST_FILTERS } from "../constants"
import { StatusBadge } from "../StatusBadge"
import { useCompanyEdit } from "./useCompanyEdit"

export function CompaniesTab() {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const { user } = useUser()
  const canEditCompanyProfile = isAdminRole(user?.role)
  const { updateCompanyRequestStatus, updateUserActive, deleteCompany, refetchCompanyRequests } =
    useAdminData()
  const [filter, setFilter] = useState<ProfileRequestFilterId>("all")
  const [page, setPage] = useState(1)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [activeAdsRow, setActiveAdsRow] = useState<ProfileRequestRow | null>(null)
  const [toast, setToast] = useState<{ message: string; variant: ToastVariant; visible: boolean }>({
    message: "",
    variant: "info",
    visible: false,
  })

  const showToast = (message: string, variant: ToastVariant = "info") =>
    setToast({ message, variant, visible: true })
  const hideToast = () => setToast((prev) => ({ ...prev, visible: false }))

  const companyEdit = useCompanyEdit({
    canEditCompanyProfile,
    language: i18n.language,
    t,
    onShowToast: showToast,
    onRefetchCompanyRequests: refetchCompanyRequests,
    onCompanyDataChanged: (companyId) => {
      void queryClient.invalidateQueries({ queryKey: adminCompaniesKeys.detail(companyId) })
    },
  })

  const handleToggleActive = (row: ProfileRequestRow, nextActive: boolean) => {
    const userId = row.userId?.trim()
    const companyId = row.companyId?.trim()

    const doToggle = () => {
      if (userId) {
        if (!updateUserActive) return Promise.resolve()
        return updateUserActive(userId, nextActive)
      }
      if (companyId) {
        return patchCompanyActive(companyId, nextActive).then(() => refetchCompanyRequests?.())
      }
      return Promise.reject(new Error("No target"))
    }

    setUpdatingId(row.id)
    doToggle()
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

  const handleApprove = (row: ProfileRequestRow) => {
    if (!updateCompanyRequestStatus) return
    setUpdatingId(row.id)
    updateCompanyRequestStatus(row.id, ProfileRequestStatus.APPROVED)
      .then(() => showToast(t("admin.companies.approvedSuccess"), "success"))
      .catch(() => showToast(t("admin.companies.updateError"), "error"))
      .finally(() => setUpdatingId(null))
  }

  const handleReject = (row: ProfileRequestRow) => {
    if (!updateCompanyRequestStatus) return
    setUpdatingId(row.id)
    updateCompanyRequestStatus(row.id, ProfileRequestStatus.REJECTED)
      .then(() => showToast(t("admin.companies.rejectedSuccess"), "info"))
      .catch(() => showToast(t("admin.companies.updateError"), "error"))
      .finally(() => setUpdatingId(null))
  }

  const [deleteCandidate, setDeleteCandidate] = useState<ProfileRequestRow | null>(null)

  const handleDeleteCompanyClick = (row: ProfileRequestRow) => {
    setDeleteCandidate(row)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteCandidate || !deleteCompany) return

    const userId = deleteCandidate.userId?.trim()
    const companyId = deleteCandidate.companyId?.trim()
    if (!userId && !companyId) {
      showToast(t("admin.companies.deleteUnavailable", "Delete unavailable"), "error")
      setDeleteCandidate(null)
      return
    }

    setUpdatingId(deleteCandidate.id)
    setDeleteCandidate(null)
    deleteCompany({ userId, companyId })
      .then(() =>
        showToast(
          userId
            ? t("admin.companies.deleteCompanySuccess", "Company deleted")
            : t("admin.companies.archiveCompanySuccess", "Company archived"),
          "success"
        )
      )
      .catch(() =>
        showToast(
          userId
            ? t("admin.companies.deleteCompanyError", "Failed to delete company")
            : t("admin.companies.archiveCompanyError", "Failed to archive company"),
          "error"
        )
      )
      .finally(() => setUpdatingId(null))
  }

  const listQueryParams = useMemo(
    () => ({
      page,
      limit: 20,
      ...(filter === "all" ? {} : { status: filter }),
    }),
    [page, filter]
  )

  const {
    rows,
    pagination,
    isLoading: isListLoading,
    isError: isListError,
    error: listError,
  } = useCompanyRequestsPage(listQueryParams)

  const { statusCounts } = useCompanyRequestsTabCounts()

  const companyRowsById = useMemo(() => {
    const byId: Record<string, ProfileRequestRow> = {}
    for (const r of rows) {
      const id = r.companyId?.trim()
      if (!id) continue
      if (!byId[id]) byId[id] = r
    }
    return byId
  }, [rows])

  const companyIdsOnPage = useMemo(() => Object.keys(companyRowsById), [companyRowsById])

  const { detailsById } = useAdminCompanyDetailsByIds(companyIdsOnPage)

  const companyInfoById = useMemo(() => {
    const map: Record<string, AdminCompanyRequestsTableRowCache> = {}
    for (const id of Object.keys(detailsById)) {
      const detail = detailsById[id]
      const fallback = companyRowsById[id]
      if (!detail || !fallback) continue
      map[id] = adminCompanyDetailToRequestsTableCache(detail, fallback)
    }
    return map
  }, [detailsById, companyRowsById])

  if (isListLoading) {
    return (
      <div className="text-muted-foreground flex min-h-[200px] items-center justify-center">
        {t("common.loading", "Loading...")}
      </div>
    )
  }
  if (isListError) {
    return (
      <div className="text-destructive flex min-h-[200px] flex-col items-center justify-center gap-2">
        <p>{listError?.message ?? t("error.failedToLoadData", "Failed to load data")}</p>
      </div>
    )
  }

  return (
    <TooltipProvider>
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
              onClick={() => {
                setFilter(f.id)
                setPage(1)
              }}
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
                  {rows.map((row, rowIndex) => {
                    const companyIdKey = row.companyId?.trim()
                    const cached = companyIdKey ? companyInfoById[companyIdKey] : undefined
                    const displayCompanyName = cached?.displayCompanyName?.trim()
                      ? cached.displayCompanyName
                      : row.companyName
                    const displayRegisteredEmail = row.email?.trim() || ""
                    const displayContactValue = cached?.contactValue?.trim()
                      ? cached.contactValue
                      : row.email
                    const displayContactName = cached?.contactName?.trim()
                      ? cached.contactName
                      : row.contactName
                    const industryFromCache = formatIndustryForDisplay(cached?.industry)
                    const industryFromRow = formatIndustryForDisplay(row.industry)
                    const displayIndustry =
                      (industryFromCache.trim() ? industryFromCache : industryFromRow) || ""
                    const companyNames = [
                      { label: "ZH", value: cached?.companyNameZh?.trim() || "" },
                      { label: "EN", value: cached?.companyNameEn?.trim() || "" },
                      {
                        label: "VI",
                        value: cached?.companyNameVi?.trim() || row.companyName || "",
                      },
                    ].filter((item) => item.value)
                    const showCompanyTooltip = companyNames.length > 1

                    return (
                      <tr
                        key={row.id ? `${row.id}-${rowIndex}` : `row-${rowIndex}`}
                        className="border-border hover:bg-body-table-dark-hover border-b"
                      >
                        <td className="px-4 py-3">
                          <div className="min-w-0 space-y-0.5">
                            {showCompanyTooltip ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <p className="text-foreground truncate text-sm font-medium">
                                    {displayCompanyName}
                                  </p>
                                </TooltipTrigger>
                                <TooltipContent
                                  side="top"
                                  sideOffset={6}
                                  className="max-w-sm whitespace-pre-line"
                                >
                                  {companyNames
                                    .map((item) => `${item.label}: ${item.value}`)
                                    .join("\n")}
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              <p className="text-foreground truncate text-sm font-medium">
                                {displayCompanyName}
                              </p>
                            )}
                            {displayRegisteredEmail ? (
                              <p className="text-muted-foreground truncate text-xs">
                                {displayRegisteredEmail}
                              </p>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <p className="text-foreground text-sm">{displayContactValue || "-"}</p>
                          {displayContactName ? (
                            <p className="text-muted-foreground text-xs">{displayContactName}</p>
                          ) : null}
                        </td>
                        <td className="text-muted-foreground px-4 py-3 text-sm">
                          {displayIndustry}
                        </td>
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
                                  className="h-8 !text-green-600 hover:!bg-green-700 hover:!text-white"
                                  aria-label={t("admin.status.approved")}
                                  disabled={!!updatingId}
                                  onClick={() => handleApprove(row)}
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 !text-red-600 hover:!bg-red-700 hover:!text-white"
                                  aria-label={t("admin.status.rejected")}
                                  disabled={!!updatingId}
                                  onClick={() => handleReject(row)}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            {row.status === ProfileRequestStatus.APPROVED &&
                              (() => {
                                const active = isCompanyActive(row)
                                const hasToggleTarget = Boolean(
                                  row.userId?.trim() || row.companyId?.trim()
                                )
                                const toggleLabel = !hasToggleTarget
                                  ? t(
                                      "admin.companies.noLinkedUserAccount",
                                      "No linked user account"
                                    )
                                  : active
                                    ? t("admin.companies.disableAccount", "Disable account")
                                    : t("admin.companies.enableAccount", "Enable account")
                                return (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`h-8 ${active ? "!text-green-600 hover:!bg-green-700 hover:!text-white" : "!text-red-600 hover:!bg-red-700 hover:!text-white"}`}
                                    aria-label={toggleLabel}
                                    title={toggleLabel}
                                    disabled={!!updatingId || !hasToggleTarget}
                                    onClick={() => handleToggleActive(row, !active)}
                                  >
                                    {active ? (
                                      <ToggleRight className="h-4 w-4" />
                                    ) : (
                                      <ToggleLeft className="h-4 w-4" />
                                    )}
                                  </Button>
                                )
                              })()}
                            {row.status === ProfileRequestStatus.APPROVED &&
                              deleteCompany &&
                              (() => {
                                const hasDeleteTarget = Boolean(
                                  row.userId?.trim() || row.companyId?.trim()
                                )
                                const deleteLabel = row.userId?.trim()
                                  ? t("admin.companies.deleteCompany", "Delete company")
                                  : row.companyId?.trim()
                                    ? t("admin.companies.archiveCompany", "Archive company")
                                    : t("admin.companies.deleteUnavailable", "Delete unavailable")
                                return (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 !text-red-600 hover:!bg-red-700 hover:!text-white"
                                    aria-label={deleteLabel}
                                    title={deleteLabel}
                                    disabled={!!updatingId || !hasDeleteTarget}
                                    onClick={() => handleDeleteCompanyClick(row)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )
                              })()}
                            {row.status === ProfileRequestStatus.APPROVED && row.companyId && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="hover:bg-primary! h-8 hover:text-white!"
                                aria-label={t("admin.activeAds.dialogDescription", "Active ads")}
                                disabled={!!updatingId}
                                onClick={() => setActiveAdsRow(row)}
                              >
                                <Megaphone className="h-4 w-4" />
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
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {pagination && <AdminPaginationBar pagination={pagination} setPage={setPage} />}

        {activeAdsRow?.companyId && (
          <CompanyActiveAdsDialog
            companyId={activeAdsRow.companyId}
            companyName={activeAdsRow.companyName}
            open={!!activeAdsRow}
            onOpenChange={(open) => {
              if (!open) setActiveAdsRow(null)
            }}
          />
        )}

        {companyEdit.state.editModalOpen && (
          <AdminCompanyEditDialog
            open
            onClose={companyEdit.actions.closeCompanyEdit}
            form={companyEdit.state.editForm}
            errors={companyEdit.state.editFieldErrors}
            accountSummary={companyEdit.state.editAccountSummary}
            onFieldChange={companyEdit.actions.handleEditFieldChange}
            onContactChange={companyEdit.actions.handleContactChange}
            onAddContact={companyEdit.actions.handleAddContact}
            onRemoveContact={companyEdit.actions.handleRemoveContact}
            onLogoUpload={companyEdit.actions.handleEditLogoUpload}
            fileInputRef={companyEdit.ui.editFileInputRef}
            onSave={() => void companyEdit.actions.handleSaveCompanyEdit()}
            isSaving={companyEdit.state.editSaving}
            countries={companyEdit.ui.countries}
            allRegions={companyEdit.ui.allRegions}
            readOnly={!canEditCompanyProfile}
            t={t}
          />
        )}
        <CompanyDeleteDialog
          candidate={deleteCandidate}
          onClose={() => setDeleteCandidate(null)}
          onConfirm={handleDeleteConfirm}
          isDeleting={!!updatingId}
        />
      </div>
    </TooltipProvider>
  )
}
