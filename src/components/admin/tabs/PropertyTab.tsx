"use client"

import { useTranslation } from "react-i18next"
import { AlertTriangle, MapPin, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react"
import Button from "@/components/ui/Button"
import Card, { CardContent } from "@/components/ui/Card"
import { StatusBadge } from "../StatusBadge"
import { useAdminData } from "../AdminDataContext"

export function PropertyTab() {
  const { t } = useTranslation()
  const { propertyListings } = useAdminData()
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {t("admin.property.listingsCount", { count: propertyListings.length })}
        </p>
        <Button size="sm" variant="primary">
          <MapPin className="mr-1.5 h-4 w-4" />
          {t("admin.property.addProperty")}
        </Button>
      </div>

      <Card>
        <CardContent className="!p-0 !pt-5">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-border bg-body-table-dark-hover border-b border-gray-300">
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
                {propertyListings.map((listing) => (
                  <tr
                    key={listing.id}
                    className="border-border/50 hover:bg-muted/20 hover:bg-body-table-dark-hover border-b"
                  >
                    <td className="text-foreground px-4 py-3 text-sm font-medium">
                      {listing.title}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">{listing.type}</td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">{listing.province}</td>
                    <td className="px-4 py-3 text-sm font-medium">{listing.price}</td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">{listing.views}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={listing.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:!bg-header-red-dark h-8 hover:!text-white"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:!bg-header-red-dark h-8 hover:!text-white"
                          title={
                            listing.status === "published"
                              ? t("admin.property.unpublish")
                              : t("admin.property.publish")
                          }
                        >
                          {listing.status === "published" ? (
                            <ToggleRight className="h-4 w-4 text-green-600" />
                          ) : (
                            <ToggleLeft className="text-muted-foreground h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:!bg-header-red-dark text-destructive h-8 hover:!text-white"
                        >
                          <Trash2 className="h-4 w-4" />
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

      <Card className="!bg-admin-yellow !border-admin-yellow-border py-4 pt-6">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="font-medium text-amber-800">
                {t("admin.property.addressVisibilityTitle")}
              </p>
              <p className="mt-1 text-sm text-amber-700">
                {t("admin.property.addressVisibilityDesc")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
