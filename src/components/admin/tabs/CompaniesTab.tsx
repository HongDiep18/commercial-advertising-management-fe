"use client"

import { useCompanyRequestsPage, useCompanyRequestsTabCounts } from "@/api/admin/hooks"
import { formatIndustryForDisplay } from "@/api/companies/adminCompany.mapper"
import { companiesKeys, useCompanyDetailEnrichmentMap } from "@/api/companies/hooks"
import { AccountProfileModal } from "@/components/account"
import { AdminPaginationBar } from "@/components/admin/AdminPaginationBar"
import { CompanyActiveAdsDialog } from "@/components/admin/company/CompanyActiveAdsDialog"
import { CompanyDeleteDialog } from "@/components/admin/company/CompanyDeleteDialog"
import Button from "@/components/ui/Button"
import Card, { CardContent } from "@/components/ui/Card"
import { Toast, type ToastVariant } from "@/components/ui/Toast"
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
    onCompanyEmailResolved: (companyId) => {
      void queryClient.invalidateQueries({ queryKey: companiesKeys.detail(companyId) })
    },
  })

  const resolveUserIdForRow = (row: ProfileRequestRow): string | null => {
    const userId = row.userId?.trim()
    if (userId) return userId
    showToast(t("admin.companies.userIdRequired", "User ID not available for this row"), "error")
    return null
  }

  const handleToggleActive = async (row: ProfileRequestRow, nextActive: boolean) => {
    if (!updateUserActive) return

    const userId = resolveUserIdForRow(row)
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

  const [deleteCandidate, setDeleteCandidate] = useState<ProfileRequestRow | null>(null)

  const handleDeleteCompanyClick = (row: ProfileRequestRow) => {
    setDeleteCandidate(row)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteCandidate || !deleteCompany) return

    const userId = resolveUserIdForRow(deleteCandidate)
    if (!userId) {
      setDeleteCandidate(null)
      return
    }

    setUpdatingId(deleteCandidate.id)
    setDeleteCandidate(null)
    deleteCompany(userId)
      .then(() =>
        showToast(t("admin.companies.deleteCompanySuccess", "Company deleted"), "success")
      )
      .catch(() =>
        showToast(t("admin.companies.deleteCompanyError", "Failed to delete company"), "error")
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

  const approvedCompanyRowsById = useMemo(() => {
    const m: Record<string, ProfileRequestRow> = {}
    for (const r of rows) {
      if (r.status !== ProfileRequestStatus.APPROVED) continue
      const id = r.companyId?.trim()
      if (!id) continue
      if (!m[id]) m[id] = r
    }
    return m
  }, [rows])

  const approvedCompanyIds = useMemo(
    () => Object.keys(approvedCompanyRowsById),
    [approvedCompanyRowsById]
  )

  const companyInfoById = useCompanyDetailEnrichmentMap(approvedCompanyIds, approvedCompanyRowsById)

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
                  const cached =
                    row.status === ProfileRequestStatus.APPROVED && row.companyId
                      ? companyInfoById[row.companyId]
                      : undefined
                  const displayCompanyName = cached?.companyName?.trim()
                    ? cached.companyName
                    : row.companyName
                  const displayEmail = cached?.email?.trim() ? cached.email : row.email
                  const displayContact = cached?.contactName?.trim()
                    ? cached.contactName
                    : row.contactName
                  const industryFromCache = formatIndustryForDisplay(cached?.industry)
                  const industryFromRow = formatIndustryForDisplay(row.industry)
                  const displayIndustry =
                    (industryFromCache.trim() ? industryFromCache : industryFromRow) || ""

                  return (
                    <tr
                      key={row.id ? `${row.id}-${rowIndex}` : `row-${rowIndex}`}
                      className="border-border hover:bg-muted/20 hover:bg-body-table-dark-hover border-b"
                    >
                      <td className="px-4 py-3">
                        <p className="text-foreground text-sm font-medium">{displayCompanyName}</p>
                        <p className="text-muted-foreground text-xs">{displayEmail}</p>
                      </td>
                      <td className="px-4 py-3 text-sm">{displayContact}</td>
                      <td className="text-muted-foreground px-4 py-3 text-sm">{displayIndustry}</td>
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
                                    .catch(() =>
                                      showToast(t("admin.companies.updateError"), "error")
                                    )
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
                                      showToast(t("admin.companies.rejectedSuccess"), "error")
                                    )
                                    .catch(() =>
                                      showToast(t("admin.companies.updateError"), "error")
                                    )
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
          onSave={(extras) => void companyEdit.actions.handleSaveCompanyEdit(extras)}
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
  )
}
