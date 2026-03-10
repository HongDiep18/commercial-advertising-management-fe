"use client"

import Button from "@/components/ui/Button"
import Card, { CardContent } from "@/components/ui/Card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog"
import Input from "@/components/ui/Input"
import type { AdSubmission } from "@/contexts/user-context"
import { UserRole, useUser } from "@/contexts/user-context"
import {
  CheckCircle2,
  Clock,
  DollarSign,
  Eye,
  Mail,
  Megaphone,
  Phone,
  Search,
  TrendingUp,
  X,
} from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useAdminData } from "../AdminDataContext"
import { AdPackageManagement } from "../ad-package-management"
import { StatusBadge } from "../StatusBadge"

export function AdvertisingTab() {
  const { t } = useTranslation()
  const { adSubmissions } = useAdminData()
  const { user } = useUser()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedSubmission, setSelectedSubmission] = useState<AdSubmission | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"orders" | "packages">("orders")

  const statusConfig = {
    new: { labelKey: "new", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Clock },
    contacted: {
      labelKey: "contacted",
      color: "bg-amber-100 text-amber-700 border-amber-200",
      icon: Mail,
    },
    closed: {
      labelKey: "closed",
      color: "bg-green-100 text-green-700 border-green-200",
      icon: CheckCircle2,
    },
  }

  const adTypeConfig: Record<string, { labelKey: string; color: string }> = {
    popup: { labelKey: "adTypePopup", color: "bg-purple-100 text-purple-700" },
    directory: { labelKey: "adTypeDirectory", color: "bg-blue-100 text-blue-700" },
    product: { labelKey: "adTypeProduct", color: "bg-green-100 text-green-700" },
  }

  const filteredSubmissions = adSubmissions.filter((s) => {
    const matchesSearch =
      s.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.contactName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || s.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const isSuperAdmin = user?.role === UserRole.SuperAdmin

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 pt-6">
            <DollarSign className="mb-2 h-5 w-5 text-green-600" />
            <p className="text-xl font-bold">NT$2,450,000</p>
            <p className="text-muted-foreground text-xs">{t("admin.advertising.monthlyRevenue")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 pt-6">
            <Megaphone className="text-primary mb-2 h-5 w-5" />
            <p className="text-xl font-bold">{adSubmissions.length}</p>
            <p className="text-muted-foreground text-xs">{t("admin.advertising.adOrders")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 pt-6">
            <TrendingUp className="mb-2 h-5 w-5 text-blue-600" />
            <p className="text-xl font-bold">+18%</p>
            <p className="text-muted-foreground text-xs">{t("admin.advertising.monthlyGrowth")}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={viewMode === "orders" ? "default" : "outline"}
            onClick={() => setViewMode("orders")}
          >
            {t("admin.advertising.orderHistory") || "Ad order history"}
          </Button>
          {isSuperAdmin && (
            <Button
              size="sm"
              variant={viewMode === "packages" ? "default" : "outline"}
              onClick={() => setViewMode("packages")}
            >
              {t("admin.advertising.packageManagementTab") || "Ad package management"}
            </Button>
          )}
        </div>
      </div>

      {viewMode === "packages" && isSuperAdmin && <AdPackageManagement />}

      {viewMode === "orders" && (
        <>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder={t("admin.advertising.searchPlaceholder")}
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchQuery(e.target.value)
                }
                className="pl-10"
              />
            </div>
            <div className="flex gap-1">
              {(["all", "new", "contacted", "closed"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`rounded-lg px-3 py-2 text-xs ${statusFilter === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                >
                  {s === "all"
                    ? t("admin.companies.all")
                    : t(`admin.status.${statusConfig[s].labelKey}`)}
                </button>
              ))}
            </div>
          </div>

          <Card>
            <CardContent className="!p-0 !pt-5">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-border bg-body-table-dark-hover border-b border-gray-300">
                      <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase">
                        {t("admin.advertising.status")}
                      </th>
                      <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase">
                        {t("admin.advertising.companyName")}
                      </th>
                      <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase">
                        {t("admin.advertising.adType")}
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
                    {filteredSubmissions.map((submission) => {
                      const adType = adTypeConfig[submission.adType]
                      return (
                        <tr
                          key={submission.id}
                          className="border-border/50 hover:bg-muted/20 hover:bg-body-table-dark-hover border-b"
                        >
                          <td className="px-4 py-3">
                            <StatusBadge status={submission.status} />
                          </td>
                          <td className="text-foreground px-4 py-3 text-sm font-medium">
                            {submission.companyName}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded px-2 py-0.5 text-xs font-medium ${adType?.color || ""}`}
                            >
                              {adType
                                ? t(`admin.advertising.${adType.labelKey}`)
                                : submission.adType}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm">{submission.contactName}</p>
                            <p className="text-muted-foreground text-xs">{submission.email}</p>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium">
                            {submission.totalAmount}
                          </td>
                          <td className="text-muted-foreground px-4 py-3 text-sm">
                            {submission.submittedAt}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="hover:!bg-header-red-dark h-8 hover:!text-white"
                                onClick={() => {
                                  setSelectedSubmission(submission)
                                  setIsDetailOpen(true)
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="hover:!bg-header-red-dark h-8 hover:!text-white"
                              >
                                <Mail className="h-4 w-4" />
                              </Button>
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

          <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
            <DialogContent className="bg-body-bg-dark relative max-h-[90vh] max-w-2xl overflow-y-auto">
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground absolute top-3 right-3 h-8 w-8"
                onClick={() => setIsDetailOpen(false)}
                aria-label={t("admin.advertising.closeDialog")}
              >
                <X className="h-4 w-4" />
              </Button>
              {selectedSubmission && (
                <>
                  <DialogHeader>
                    <DialogTitle>{selectedSubmission.companyName}</DialogTitle>
                    <DialogDescription>
                      {t("admin.advertising.submittedOn")}
                      {selectedSubmission.submittedAt}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="mt-4 space-y-4 px-5">
                    <div className="border-border grid gap-3 border-b pb-4 sm:grid-cols-2">
                      <div className="bg-body-bg-dark-foreground rounded-lg p-3">
                        <p className="text-muted-foreground text-xs">
                          {t("admin.advertising.contact")}
                        </p>
                        <p className="text-sm font-medium">{selectedSubmission.contactName}</p>
                      </div>
                      <div className="bg-body-bg-dark-foreground rounded-lg p-3">
                        <p className="text-muted-foreground text-xs">
                          {t("admin.advertising.email")}
                        </p>
                        <p className="text-sm font-medium">{selectedSubmission.email}</p>
                      </div>
                      <div className="bg-body-bg-dark-foreground rounded-lg p-3">
                        <p className="text-muted-foreground text-xs">
                          {t("admin.advertising.phone")}
                        </p>
                        <p className="text-sm font-medium">{selectedSubmission.phone}</p>
                      </div>
                      <div className="bg-body-bg-dark-foreground rounded-lg p-3">
                        <p className="text-muted-foreground text-xs">
                          {t("admin.advertising.adType")}
                        </p>
                        <p className="text-sm font-medium">{selectedSubmission.adTypeName}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-2 text-xs">
                        {t("admin.advertising.selectedItems")}
                      </p>
                      {selectedSubmission.selectedItems.map((item, i) => (
                        <div
                          key={i}
                          className="bg-body-bg-dark-foreground mb-1 flex items-center gap-2 rounded-lg p-2"
                        >
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                    <div className="bg-primary/5 rounded-lg p-4">
                      <p className="text-muted-foreground text-sm">
                        {t("admin.advertising.estimatedAmount")}
                      </p>
                      <p className="text-xl font-bold">{selectedSubmission.totalAmount}</p>
                    </div>
                    <div className="flex gap-3 border-t py-5">
                      <Button className="flex-1" variant="default" asChild>
                        <a href={`mailto:${selectedSubmission.email}`}>
                          <Mail className="mr-2 h-4 w-4" />
                          {t("admin.advertising.sendEmail")}
                        </a>
                      </Button>
                      <Button
                        variant="outline"
                        className="hover:!bg-header-red-dark/70 flex-1 border !border-gray-300 bg-transparent hover:!text-white"
                        asChild
                      >
                        <a href={`tel:${selectedSubmission.phone}`}>
                          <Phone className="mr-2 h-4 w-4" />
                          {t("admin.advertising.call")}
                        </a>
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  )
}
