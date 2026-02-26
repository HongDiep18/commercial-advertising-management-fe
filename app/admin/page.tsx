"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Shield,
  Search,
  Eye,
  Mail,
  Phone,
  Building2,
  FileText,
  CheckCircle2,
  Clock,
  X,
} from "lucide-react"
import { useTranslation } from "react-i18next"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import Input from "@/components/ui/Input"
import { useUser, mockAdSubmissions, type AdSubmission } from "@/contexts/user-context"

const statusConfig: Record<
  "new" | "contacted" | "closed",
  { labelKey: string; color: string; icon: typeof Clock }
> = {
  new: {
    labelKey: "admin.statusNew",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    icon: Clock,
  },
  contacted: {
    labelKey: "admin.statusContacted",
    color: "bg-amber-100 text-amber-700 border-amber-200",
    icon: Mail,
  },
  closed: {
    labelKey: "admin.statusClosed",
    color: "bg-green-100 text-green-700 border-green-200",
    icon: CheckCircle2,
  },
}

const adTypeLabelKeys: Record<"popup" | "directory" | "product", string> = {
  popup: "admin.adTypePopup",
  directory: "admin.adTypeDirectory",
  product: "admin.adTypeProduct",
}

const adTypeColors: Record<"popup" | "directory" | "product", string> = {
  popup: "bg-purple-100 text-purple-700",
  directory: "bg-blue-100 text-blue-700",
  product: "bg-green-100 text-green-700",
}

export default function AdminPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { user, isLoggedIn, isAuthReady } = useUser()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedSubmission, setSelectedSubmission] = useState<AdSubmission | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  useEffect(() => {
    if (!isAuthReady) return
    if (!isLoggedIn || user?.role !== "admin") {
      router.push("/login")
    }
  }, [isAuthReady, isLoggedIn, user, router])

  if (!isAuthReady || !isLoggedIn || !user || user.role !== "admin") {
    return null
  }

  const filteredSubmissions = mockAdSubmissions.filter((submission) => {
    const matchesSearch =
      submission.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || submission.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const statusCounts = {
    all: mockAdSubmissions.length,
    new: mockAdSubmissions.filter((s) => s.status === "new").length,
    contacted: mockAdSubmissions.filter((s) => s.status === "contacted").length,
    closed: mockAdSubmissions.filter((s) => s.status === "closed").length,
  }

  const handleViewDetail = (submission: AdSubmission) => {
    setSelectedSubmission(submission)
    setIsDetailOpen(true)
  }

  return (
    <main className="bg-background min-h-screen">
      <Header />

      <div className="pt-14">
        <section className="from-primary to-primary/80 text-primary-foreground bg-gradient-to-r py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <div className="bg-primary-foreground/20 flex h-12 w-12 items-center justify-center rounded-lg">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{t("admin.title")}</h1>
                <p className="text-primary-foreground/80">{t("admin.subtitle")}</p>
              </div>
            </div>
          </div>
        </section>

        <div className="bg-body-bg-dark">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                {
                  key: "all",
                  labelKey: "admin.allCases",
                  count: statusCounts.all,
                  color: "bg-slate-100 text-slate-700",
                },
                {
                  key: "new",
                  labelKey: "admin.statusNew",
                  count: statusCounts.new,
                  color: "bg-blue-100 text-blue-700",
                },
                {
                  key: "contacted",
                  labelKey: "admin.statusContacted",
                  count: statusCounts.contacted,
                  color: "bg-amber-100 text-amber-700",
                },
                {
                  key: "closed",
                  labelKey: "admin.statusClosed",
                  count: statusCounts.closed,
                  color: "bg-green-100 text-green-700",
                },
              ].map((stat) => (
                <button
                  key={stat.key}
                  type="button"
                  onClick={() => setStatusFilter(stat.key)}
                  className={`rounded-lg border border-gray-400 p-4 transition-all ${
                    statusFilter === stat.key
                      ? "border-primary ring-primary ring-2"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <p className="text-muted-foreground text-sm">{t(stat.labelKey)}</p>
                  <p className={`mt-1 text-2xl font-bold ${stat.color.split(" ")[1]}`}>
                    {stat.count}
                  </p>
                </button>
              ))}
            </div>

            <Card className="mb-6">
              <Card.Content className="!p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="relative w-full min-w-0 flex-1">
                    <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                      placeholder={t("admin.searchPlaceholder")}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-10 w-full pl-10"
                    />
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {statusFilter !== "all" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setStatusFilter("all")}
                        className="hover:!bg-header-red-dark/80 hover:!text-white"
                      >
                        <X className="mr-1 h-4 w-4" />
                        {t("admin.clearFilter")}
                      </Button>
                    )}
                  </div>
                </div>
              </Card.Content>
            </Card>

            <Card>
              <Card.Header>
                <Card.Title>{t("admin.formTitle")}</Card.Title>
                <p className="text-muted-foreground text-sm">
                  {t("admin.countResults", { count: filteredSubmissions.length })}
                </p>
              </Card.Header>
              <Card.Content>
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full">
                    <thead>
                      <tr className="border-border border-b">
                        <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                          {t("admin.tableStatus")}
                        </th>
                        <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                          {t("admin.tableCompany")}
                        </th>
                        <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                          {t("admin.tableAdType")}
                        </th>
                        <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                          {t("admin.tableContact")}
                        </th>
                        <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                          {t("admin.tableSubmittedAt")}
                        </th>
                        <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                          {t("admin.tableAction")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSubmissions.map((submission) => {
                        const status = statusConfig[submission.status]
                        const StatusIcon = status.icon
                        return (
                          <tr
                            key={submission.id}
                            className="border-border hover:bg-body-bg-dark border-b transition-colors"
                          >
                            <td className="px-4 py-4">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${status.color}`}
                              >
                                <StatusIcon className="h-3 w-3" />
                                {t(status.labelKey)}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <p className="text-foreground font-medium">
                                {submission.companyName}
                              </p>
                            </td>
                            <td className="px-4 py-4">
                              <span
                                className={`rounded px-2 py-1 text-xs font-medium ${adTypeColors[submission.adType]}`}
                              >
                                {t(adTypeLabelKeys[submission.adType])}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <p className="text-foreground text-sm">{submission.contactName}</p>
                              <p className="text-muted-foreground text-xs">{submission.email}</p>
                            </td>
                            <td className="text-muted-foreground px-4 py-4 text-sm">
                              {submission.submittedAt}
                            </td>
                            <td className="px-4 py-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDetail(submission)}
                                className="hover:!bg-header-red-dark/80 hover:!text-white"
                              >
                                <Eye className="mr-1 h-4 w-4" />
                                {t("admin.view")}
                              </Button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-4 md:hidden">
                  {filteredSubmissions.map((submission) => {
                    const status = statusConfig[submission.status]
                    const StatusIcon = status.icon
                    return (
                      <div
                        key={submission.id}
                        role="button"
                        tabIndex={0}
                        className="border-border rounded-lg border p-4"
                        onClick={() => handleViewDetail(submission)}
                        onKeyDown={(e) => e.key === "Enter" && handleViewDetail(submission)}
                      >
                        <div className="mb-3 flex items-start justify-between">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${status.color}`}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {t(status.labelKey)}
                          </span>
                          <span
                            className={`rounded px-2 py-1 text-xs font-medium ${adTypeColors[submission.adType]}`}
                          >
                            {t(adTypeLabelKeys[submission.adType])}
                          </span>
                        </div>
                        <p className="text-foreground mb-1 font-medium">{submission.companyName}</p>
                        <p className="text-muted-foreground text-sm">
                          {submission.contactName} / {submission.email}
                        </p>
                        <p className="text-muted-foreground mt-2 text-xs">
                          {submission.submittedAt}
                        </p>
                      </div>
                    )
                  })}
                </div>

                {filteredSubmissions.length === 0 && (
                  <div className="py-12 text-center">
                    <FileText className="text-muted-foreground/30 mx-auto mb-4 h-12 w-12" />
                    <p className="text-muted-foreground">{t("admin.noResults")}</p>
                  </div>
                )}
              </Card.Content>
            </Card>
          </div>
        </div>
      </div>

      {isDetailOpen && selectedSubmission && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-detail-title"
        >
          <div className="bg-body-bg-dark relative max-h-[90vh] w-full max-w-2xl overflow-x-hidden overflow-y-auto rounded-xl shadow-xl">
            <div className="bg-muted/20 sticky top-0 z-10 flex items-start justify-between gap-4 px-6 py-5">
              <div className="min-w-0 flex-1">
                <h2
                  id="admin-detail-title"
                  className="text-foreground flex flex-wrap items-center gap-2 text-xl font-bold"
                >
                  <span>{selectedSubmission.companyName}</span>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                      statusConfig[selectedSubmission.status].color
                    }`}
                  >
                    {t(statusConfig[selectedSubmission.status].labelKey)}
                  </span>
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="text-muted-foreground text-sm">
                    {t("admin.submittedAt", { date: selectedSubmission.submittedAt })}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailOpen(false)}
                className="text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg p-1.5 transition-colors"
                aria-label={t("admin.close")}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 p-6 pt-0">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="bg-body-bg-dark-foreground flex items-center gap-3 rounded-lg p-3">
                  <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                    <Building2 className="text-primary h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">{t("admin.contactPerson")}</p>
                    <p className="font-medium">{selectedSubmission.contactName}</p>
                  </div>
                </div>
                <div className="bg-body-bg-dark-foreground flex items-center gap-3 rounded-lg p-3">
                  <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                    <Mail className="text-primary h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">{t("admin.email")}</p>
                    <p className="text-sm font-medium">{selectedSubmission.email}</p>
                  </div>
                </div>
                <div className="bg-body-bg-dark-foreground flex items-center gap-3 rounded-lg p-3">
                  <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                    <Phone className="text-primary h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">{t("admin.phone")}</p>
                    <p className="font-medium">{selectedSubmission.phone}</p>
                  </div>
                </div>
                <div className="bg-body-bg-dark-foreground flex items-center gap-3 rounded-lg p-3">
                  <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                    <FileText className="text-primary h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">{t("admin.adType")}</p>
                    <p className="font-medium">{selectedSubmission.adTypeName}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-muted-foreground mb-2 text-sm font-medium">
                  {t("admin.selectedItems")}
                </h4>
                <div className="space-y-2">
                  {selectedSubmission.selectedItems.map((item, i) => (
                    <div
                      key={i}
                      className="bg-body-bg-dark-foreground flex items-center gap-2 rounded-lg p-2"
                    >
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-primary/5 rounded-lg p-4">
                <p className="text-muted-foreground text-sm">{t("admin.estimatedAmount")}</p>
                <p className="text-foreground text-xl font-bold">
                  {selectedSubmission.totalAmount}
                </p>
              </div>

              {selectedSubmission.notes && (
                <div>
                  <h4 className="text-muted-foreground mb-2 text-sm font-medium">
                    {t("admin.notes")}
                  </h4>
                  <p className="bg-muted/30 rounded-lg p-3 text-sm">{selectedSubmission.notes}</p>
                </div>
              )}

              <div className="flex gap-3 border-t border-gray-300 pt-6">
                <Button
                  className="hover:!bg-header-red-dark/80 !bg-header-red-dark flex-1 hover:!text-white"
                  asChild
                >
                  <a href={`mailto:${selectedSubmission.email}`}>
                    <Mail className="mr-2 h-4 w-4" />
                    {t("admin.sendEmail")}
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className="hover:!bg-header-red-dark/80 flex-1 border !border-gray-400 bg-transparent hover:!text-white"
                  asChild
                >
                  <a href={`tel:${selectedSubmission.phone}`}>
                    <Phone className="mr-2 h-4 w-4" />
                    {t("admin.callPhone")}
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  )
}
