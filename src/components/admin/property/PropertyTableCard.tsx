"use client"

import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { Eye, Pencil, RefreshCcw, Trash2, ToggleLeft, ToggleRight } from "lucide-react"
import { useAdminProperties, useUpdateProperty } from "@/api/properties/hooks"
import type {
  PropertiesAdminListQuery,
  PropertyAvailabilityStatus,
  PropertyPublicationStatus,
  PropertySortBy,
  PropertySortOrder,
  PropertyType,
} from "@/api/properties/types"
import Button from "@/components/ui/Button"
import Card, { CardContent } from "@/components/ui/Card"
import { Pagination } from "@/components/ui/Pagination"
import type { ToastVariant } from "@/components/ui/Toast"
import { useDebounce } from "@/hooks/useDebounce"
import { useUser } from "@/contexts/user-context"
import { FeatureKey } from "@/types"
import { isDemoAdminUser } from "@/components/login/demo/demoUsers"
import { formatDateTimeForLocale } from "@/utils/datetime"
import { useAdminData } from "../AdminDataContext"
import { StatusBadge } from "../StatusBadge"
import { PropertyTabHeader } from "./PropertyTabHeader"
import { PropertyFiltersCard } from "./PropertyFiltersCard"
import {
  getPropertyTypeLabel,
  mapMockStatusToPublicationStatus,
  mapMockStatusToAvailabilityStatus,
  mapMockTypeToPropertyType,
} from "./helpers"
import { ITEMS_PER_PAGE, ALL_FILTER_VALUE, type FilterValue } from "./constants"
import type { PropertyRow } from "./types"

type PropertyTableCardProps = {
  onView: (row: PropertyRow) => void
  onEdit: (row: PropertyRow) => void
  onDelete: (row: PropertyRow) => void
  onAdd: () => void
  onShowToast: (message: string, variant: ToastVariant) => void
}

export function PropertyTableCard({
  onView,
  onEdit,
  onDelete,
  onAdd,
  onShowToast,
}: PropertyTableCardProps) {
  const { t, i18n } = useTranslation()
  const { propertyListings } = useAdminData()
  const { user, canUseFeature } = useUser()
  const isDemoAdmin = isDemoAdminUser(user)
  const isRealAdmin = canUseFeature(FeatureKey.AdminPanel) && !isDemoAdmin

  // --- Filter / sort / pagination state ---
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const [typeFilter, setTypeFilter] = useState<FilterValue<PropertyType>>(ALL_FILTER_VALUE)
  const [publicationStatusFilter, setPublicationStatusFilter] =
    useState<FilterValue<PropertyPublicationStatus>>(ALL_FILTER_VALUE)
  const [availabilityStatusFilter, setAvailabilityStatusFilter] =
    useState<FilterValue<PropertyAvailabilityStatus>>(ALL_FILTER_VALUE)
  const [sortBy, setSortBy] = useState<PropertySortBy>("updatedAt")
  const [sortOrder, setSortOrder] = useState<PropertySortOrder>("desc")
  const [currentPage, setCurrentPage] = useState(1)

  // --- UI state ---
  const [busyRowId, setBusyRowId] = useState<string | null>(null)

  // --- Query memo ---
  const query = useMemo<PropertiesAdminListQuery>(
    () => ({
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      search: debouncedSearchQuery.trim() || undefined,
      type: typeFilter === ALL_FILTER_VALUE ? undefined : typeFilter,
      publicationStatus:
        publicationStatusFilter === ALL_FILTER_VALUE ? undefined : publicationStatusFilter,
      availabilityStatus:
        availabilityStatusFilter === ALL_FILTER_VALUE ? undefined : availabilityStatusFilter,
      sortBy,
      sortOrder,
    }),
    [
      availabilityStatusFilter,
      currentPage,
      debouncedSearchQuery,
      publicationStatusFilter,
      sortBy,
      sortOrder,
      typeFilter,
    ]
  )

  // --- Server state ---
  const { data, isLoading, isError, refetch } = useAdminProperties(query, isRealAdmin)
  const { update, isPending: isUpdating } = useUpdateProperty()

  // --- Demo data ---
  const demoRows = useMemo<PropertyRow[]>(
    () =>
      propertyListings.map((listing) => ({
        id: listing.id,
        title: listing.title,
        type: mapMockTypeToPropertyType(listing.type),
        province: listing.province,
        provinceName: listing.province,
        price: listing.price,
        views: listing.views,
        publicationStatus: mapMockStatusToPublicationStatus(listing.status),
        availabilityStatus: mapMockStatusToAvailabilityStatus(listing.status),
        updatedAt: "",
      })),
    [propertyListings]
  )

  const filteredDemoRows = useMemo(() => {
    const searchValue = debouncedSearchQuery.trim().toLowerCase()

    const filtered = demoRows.filter((row) => {
      const matchesSearch =
        !searchValue ||
        [row.title, row.province, row.provinceName].join(" ").toLowerCase().includes(searchValue)
      const matchesType = typeFilter === ALL_FILTER_VALUE || row.type === typeFilter
      const matchesPublication =
        publicationStatusFilter === ALL_FILTER_VALUE ||
        row.publicationStatus === publicationStatusFilter
      const matchesAvailability =
        availabilityStatusFilter === ALL_FILTER_VALUE ||
        row.availabilityStatus === availabilityStatusFilter

      return matchesSearch && matchesType && matchesPublication && matchesAvailability
    })

    return filtered.sort((a, b) => {
      const direction = sortOrder === "asc" ? 1 : -1

      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title) * direction
        case "views":
          return (a.views - b.views) * direction
        case "createdAt":
        case "updatedAt":
        case "publishedAt":
        case "soldAt":
        default:
          return a.title.localeCompare(b.title) * direction
      }
    })
  }, [
    availabilityStatusFilter,
    debouncedSearchQuery,
    demoRows,
    publicationStatusFilter,
    sortBy,
    sortOrder,
    typeFilter,
  ])

  const demoTotalPages = Math.max(1, Math.ceil(filteredDemoRows.length / ITEMS_PER_PAGE))
  const paginatedDemoRows = useMemo(
    () => filteredDemoRows.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [currentPage, filteredDemoRows]
  )

  // --- Derived values ---
  const rows = isRealAdmin ? (data?.properties ?? []) : paginatedDemoRows
  const totalCount = isRealAdmin ? (data?.pagination.total ?? 0) : filteredDemoRows.length
  const totalPages = isRealAdmin ? (data?.pagination.totalPages ?? 1) : demoTotalPages
  const isMutating = isUpdating

  // --- Helpers ---
  const resetToFirstPage = () => setCurrentPage(1)

  const clearFilters = () => {
    setSearchQuery("")
    setTypeFilter(ALL_FILTER_VALUE)
    setPublicationStatusFilter(ALL_FILTER_VALUE)
    setAvailabilityStatusFilter(ALL_FILTER_VALUE)
    setSortBy("updatedAt")
    setSortOrder("desc")
    setCurrentPage(1)
  }

  // --- Filter change handlers (reset page on change) ---
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    resetToFirstPage()
  }
  const handleTypeFilterChange = (value: FilterValue<PropertyType>) => {
    setTypeFilter(value)
    resetToFirstPage()
  }
  const handlePublicationStatusFilterChange = (value: FilterValue<PropertyPublicationStatus>) => {
    setPublicationStatusFilter(value)
    resetToFirstPage()
  }
  const handleAvailabilityStatusFilterChange = (value: FilterValue<PropertyAvailabilityStatus>) => {
    setAvailabilityStatusFilter(value)
    resetToFirstPage()
  }
  const handleSortByChange = (value: PropertySortBy) => {
    setSortBy(value)
    resetToFirstPage()
  }
  const handleSortOrderChange = (value: PropertySortOrder) => {
    setSortOrder(value)
    resetToFirstPage()
  }

  // --- Mutation handlers ---
  const handleTogglePublication = async (row: PropertyRow) => {
    if (!isRealAdmin) {
      onShowToast(
        t("admin.property.demoReadOnly", {
          defaultValue: "Demo admin is read-only for property actions.",
        }),
        "info"
      )
      return
    }

    const nextPublicationStatus: PropertyPublicationStatus =
      row.publicationStatus === "PUBLISHED" ? "UNPUBLISHED" : "PUBLISHED"

    setBusyRowId(row.id)

    try {
      await update({
        id: row.id,
        payload: { publicationStatus: nextPublicationStatus },
      })

      onShowToast(
        nextPublicationStatus === "PUBLISHED"
          ? t("admin.property.publishSuccess", {
              defaultValue: "Property published successfully.",
            })
          : t("admin.property.unpublishSuccess", {
              defaultValue: "Property unpublished successfully.",
            }),
        "success"
      )
    } catch {
      onShowToast(
        t("admin.property.updateError", {
          defaultValue: "Failed to update property status.",
        }),
        "error"
      )
    } finally {
      setBusyRowId(null)
    }
  }

  return (
    <>
      <PropertyTabHeader
        totalCount={totalCount}
        isRealAdmin={isRealAdmin}
        onRefresh={() => void refetch()}
        onAddProperty={onAdd}
      />

      <PropertyFiltersCard
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        typeFilter={typeFilter}
        onTypeFilterChange={handleTypeFilterChange}
        publicationStatusFilter={publicationStatusFilter}
        onPublicationStatusFilterChange={handlePublicationStatusFilterChange}
        availabilityStatusFilter={availabilityStatusFilter}
        onAvailabilityStatusFilterChange={handleAvailabilityStatusFilterChange}
        sortBy={sortBy}
        onSortByChange={handleSortByChange}
        sortOrder={sortOrder}
        onSortOrderChange={handleSortOrderChange}
        onClearFilters={clearFilters}
      />

    <Card>
      <CardContent className="p-0 pt-5">
        {isLoading ? (
          <div className="text-muted-foreground p-6 text-sm">
            {t("admin.property.loading", { defaultValue: "Loading properties…" })}
          </div>
        ) : isError ? (
          <div className="space-y-3 p-6">
            <p className="text-destructive text-sm">
              {t("admin.property.loadError", {
                defaultValue: "Failed to load properties. Please try again.",
              })}
            </p>
            <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
              <RefreshCcw className="h-4 w-4" aria-hidden />
              {t("admin.property.refresh", { defaultValue: "Refresh" })}
            </Button>
          </div>
        ) : rows.length === 0 ? (
          <div className="space-y-3 p-8 text-center">
            <p className="text-foreground text-sm font-medium">
              {t("admin.property.noProperties", {
                defaultValue: "No properties match the current filters.",
              })}
            </p>
            <p className="text-muted-foreground text-sm">
              {t("admin.property.noPropertiesDesc", {
                defaultValue: "Try another search term or clear the current filters.",
              })}
            </p>
            <div className="flex justify-center">
              <Button type="button" variant="outline" onClick={clearFilters}>
                {t("admin.property.clearFilters", { defaultValue: "Reset Filters" })}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-border bg-body-table-dark-hover border-b">
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase">
                      {t("admin.property.propertyName")}
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase">
                      {t("admin.property.type")}
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase">
                      {t("admin.property.region")}
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase">
                      {t("admin.property.price")}
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase">
                      {t("admin.property.views")}
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase">
                      {t("admin.property.status")}
                    </th>
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase">
                      {t("admin.property.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const isRowBusy = busyRowId === row.id && isMutating

                    return (
                      <tr
                        key={row.id}
                        className="border-border/50 hover:bg-body-table-dark-hover border-b align-top"
                      >
                        <td className="px-4 py-3">
                          <div className="min-w-0">
                            <p className="text-foreground truncate text-sm font-medium">
                              {row.title}
                            </p>
                            {row.updatedAt ? (
                              <p className="text-muted-foreground mt-1 text-xs">
                                {t("admin.property.updatedAt", { defaultValue: "Updated" })}:{" "}
                                {formatDateTimeForLocale(row.updatedAt, i18n.language)}
                              </p>
                            ) : null}
                          </div>
                        </td>
                        <td className="text-muted-foreground px-4 py-3 text-sm">
                          {getPropertyTypeLabel(row.type, t)}
                        </td>
                        <td className="text-muted-foreground px-4 py-3 text-sm">
                          <div className="min-w-0 break-words">
                            {row.provinceName || row.province}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">{row.price}</td>
                        <td className="text-muted-foreground px-4 py-3 text-sm tabular-nums">
                          {new Intl.NumberFormat(i18n.language).format(row.views)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            <StatusBadge status={row.publicationStatus} />
                            <StatusBadge status={row.availabilityStatus} />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8"
                              aria-label={t("admin.property.viewProperty", {
                                defaultValue: "View property",
                              })}
                              title={t("admin.property.viewProperty", {
                                defaultValue: "View property",
                              })}
                              onClick={() => {
                                if (!isRealAdmin) {
                                  onShowToast(
                                    t("admin.property.demoReadOnly", {
                                      defaultValue: "Demo admin is read-only for property actions.",
                                    }),
                                    "info"
                                  )
                                  return
                                }

                                onView(row)
                              }}
                            >
                              <Eye className="h-4 w-4" aria-hidden />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8"
                              aria-label={t("admin.property.editProperty", {
                                defaultValue: "Edit property",
                              })}
                              title={t("admin.property.editProperty", {
                                defaultValue: "Edit property",
                              })}
                              onClick={() => onEdit(row)}
                            >
                              <Pencil className="h-4 w-4" aria-hidden />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8"
                              title={
                                row.publicationStatus === "PUBLISHED"
                                  ? t("admin.property.unpublish")
                                  : t("admin.property.publish")
                              }
                              aria-label={
                                row.publicationStatus === "PUBLISHED"
                                  ? t("admin.property.unpublish")
                                  : t("admin.property.publish")
                              }
                              disabled={isRowBusy}
                              onClick={() => void handleTogglePublication(row)}
                            >
                              {row.publicationStatus === "PUBLISHED" ? (
                                <ToggleRight className="h-4 w-4 text-green-600" aria-hidden />
                              ) : (
                                <ToggleLeft className="text-muted-foreground h-4 w-4" aria-hidden />
                              )}
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-destructive h-8"
                              aria-label={t("admin.property.deleteProperty", {
                                defaultValue: "Delete property",
                              })}
                              title={t("admin.property.deleteProperty", {
                                defaultValue: "Delete property",
                              })}
                              disabled={isRowBusy}
                              onClick={() => onDelete(row)}
                            >
                              <Trash2 className="h-4 w-4" aria-hidden />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="px-4 pb-4">
              <Pagination
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                scrollOnChange
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
    </>
  )
}
