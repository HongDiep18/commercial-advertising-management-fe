"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { CheckCircle2, Eye, XCircle } from "lucide-react"
import Button from "@/components/ui/Button"
import Card, { CardContent } from "@/components/ui/Card"
import { StatusBadge } from "../StatusBadge"
import { useAdminData } from "../AdminDataContext"

export function CompaniesTab() {
  const { t } = useTranslation()
  const { companyRequests, companyRequestsLoading, companyRequestsError } = useAdminData()
  const [filter, setFilter] = useState("all")
  const filtered =
    filter === "all" ? companyRequests : companyRequests.filter((c) => c.status === filter)
  const pendingCount = companyRequests.filter((c) => c.status === "pending").length

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
      <div className="border-rounded-lg flex items-center gap-2">
        {[
          { id: "all", label: t("admin.companies.all") },
          { id: "pending", label: t("admin.companies.pendingCount", { count: pendingCount }) },
          { id: "approved", label: t("admin.status.approved") },
          { id: "rejected", label: t("admin.status.rejected") },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`!body-bg-dark-foreground rounded-lg px-3 py-1.5 text-sm transition-colors ${
              filter === f.id
                ? "bg-primary text-primary-foreground"
                : "!bg-body-bg-dark-foreground text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {f.label}
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
                      {row.submittedAt}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {row.status === "pending" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 !text-green-600 hover:!bg-green-700 hover:!text-green-700"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 !text-red-600 hover:!bg-red-700 hover:!text-red-700"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button variant="ghost" size="sm" className="h-8">
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
    </div>
  )
}
