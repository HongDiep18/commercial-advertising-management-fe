"use client"

import { useTranslation } from "react-i18next"
import { Bot, Globe, Pencil, RefreshCw, Trash2, ToggleLeft, ToggleRight } from "lucide-react"
import Button from "@/components/ui/Button"
import Card, { CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { StatusBadge } from "../StatusBadge"
import { useAdminData } from "../AdminDataContext"

export function NewsTab() {
  const { t } = useTranslation()
  const { newsSources } = useAdminData()
  return (
    <div className="space-y-6">
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
                {newsSources.map((source) => (
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
