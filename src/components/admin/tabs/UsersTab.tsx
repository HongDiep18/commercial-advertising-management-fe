"use client"

import { useTranslation } from "react-i18next"
import { Ban, CheckCircle2, Pencil } from "lucide-react"
import Button from "@/components/ui/Button"
import Card, { CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { StatusBadge } from "../StatusBadge"
import { useAdminData } from "../AdminDataContext"

export function UsersTab() {
  const { t } = useTranslation()
  const { users } = useAdminData()
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {t("admin.users.usersCount", { count: users.length })}
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
                {users.map((u) => (
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
                          title={
                            u.status === "active"
                              ? t("admin.users.suspend")
                              : t("admin.users.enable")
                          }
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

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("admin.users.recentLogins")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users
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
