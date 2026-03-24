import { useTranslation } from "react-i18next"
import { ArrowUpDown, Search } from "lucide-react"
import type {
  PropertyAvailabilityStatus,
  PropertyPublicationStatus,
  PropertySortBy,
  PropertySortOrder,
  PropertyType,
} from "@/api/properties/types"
import Button from "@/components/ui/Button"
import Card, { CardContent } from "@/components/ui/Card"
import Input from "@/components/ui/Input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/shadcn-select"
import { ALL_FILTER_VALUE, type FilterValue } from "./constants"
import { getPropertyTypeLabel, getSortLabel } from "./helpers"

type PropertyFiltersCardProps = {
  searchQuery: string
  onSearchChange: (value: string) => void
  typeFilter: FilterValue<PropertyType>
  onTypeFilterChange: (value: FilterValue<PropertyType>) => void
  publicationStatusFilter: FilterValue<PropertyPublicationStatus>
  onPublicationStatusFilterChange: (value: FilterValue<PropertyPublicationStatus>) => void
  availabilityStatusFilter: FilterValue<PropertyAvailabilityStatus>
  onAvailabilityStatusFilterChange: (value: FilterValue<PropertyAvailabilityStatus>) => void
  sortBy: PropertySortBy
  onSortByChange: (value: PropertySortBy) => void
  sortOrder: PropertySortOrder
  onSortOrderChange: (value: PropertySortOrder) => void
  onClearFilters: () => void
}

export function PropertyFiltersCard({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  publicationStatusFilter,
  onPublicationStatusFilterChange,
  availabilityStatusFilter,
  onAvailabilityStatusFilterChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  onClearFilters,
}: PropertyFiltersCardProps) {
  const { t } = useTranslation()

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="space-y-2 md:col-span-2 xl:col-span-2">
            <label htmlFor="property-admin-search" className="text-foreground text-xs font-medium">
              {t("common.search")}
            </label>
            <div className="relative">
              <Search
                className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
                aria-hidden
              />
              <Input
                id="property-admin-search"
                name="property-admin-search"
                type="search"
                autoComplete="off"
                placeholder={t("admin.property.searchPlaceholder", {
                  defaultValue: "Search by title or province…",
                })}
                aria-label={t("admin.property.searchPlaceholder", {
                  defaultValue: "Search by title or province…",
                })}
                value={searchQuery}
                onChange={(event) => onSearchChange(event.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-foreground text-xs font-medium">
              {t("admin.property.type")}
            </label>
            <Select
              value={typeFilter}
              onValueChange={(value) => onTypeFilterChange(value as FilterValue<PropertyType>)}
            >
              <SelectTrigger aria-label={t("admin.property.type")}>
                <SelectValue
                  placeholder={t("admin.property.allTypes", { defaultValue: "All Types" })}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_FILTER_VALUE}>
                  {t("admin.property.allTypes", { defaultValue: "All Types" })}
                </SelectItem>
                {(["LAND", "FACTORY", "WAREHOUSE", "HOUSE", "OFFICE"] as const).map((value) => (
                  <SelectItem key={value} value={value}>
                    {getPropertyTypeLabel(value, t)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-foreground text-xs font-medium">
              {t("admin.property.publicationStatus", { defaultValue: "Publication Status" })}
            </label>
            <Select
              value={publicationStatusFilter}
              onValueChange={(value) =>
                onPublicationStatusFilterChange(value as FilterValue<PropertyPublicationStatus>)
              }
            >
              <SelectTrigger
                aria-label={t("admin.property.publicationStatus", {
                  defaultValue: "Publication Status",
                })}
              >
                <SelectValue
                  placeholder={t("admin.property.allPublicationStatuses", {
                    defaultValue: "All Publication Statuses",
                  })}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_FILTER_VALUE}>
                  {t("admin.property.allPublicationStatuses", {
                    defaultValue: "All Publication Statuses",
                  })}
                </SelectItem>
                {(["DRAFT", "PUBLISHED", "UNPUBLISHED"] as const).map((value) => (
                  <SelectItem key={value} value={value}>
                    {t(`admin.status.${value.toLowerCase()}`, {
                      defaultValue: value,
                    })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-foreground text-xs font-medium">
              {t("admin.property.availabilityStatus", { defaultValue: "Availability Status" })}
            </label>
            <Select
              value={availabilityStatusFilter}
              onValueChange={(value) =>
                onAvailabilityStatusFilterChange(value as FilterValue<PropertyAvailabilityStatus>)
              }
            >
              <SelectTrigger
                aria-label={t("admin.property.availabilityStatus", {
                  defaultValue: "Availability Status",
                })}
              >
                <SelectValue
                  placeholder={t("admin.property.allAvailabilityStatuses", {
                    defaultValue: "All Availability Statuses",
                  })}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_FILTER_VALUE}>
                  {t("admin.property.allAvailabilityStatuses", {
                    defaultValue: "All Availability Statuses",
                  })}
                </SelectItem>
                {(["AVAILABLE", "SOLD"] as const).map((value) => (
                  <SelectItem key={value} value={value}>
                    {t(`admin.status.${value.toLowerCase()}`, {
                      defaultValue: value,
                    })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t pt-4 md:flex-row md:items-end md:justify-between">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-foreground text-xs font-medium">
                {t("admin.property.sortBy", { defaultValue: "Sort By" })}
              </label>
              <Select
                value={sortBy}
                onValueChange={(value) => onSortByChange(value as PropertySortBy)}
              >
                <SelectTrigger aria-label={t("admin.property.sortBy", { defaultValue: "Sort By" })}>
                  <SelectValue placeholder={t("admin.property.sortBy", { defaultValue: "Sort By" })} />
                </SelectTrigger>
                <SelectContent>
                  {(["updatedAt", "createdAt", "views", "title"] as const).map((value) => (
                    <SelectItem key={value} value={value}>
                      {getSortLabel(value, t)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-foreground text-xs font-medium">
                {t("admin.property.sortDirection", { defaultValue: "Sort Direction" })}
              </label>
              <Select
                value={sortOrder}
                onValueChange={(value) => onSortOrderChange(value as PropertySortOrder)}
              >
                <SelectTrigger
                  aria-label={t("admin.property.sortDirection", { defaultValue: "Sort Direction" })}
                >
                  <SelectValue
                    placeholder={t("admin.property.sortDirection", {
                      defaultValue: "Sort Direction",
                    })}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">
                    {t("admin.property.sortDescending", { defaultValue: "Descending" })}
                  </SelectItem>
                  <SelectItem value="asc">
                    {t("admin.property.sortAscending", { defaultValue: "Ascending" })}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="button" variant="outline" onClick={onClearFilters}>
            <ArrowUpDown className="h-4 w-4" aria-hidden />
            {t("admin.property.clearFilters", { defaultValue: "Reset Filters" })}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
