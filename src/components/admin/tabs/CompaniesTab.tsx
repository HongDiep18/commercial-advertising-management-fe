"use client"

import { patchCompanyActive } from "@/api/admin"
import {
  adminCompanyDetailToRequestsTableCache,
  type AdminCompanyRequestsTableRowCache,
} from "@/api/admin-companies/mapper"
import {
  adminCompanyListIsActiveFromAccountFilter,
  adminCompanyListSupportsAccountFilter,
  type AdminCompanyAccountFilter,
  type AdminCompanyListQuery,
} from "@/api/admin-companies/types"
import { triggerBrowserDownload } from "@/api/admin-companies/downloadBlob"
import { i18nLanguageToAdminCompanyExportLocale } from "@/api/admin-companies/exportLocale"
import {
  adminCompaniesKeys,
  useAdminCompaniesList,
  useAdminCompaniesTabCounts,
  useAdminCompanyDetailsByIds,
  useExportAdminCompanies,
} from "@/api/admin-companies/hooks"
import type { AdminCompanyExportFormat, AdminCompanyExportQuery } from "@/api/admin-companies/types"
import { formatIndustryForDisplay } from "@/api/companies/adminCompany.mapper"
import { AdminPaginationBar } from "@/components/admin/AdminPaginationBar"
import { AdminCompanyEditDialog } from "@/components/admin/company/AdminCompanyEditDialog"
import { CompanyActiveAdsDialog } from "@/components/admin/company/CompanyActiveAdsDialog"
import { CompanyDeleteDialog } from "@/components/admin/company/CompanyDeleteDialog"
import { CompanyDisableDialog } from "@/components/admin/company/CompanyDisableDialog"
import Button from "@/components/ui/Button"
import Card, { CardContent } from "@/components/ui/Card"
import Input from "@/components/ui/Input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover"
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
  ChevronDown,
  Download,
  Filter,
  Loader2,
  X,
  Megaphone,
  Pencil,
  Search,
  ToggleLeft,
  ToggleRight,
  Trash2,
  XCircle,
} from "lucide-react"
import { useDebounce } from "@/hooks/useDebounce"
import { useQueryClient } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useAdminData } from "../AdminDataContext"
import { ADMIN_COMPANY_ACCOUNT_FILTERS, PROFILE_REQUEST_FILTERS } from "../constants"
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
  const [accountActiveFilter, setAccountActiveFilter] = useState<AdminCompanyAccountFilter>("all")
  const [companyActiveFilterOpen, setCompanyActiveFilterOpen] = useState(false)
  const [exportMenuOpen, setExportMenuOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [optimisticActiveById, setOptimisticActiveById] = useState<Record<string, boolean>>({})
  const [confirmDisableRow, setConfirmDisableRow] = useState<ProfileRequestRow | null>(null)
  const [activeAdsRow, setActiveAdsRow] = useState<ProfileRequestRow | null>(null)
  const [toast, setToast] = useState<{ message: string; variant: ToastVariant; visible: boolean }>({
    message: "",
    variant: "info",
    visible: false,
  })

  const showToast = (message: string, variant: ToastVariant = "info") =>
    setToast({ message, variant, visible: true })
  const hideToast = () => setToast((prev) => ({ ...prev, visible: false }))

  const invalidateAdminCompanies = () => {
    void queryClient.invalidateQueries({ queryKey: adminCompaniesKeys.all })
  }

  const companyEdit = useCompanyEdit({
    canEditCompanyProfile,
    language: i18n.language,
    t,
    onShowToast: showToast,
    onRefetchCompanyRequests: refetchCompanyRequests,
    onCompanyDataChanged: (companyId) => {
      void queryClient.invalidateQueries({ queryKey: adminCompaniesKeys.detail(companyId) })
      void queryClient.invalidateQueries({ queryKey: adminCompaniesKeys.all })
    },
  })

  const doToggleActive = (row: ProfileRequestRow, nextActive: boolean) => {
    const userId = row.userId?.trim()
    const companyId = row.companyId?.trim()

    const doToggle = () => {
      if (userId) {
        if (!updateUserActive) return Promise.resolve()
        return updateUserActive(userId, nextActive)
      }
      if (companyId) {
        return patchCompanyActive(companyId, nextActive).then(() => {
          refetchCompanyRequests?.()
          invalidateAdminCompanies()
        })
      }
      return Promise.reject(new Error("No target"))
    }

    setUpdatingId(row.id)
    setOptimisticActiveById((prev) => ({ ...prev, [row.id]: nextActive }))
    doToggle()
      .then(() => {
        invalidateAdminCompanies()
        showToast(
          nextActive
            ? t("admin.companies.enabledSuccess", "Account enabled")
            : t("admin.companies.disabledSuccess", "Account disabled"),
          "success"
        )
      })
      .catch(() => {
        setOptimisticActiveById((prev) => {
          const next = { ...prev }
          delete next[row.id]
          return next
        })
        showToast(t("admin.companies.updateError"), "error")
      })
      .finally(() => setUpdatingId(null))
  }

  const handleToggleActive = (row: ProfileRequestRow, nextActive: boolean) => {
    if (!nextActive) {
      setConfirmDisableRow(row)
    } else {
      doToggleActive(row, true)
    }
  }

  const handleApprove = (row: ProfileRequestRow) => {
    if (!updateCompanyRequestStatus) return
    setUpdatingId(row.id)
    updateCompanyRequestStatus(row.id, ProfileRequestStatus.APPROVED)
      .then(() => {
        invalidateAdminCompanies()
        showToast(t("admin.companies.approvedSuccess"), "success")
      })
      .catch(() => showToast(t("admin.companies.updateError"), "error"))
      .finally(() => setUpdatingId(null))
  }

  const handleReject = (row: ProfileRequestRow) => {
    if (!updateCompanyRequestStatus) return
    setUpdatingId(row.id)
    updateCompanyRequestStatus(row.id, ProfileRequestStatus.REJECTED)
      .then(() => {
        invalidateAdminCompanies()
        showToast(t("admin.companies.rejectedSuccess"), "info")
      })
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
      .then(() => {
        invalidateAdminCompanies()
        showToast(
          userId
            ? t("admin.companies.deleteCompanySuccess", "Company deleted")
            : t("admin.companies.archiveCompanySuccess", "Company archived"),
          "success"
        )
      })
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

  const accountFilterApplies = adminCompanyListSupportsAccountFilter(filter)

  const listQueryParams = useMemo((): AdminCompanyListQuery => {
    return {
      search: debouncedSearchQuery.trim() || undefined,
      page,
      limit: 20,
      sortBy: "createdAt",
      sortOrder: "desc",
      status: filter === "all" ? undefined : filter,
      isActive: adminCompanyListIsActiveFromAccountFilter(filter, accountActiveFilter),
    }
  }, [page, debouncedSearchQuery, filter, accountActiveFilter])

  const exportFilters = useMemo(
    (): Omit<AdminCompanyExportQuery, "type"> => ({
      locale: i18nLanguageToAdminCompanyExportLocale(i18n.language),
      search: debouncedSearchQuery.trim() || undefined,
      status: filter === "all" ? undefined : filter,
      isActive: adminCompanyListIsActiveFromAccountFilter(filter, accountActiveFilter),
    }),
    [debouncedSearchQuery, filter, accountActiveFilter, i18n.language]
  )

  const exportCompanies = useExportAdminCompanies()

  const handleExportCompanies = (type: AdminCompanyExportFormat) => {
    setExportMenuOpen(false)
    exportCompanies.mutate(
      { ...exportFilters, type },
      {
        onSuccess: ({ blob, filename }) => {
          triggerBrowserDownload(blob, filename)
          showToast(
            t("admin.companies.exportSuccess", { defaultValue: "Export downloaded successfully." }),
            "success"
          )
        },
        onError: (err) => {
          const status = err.status
          if (status === 400) {
            showToast(
              t("admin.companies.exportTooMany", {
                defaultValue:
                  "Too many companies match. Narrow your search or filters (max 10,000).",
              }),
              "error"
            )
            return
          }
          if (status === 403) {
            showToast(
              t("admin.companies.exportForbidden", {
                defaultValue: "You do not have permission to export companies.",
              }),
              "error"
            )
            return
          }
          showToast(
            err.message ||
              t("admin.companies.exportError", { defaultValue: "Failed to export companies." }),
            "error"
          )
        },
      }
    )
  }

  const {
    rows,
    pagination,
    isLoading: isListLoading,
    isError: isListError,
    error: listError,
  } = useAdminCompaniesList(listQueryParams)

  const { statusCounts } = useAdminCompaniesTabCounts()

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
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between lg:gap-4">
            <div className="border-rounded-lg flex flex-wrap items-center gap-2">
              {PROFILE_REQUEST_FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    setFilter(f.id)
                    setPage(1)
                    if (!adminCompanyListSupportsAccountFilter(f.id)) {
                      setAccountActiveFilter("all")
                    }
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

            {accountFilterApplies && (
              <div className="flex items-center gap-1">
                <Popover open={companyActiveFilterOpen} onOpenChange={setCompanyActiveFilterOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size={accountActiveFilter !== "all" ? "sm" : "icon"}
                      aria-label={t("admin.companies.companyFilterTooltip", {
                        defaultValue: "Filter by account state",
                      })}
                      aria-expanded={companyActiveFilterOpen}
                      aria-haspopup="dialog"
                      className={`border-border bg-body-bg-dark h-10 shrink-0 border ${
                        accountActiveFilter !== "all"
                          ? "border-primary ring-primary/35 text-primary gap-1.5 px-3 ring-2"
                          : "text-muted-foreground hover:bg-muted/50 w-10"
                      }`}
                    >
                      <Filter className="h-4 w-4 shrink-0" aria-hidden />
                      {accountActiveFilter !== "all" && (
                        <>
                          <span className="text-sm font-medium">
                            {t(
                              ADMIN_COMPANY_ACCOUNT_FILTERS.find(
                                (o) => o.id === accountActiveFilter
                              )?.labelKey ?? ""
                            )}
                          </span>
                          <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                        </>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    side="bottom"
                    sideOffset={8}
                    className="border-border bg-card/95 min-w-[220px] p-0 shadow-none backdrop-blur-sm"
                  >
                    <div
                      className="border-border border-b px-3 py-2"
                      role="group"
                      aria-label={t("admin.companies.accountFilterAria", {
                        defaultValue: "Filter by account state",
                      })}
                    >
                      <p className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
                        {t("admin.companies.accountFilterLabel", { defaultValue: "Account State" })}
                      </p>
                    </div>
                    <div className="flex flex-col gap-0.5 p-1.5">
                      {ADMIN_COMPANY_ACCOUNT_FILTERS.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setAccountActiveFilter(opt.id)
                            setPage(1)
                            setCompanyActiveFilterOpen(false)
                          }}
                          className={`hover:bg-muted/50 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${
                            accountActiveFilter === opt.id
                              ? "bg-primary/10 text-primary"
                              : "text-foreground"
                          }`}
                        >
                          {t(opt.labelKey)}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
                {accountActiveFilter !== "all" && (
                  <button
                    type="button"
                    onClick={() => {
                      setAccountActiveFilter("all")
                      setPage(1)
                    }}
                    aria-label={t("admin.companies.clearAccountFilter", {
                      defaultValue: "Clear filter",
                    })}
                    className="text-muted-foreground hover:text-foreground rounded p-1 transition-colors"
                  >
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                )}
              </div>
            )}

            <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:items-center lg:ml-auto lg:w-auto lg:max-w-xl lg:flex-1">
              <div className="relative min-w-[200px] flex-1 sm:max-w-md">
                <Search
                  className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
                  aria-hidden
                />
                <Input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setPage(1)
                  }}
                  placeholder={t("admin.companies.searchPlaceholder", {
                    defaultValue: "Search by name, tax id, industry, contact…",
                  })}
                  className="bg-body-bg-dark border-border h-10 w-full pl-9"
                  aria-label={t("admin.companies.searchPlaceholder", {
                    defaultValue: "Search companies",
                  })}
                />
              </div>
              {isAdminRole(user?.role) && (
                <Popover open={exportMenuOpen} onOpenChange={setExportMenuOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={exportCompanies.isPending}
                      className="border-border text-foreground hover:bg-muted/50 h-10 shrink-0 gap-2 rounded-full border bg-white px-4 font-medium"
                      aria-label={t("admin.companies.export", { defaultValue: "Export" })}
                      aria-haspopup="menu"
                      aria-expanded={exportMenuOpen}
                      aria-busy={exportCompanies.isPending}
                    >
                      {exportCompanies.isPending ? (
                        <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
                      ) : (
                        <Download className="h-4 w-4 shrink-0" aria-hidden />
                      )}
                      {t("admin.companies.export", { defaultValue: "Export" })}
                      <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="end"
                    side="bottom"
                    sideOffset={8}
                    className="border-border bg-card/95 min-w-[200px] p-1 shadow-none backdrop-blur-sm"
                  >
                    <button
                      type="button"
                      disabled={exportCompanies.isPending}
                      onClick={() => handleExportCompanies("excel")}
                      className="hover:bg-muted/50 flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {t("admin.companies.exportExcel", {
                        defaultValue: "Excel (.xlsx)",
                      })}
                    </button>
                    <button
                      type="button"
                      disabled={exportCompanies.isPending}
                      onClick={() => handleExportCompanies("csv")}
                      className="hover:bg-muted/50 flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {t("admin.companies.exportCsv", {
                        defaultValue: "CSV (.csv)",
                      })}
                    </button>
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </div>
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
                  {rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-muted-foreground px-4 py-10 text-center text-sm"
                      >
                        {t("admin.companies.emptyList", {
                          defaultValue: "No companies to display.",
                        })}
                      </td>
                    </tr>
                  ) : (
                    rows.map((row, rowIndex) => {
                      const companyIdKey = row.companyId?.trim()
                      const cached = companyIdKey ? companyInfoById[companyIdKey] : undefined
                      const displayCompanyName = cached?.displayCompanyName?.trim()
                        ? cached.displayCompanyName
                        : row.companyName
                      const displayRegisteredEmail =
                        row.registeredEmail?.trim() || row.email?.trim() || ""
                      const displayContactValue = cached?.contactValue?.trim()
                        ? cached.contactValue
                        : row.companyEmail?.trim() || row.email
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
                        { label: "VI", value: cached?.companyNameVi?.trim() || "" },
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
                                  const active =
                                    row.id in optimisticActiveById
                                      ? optimisticActiveById[row.id]
                                      : isCompanyActive(row)
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
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className={`h-8 ${active ? "!text-green-600 hover:!bg-red-700 hover:!text-white" : "!text-red-600 hover:!bg-green-700 hover:!text-white"}`}
                                          aria-label={toggleLabel}
                                          disabled={!!updatingId || !hasToggleTarget}
                                          onClick={() => handleToggleActive(row, !active)}
                                        >
                                          {updatingId === row.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                          ) : active ? (
                                            <ToggleRight className="h-4 w-4" />
                                          ) : (
                                            <ToggleLeft className="h-4 w-4" />
                                          )}
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>{toggleLabel}</TooltipContent>
                                    </Tooltip>
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
                    })
                  )}
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
        <CompanyDisableDialog
          candidate={confirmDisableRow}
          onClose={() => setConfirmDisableRow(null)}
          onConfirm={() => {
            if (confirmDisableRow) doToggleActive(confirmDisableRow, false)
            setConfirmDisableRow(null)
          }}
          isUpdating={updatingId === confirmDisableRow?.id}
        />
      </div>
    </TooltipProvider>
  )
}
