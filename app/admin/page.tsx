"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslation } from "react-i18next"
import {
  Shield,
  Search,
  Eye,
  Mail,
  Phone,
  Building2,
  CheckCircle2,
  Clock,
  XCircle,
  LayoutDashboard,
  ShoppingBag,
  Newspaper,
  Megaphone,
  MapPin,
  UserCog,
  AlertTriangle,
  RefreshCw,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Ban,
  Globe,
  Bot,
  TrendingUp,
  DollarSign,
  Package,
  X,
} from "lucide-react"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import Button from "@/components/ui/Button"
import Card, { CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import Input from "@/components/ui/Input"
import { useUser, mockAdSubmissions, type AdSubmission } from "@/contexts/user-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog"

// --- Tab definitions ---
const adminTabs = [
  { id: "dashboard", icon: LayoutDashboard },
  { id: "companies", icon: Building2 },
  { id: "store", icon: ShoppingBag },
  { id: "news", icon: Newspaper },
  { id: "advertising", icon: Megaphone },
  { id: "property", icon: MapPin },
  { id: "users", icon: UserCog },
]

// --- Mock data ---
import {
  mockCompanyRequests,
  mockProducts,
  mockNewsSources,
  mockPropertyListings,
  mockUsers,
} from "@/data/adminMockData"

// Status badge helper
function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation()
  const config: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    active: "bg-green-100 text-green-700",
    draft: "bg-slate-100 text-slate-700",
    paused: "bg-amber-100 text-amber-700",
    published: "bg-green-100 text-green-700",
    sold: "bg-blue-100 text-blue-700",
    suspended: "bg-red-100 text-red-700",
    new: "bg-blue-100 text-blue-700",
    contacted: "bg-amber-100 text-amber-700",
    closed: "bg-green-100 text-green-700",
  }
  const label = [
    "pending",
    "approved",
    "rejected",
    "active",
    "draft",
    "paused",
    "published",
    "sold",
    "suspended",
    "new",
    "contacted",
    "closed",
  ].includes(status)
    ? t(`admin.status.${status}`)
    : status
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${config[status] || "bg-muted text-muted-foreground"}`}
    >
      {label}
    </span>
  )
}

// --- Tab Components ---
function DashboardTab() {
  const { t } = useTranslation()
  const stats = [
    {
      labelKey: "totalCompanies",
      value: "3,247",
      icon: Building2,
      trend: "+12%",
      color: "text-blue-600",
    },
    {
      labelKey: "pendingApplications",
      value: String(mockCompanyRequests.filter((c) => c.status === "pending").length),
      icon: Clock,
      trend: "",
      color: "text-amber-600",
    },
    {
      labelKey: "newsCount",
      value: "359",
      icon: Newspaper,
      trendKey: "trendToday",
      color: "text-green-600",
    },
    {
      labelKey: "propertyViews",
      value: "1,302",
      icon: TrendingUp,
      trend: "+23%",
      color: "text-primary",
    },
  ]

  const recentActivities = [
    {
      time: "14:30",
      actionKey: "activityNewCompany",
      detailKey: "activityCompanyDetail",
      type: "company",
    },
    {
      time: "13:15",
      actionKey: "activityNewsCrawl",
      detailKey: "activityNewsDetail",
      type: "news",
    },
    { time: "12:00", actionKey: "activityAdOrder", detailKey: "activityAdDetail", type: "ad" },
    {
      time: "10:45",
      actionKey: "activityPropertyUpdate",
      detailKey: "activityPropertyDetail",
      type: "property",
    },
    { time: "09:30", actionKey: "activityUserReg", detailKey: "activityUserDetail", type: "user" },
    {
      time: "08:00",
      actionKey: "activitySystem",
      detailKey: "activitySystemDetail",
      type: "system",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.labelKey}>
              <CardContent className="p-4">
                <div className="mb-2 flex items-center justify-between pt-7">
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                  {(stat.trend || (stat as { trendKey?: string }).trendKey) && (
                    <span className="text-xs font-medium text-green-600">
                      {stat.trend ||
                        t(`admin.dashboard.${(stat as { trendKey: string }).trendKey}`)}
                    </span>
                  )}
                </div>
                <p className="text-foreground text-2xl font-bold">{stat.value}</p>
                <p className="text-muted-foreground text-sm">
                  {t(`admin.dashboard.${stat.labelKey}`)}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Alerts */}
      <Card className="!bg-admin-yellow !border-admin-yellow-border">
        <CardContent className="p-4 pt-7">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="font-medium text-amber-800">{t("admin.dashboard.attentionRequired")}</p>
              <p className="mt-1 text-sm text-amber-700">
                {t("admin.dashboard.pendingAlert", {
                  count: mockCompanyRequests.filter((c) => c.status === "pending").length,
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("admin.dashboard.recentActivity")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-muted-foreground w-12 shrink-0 pt-0.5 text-xs">
                  {activity.time}
                </span>
                <div className="bg-primary mt-1.5 h-2 w-2 shrink-0 rounded-full" />
                <div>
                  <p className="text-foreground text-sm font-medium">
                    {t(`admin.dashboard.${activity.actionKey}`)}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {t(`admin.dashboard.${activity.detailKey}`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function CompaniesTab() {
  const { t } = useTranslation()
  const [filter, setFilter] = useState("all")
  const filtered =
    filter === "all" ? mockCompanyRequests : mockCompanyRequests.filter((c) => c.status === filter)
  const pendingCount = mockCompanyRequests.filter((c) => c.status === "pending").length

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
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

      {/* Table */}
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
                {filtered.map((company) => (
                  <tr
                    key={company.id}
                    className="border-border hover:bg-muted/20 hover:bg-body-table-dark-hover border-b"
                  >
                    <td className="px-4 py-3">
                      <p className="text-foreground text-sm font-medium">{company.companyName}</p>
                      <p className="text-muted-foreground text-xs">{company.email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm">{company.contactPerson}</td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">{company.industry}</td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">
                      {company.submittedAt}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={company.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {company.status === "pending" && (
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

function StoreTab() {
  const { t } = useTranslation()
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {t("admin.store.productsCount", { count: mockProducts.length })}
        </p>
        <Button size="sm" variant="primary">
          <Package className="mr-1.5 h-4 w-4" />
          {t("admin.store.addProduct")}
        </Button>
      </div>

      <Card>
        <CardContent className="!p-0 !pt-5">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-border bg-body-table-dark-hover border-b border-gray-300">
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase">
                    {t("admin.store.productName")}
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase">
                    {t("admin.store.category")}
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase">
                    {t("admin.store.price")}
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase">
                    {t("admin.store.shopifySync")}
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase">
                    {t("admin.store.status")}
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase">
                    {t("admin.store.actions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {mockProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="border-border/50 hover:bg-muted/20 hover:bg-body-table-dark-hover border-b"
                  >
                    <td className="text-foreground px-4 py-3 text-sm font-medium">
                      {product.name}
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">{product.category}</td>
                    <td className="px-4 py-3 text-sm font-medium">{product.price}</td>
                    <td className="px-4 py-3">
                      {product.shopifySync ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle2 className="h-3 w-3" />
                          {t("admin.store.synced")}
                        </span>
                      ) : (
                        <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                          <XCircle className="h-3 w-3" />
                          {t("admin.store.notSynced")}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={product.status} />
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
                          className="text-destructive hover:!bg-header-red-dark h-8 hover:!text-white"
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
    </div>
  )
}

function NewsTab() {
  const { t } = useTranslation()
  return (
    <div className="space-y-6">
      {/* Crawl Controls */}
      <Card>
        <CardContent className="p-4 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-foreground font-medium">{t("admin.news.crawlerControl")}</p>
              <p className="text-muted-foreground text-sm">{t("admin.news.crawlerDesc")}</p>
            </div>
            <Button size="sm" variant="primary">
              <RefreshCw className="mr-1.5 h-4 w-4" />
              {t("admin.news.runCrawler")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* News Sources Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{t("admin.news.newsSources")}</CardTitle>
            <Button size="sm" variant="primary">
              <Globe className="mr-1.5 h-4 w-4" />
              {t("admin.news.addSource")}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="!p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-border bg-body-table-dark-hover border-b border-gray-300">
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase">
                    {t("admin.news.sourceName")}
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase">
                    {t("admin.news.domain")}
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase">
                    {t("admin.news.crawlFrequency")}
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase">
                    {t("admin.news.lastCrawl")}
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase">
                    {t("admin.news.articlesCount")}
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase">
                    {t("admin.news.status")}
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase">
                    {t("admin.news.actions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {mockNewsSources.map((source) => (
                  <tr
                    key={source.id}
                    className="border-border/50 hover:bg-muted/20 hover:bg-body-table-dark-hover border-b"
                  >
                    <td className="text-foreground px-4 py-3 text-sm font-medium">{source.name}</td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">{source.domain}</td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">{source.frequency}</td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">{source.lastCrawl}</td>
                    <td className="px-4 py-3 text-sm font-medium">{source.articlesCount}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={source.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:!bg-header-red-dark h-8 hover:!text-white"
                          title={
                            source.status === "active"
                              ? t("admin.news.pause")
                              : t("admin.news.enable")
                          }
                        >
                          {source.status === "active" ? (
                            <ToggleRight className="h-4 w-4 text-green-600" />
                          ) : (
                            <ToggleLeft className="text-muted-foreground h-4 w-4" />
                          )}
                        </Button>
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
                          className="text-destructive hover:!bg-header-red-dark h-8 hover:!text-white"
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

      {/* AI Summary Stats */}
      <Card>
        <CardContent className="p-4 pt-5">
          <div className="bg-body- mb-3 flex items-center gap-3">
            <Bot className="text-primary h-5 w-5" />
            <p className="text-foreground font-medium">{t("admin.news.aiSummaryStats")}</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-body-table-dark-hover rounded-lg p-3 text-center">
              <p className="text-foreground text-xl font-bold">359</p>
              <p className="text-muted-foreground text-xs">{t("admin.news.summariesGenerated")}</p>
            </div>
            <div className="bg-body-table-dark-hover rounded-lg p-3 text-center">
              <p className="text-foreground text-xl font-bold">12</p>
              <p className="text-muted-foreground text-xs">{t("admin.news.pendingSummaries")}</p>
            </div>
            <div className="bg-body-table-dark-hover rounded-lg p-3 text-center">
              <p className="text-foreground text-xl font-bold">98.3%</p>
              <p className="text-muted-foreground text-xs">{t("admin.news.qualityPassRate")}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function AdvertisingTab() {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedSubmission, setSelectedSubmission] = useState<AdSubmission | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

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

  const filteredSubmissions = mockAdSubmissions.filter((s) => {
    const matchesSearch =
      s.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.contactName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || s.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Revenue Summary */}
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
            <p className="text-xl font-bold">{mockAdSubmissions.length}</p>
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

      {/* Search */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder={t("admin.advertising.searchPlaceholder")}
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
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

      {/* Ad Submissions Table */}
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
                          {adType ? t(`admin.advertising.${adType.labelKey}`) : submission.adType}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm">{submission.contactName}</p>
                        <p className="text-muted-foreground text-xs">{submission.email}</p>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">{submission.totalAmount}</td>
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

      {/* Detail Dialog (reused from original) */}
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
                    <p className="text-muted-foreground text-xs">{t("admin.advertising.email")}</p>
                    <p className="text-sm font-medium">{selectedSubmission.email}</p>
                  </div>
                  <div className="bg-body-bg-dark-foreground rounded-lg p-3">
                    <p className="text-muted-foreground text-xs">{t("admin.advertising.phone")}</p>
                    <p className="text-sm font-medium">{selectedSubmission.phone}</p>
                  </div>
                  <div className="bg-body-bg-dark-foreground rounded-lg p-3">
                    <p className="text-muted-foreground text-xs">{t("admin.advertising.adType")}</p>
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
                  <Button className="flex-1" variant="primary" asChild>
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
    </div>
  )
}

function PropertyTab() {
  const { t } = useTranslation()
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {t("admin.property.listingsCount", { count: mockPropertyListings.length })}
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
                {mockPropertyListings.map((listing) => (
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

      {/* Address Visibility Note */}
      <Card className="!bg-admin-yellow !border-admin-yellow-border py-4 pt-6">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="font-medium text-amber-800">地址可見性設定</p>
              <p className="mt-1 text-sm text-amber-700">
                {
                  "物業詳細地址僅在管理後台中可見，公開頁面僅顯示省/市級別的地理位置，以保護賣家隱私。"
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function UsersTab() {
  const { t } = useTranslation()
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {t("admin.users.usersCount", { count: mockUsers.length })}
        </p>
      </div>

      <Card>
        <CardContent className="!p-0 !pt-5">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-border bg-body-table-dark-hover border-b border-gray-300">
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase">
                    {t("admin.users.name")}
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase">
                    {t("admin.users.company")}
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase">
                    {t("admin.users.role")}
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase">
                    {t("admin.users.lastLogin")}
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase">
                    {t("admin.users.status")}
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase">
                    {t("admin.users.actions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {mockUsers.map((u) => (
                  <tr
                    key={u.id}
                    className="border-border/50 hover:bg-muted/20 hover:bg-body-table-dark-hover border-b"
                  >
                    <td className="px-4 py-3">
                      <p className="text-foreground text-sm font-medium">{u.name}</p>
                      <p className="text-muted-foreground text-xs">{u.email}</p>
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">{u.company}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          u.role === "admin"
                            ? "bg-primary/10 text-primary"
                            : u.role === "paid"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {u.role === "admin"
                          ? t("admin.users.roleAdmin")
                          : u.role === "paid"
                            ? t("admin.users.rolePaid")
                            : t("admin.users.roleFree")}
                      </span>
                    </td>
                    <td className="text-muted-foreground px-4 py-3 text-sm">{u.lastLogin}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={u.status} />
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
                          title={u.status === "active" ? "停權" : "啟用"}
                        >
                          {u.status === "active" ? (
                            <Ban className="text-muted-foreground h-4 w-4" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          )}
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

      {/* Access Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">最近登入紀錄</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockUsers
              .filter((u) => u.status === "active")
              .slice(0, 4)
              .map((u) => (
                <div
                  key={u.id}
                  className="border-border/50 flex items-center justify-between border-b py-2 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{u.name}</p>
                      <p className="text-muted-foreground text-xs">{u.email}</p>
                    </div>
                  </div>
                  <span className="text-muted-foreground text-xs">{u.lastLogin}</span>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// --- Main Admin Page ---

export default function AdminPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { user, isLoggedIn } = useUser()
  const [activeTab, setActiveTab] = useState("dashboard")

  useEffect(() => {
    if (!isLoggedIn || user?.role !== "admin") {
      router.push("/login")
    }
  }, [isLoggedIn, user, router])

  if (!isLoggedIn || !user || user.role !== "admin") {
    return null
  }

  const renderTab = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardTab />
      case "companies":
        return <CompaniesTab />
      case "store":
        return <StoreTab />
      case "news":
        return <NewsTab />
      case "advertising":
        return <AdvertisingTab />
      case "property":
        return <PropertyTab />
      case "users":
        return <UsersTab />
      default:
        return <DashboardTab />
    }
  }

  return (
    <main className="bg-body-bg-dark min-h-screen">
      <Header />

      <div className="pt-14">
        {/* Hero Section */}
        <section className="from-primary to-primary/80 text-primary-foreground bg-gradient-to-r py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{t("admin.title")}</h1>
                <p className="text-primary-foreground/80 text-sm">{t("admin.subtitle")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <section className="border-border bg-body-bg-dark sticky top-14 z-40 border-b border-gray-300">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="-mb-px flex items-center gap-1 overflow-x-auto py-1">
              {adminTabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                      isActive
                        ? "border-primary text-primary"
                        : "text-muted-foreground hover:text-foreground hover:border-border border-transparent"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {t(`admin.tabs.${tab.id}`)}
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        {/* Tab Content */}
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{renderTab()}</div>
      </div>

      <Footer />
    </main>
  )
}
