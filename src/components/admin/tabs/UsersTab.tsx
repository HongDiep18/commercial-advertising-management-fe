"use client"

import { useEffect, useMemo, useState } from "react"
import { Ban, CheckCircle2, Eye, EyeOff, Search, UserPlus, X } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

import { patchUserActive } from "@/api/admin"
import {
  defaultAdminUsersQuery,
  useAdminUsersList,
  useCreateAdminUser,
} from "@/api/admin-users/hooks"
import { validateSetPassword } from "@/lib/passwordValidation"
import type {
  AdminListUserRoleFilter,
  AdminListUsersQuery,
  AdminUserStatus,
} from "@/api/admin-users/types"
import { AdminPaginationBar } from "@/components/admin/AdminPaginationBar"
import Button from "@/components/ui/Button"
import Card, { CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog"
import Input from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Toast, type ToastVariant } from "@/components/ui/Toast"
import { useUser } from "@/contexts/user-context"
import { useDebounce } from "@/hooks/useDebounce"
import { FeatureKey } from "@/types"
import { cn } from "@/lib/utils"
import { formatDateTimeForLocale } from "@/utils/datetime"

import { useAdminData } from "../AdminDataContext"
import { StatusBadge } from "../StatusBadge"
import { AddMemberForm } from "./AddMemberForm"

type StatusFilter = "all" | AdminUserStatus
type RoleFilter = "all" | AdminListUserRoleFilter

function matchesDemoRoleFilter(role: string, roleFilter: RoleFilter): boolean {
  if (roleFilter === "all") return true
  if (roleFilter === "admin") return role === "admin"
  return role !== "admin"
}

const RECENT_LOGINS_QUERY: AdminListUsersQuery = {
  page: 1,
  limit: 5,
  sortBy: "lastLoginAt",
  sortOrder: "desc",
}

export function UsersTab() {
  const { t, i18n } = useTranslation()
  const { users: demoUsers, updateUserActive } = useAdminData()
  const { canUseFeature } = useUser()
  const isRealAdmin = canUseFeature(FeatureKey.AdminPanel)
  const queryClient = useQueryClient()

  const [page, setPage] = useState(defaultAdminUsersQuery.page ?? 1)
  const [searchInput, setSearchInput] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all")
  const debouncedSearch = useDebounce(searchInput, 400)

  const listQuery = useMemo<AdminListUsersQuery>(
    () => ({
      page,
      limit: defaultAdminUsersQuery.limit,
      sortBy: defaultAdminUsersQuery.sortBy,
      sortOrder: defaultAdminUsersQuery.sortOrder,
      search: debouncedSearch || undefined,
      status: statusFilter === "all" ? undefined : statusFilter,
      role: roleFilter === "all" ? undefined : roleFilter,
    }),
    [page, debouncedSearch, statusFilter, roleFilter]
  )

  const {
    data: listData,
    isLoading: isListLoading,
    isFetching: isListFetching,
    isError: isListError,
  } = useAdminUsersList(isRealAdmin, listQuery)

  const { data: recentLoginsData } = useAdminUsersList(isRealAdmin, RECENT_LOGINS_QUERY)

  const apiRows = listData?.rows ?? []
  const pagination = listData?.pagination
  const totalPages = Math.max(1, pagination?.totalPages ?? 1)
  const demoRows = useMemo(
    () =>
      demoUsers.map((u) => ({
        id: u.id,
        contactName: "name" in u ? String(u.name) : "-",
        email: u.email,
        company: "company" in u && u.company ? String(u.company) : "-",
        role: u.role,
        lastLogin: u.lastLogin,
        status: (u.status === "suspended" ? "suspended" : "active") as AdminUserStatus,
      })),
    [demoUsers]
  )
  const filteredDemoRows = useMemo(
    () => demoRows.filter((u) => matchesDemoRoleFilter(u.role, roleFilter)),
    [demoRows, roleFilter]
  )
  const rows = isRealAdmin ? apiRows : filteredDemoRows
  const recentLoginRows = isRealAdmin
    ? (recentLoginsData?.rows ?? [])
    : demoRows.filter((u) => u.status === "active").slice(0, 4)

  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; variant: ToastVariant; visible: boolean }>({
    message: "",
    variant: "info",
    visible: false,
  })

  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [newUserRole, setNewUserRole] = useState<"admin" | "user">("admin")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [addUserForm, setAddUserForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const handleAddUserClose = () => {
    setIsAddUserOpen(false)
    setNewUserRole("admin")
    setShowPassword(false)
    setShowConfirmPassword(false)
    setAddUserForm({ fullName: "", email: "", password: "", confirmPassword: "" })
  }

  const createAdminUserMutation = useCreateAdminUser()

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const { fullName, email, password, confirmPassword } = addUserForm
    if (!fullName.trim() || !email.trim()) {
      showToast(t("admin.users.formValidationRequired"), "error")
      return
    }
    const passwordCheck = validateSetPassword(password, confirmPassword)
    if (!passwordCheck.valid) {
      showToast(t(passwordCheck.errorKey), "error")
      return
    }
    createAdminUserMutation.mutate(
      { email: email.trim(), password, name: fullName.trim() },
      {
        onSuccess: () => {
          handleAddUserClose()
          showToast(t("admin.users.createSuccess"), "success")
        },
        onError: (err: unknown) => {
          const status = (err as { status?: number })?.status
          if (status === 409) {
            showToast(t("admin.users.createErrorDuplicate"), "error")
          } else {
            showToast(t("admin.users.createError"), "error")
          }
        },
      }
    )
  }

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, statusFilter, roleFilter])

  const showToast = (message: string, variant: ToastVariant = "info") =>
    setToast({ message, variant, visible: true })
  const hideToast = () => setToast((prev) => ({ ...prev, visible: false }))

  const handleToggleUserActive = async (userId: string, nextIsActive: boolean) => {
    if (!isRealAdmin) return
    const question = nextIsActive
      ? t("admin.users.confirmEnable") || "Do you want to enable this account?"
      : t("admin.users.confirmDisable") || "Do you want to disable this account?"
    const ok = window.confirm(question)
    if (!ok) return

    setUpdatingUserId(userId)
    try {
      if (updateUserActive) {
        await updateUserActive(userId, nextIsActive)
      } else {
        await patchUserActive(userId, nextIsActive)
      }
      showToast(
        nextIsActive
          ? t("admin.users.enabledSuccess") || "Account enabled."
          : t("admin.users.disabledSuccess") || "Account disabled.",
        "success"
      )
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
    } catch {
      showToast(t("admin.users.updateError") || "Failed to update account status.", "error")
    } finally {
      setUpdatingUserId(null)
    }
  }

  const userCount = isRealAdmin ? (pagination?.total ?? 0) : filteredDemoRows.length
  const isRefreshing = isListFetching && !isListLoading
  const hasActiveFilters =
    searchInput.trim().length > 0 || roleFilter !== "all" || statusFilter !== "all"

  const handleClearFilters = () => {
    setSearchInput("")
    setRoleFilter("all")
    setStatusFilter("all")
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-muted-foreground text-sm">
            {t("admin.users.usersCount", { count: userCount })}
          </p>
          {isRealAdmin && (
            <Button
              type="button"
              size="sm"
              variant="primary"
              className="h-8 gap-1.5 text-xs"
              onClick={() => setIsAddUserOpen(true)}
            >
              <UserPlus className="h-3.5 w-3.5" aria-hidden />
              {t("admin.users.addUser")}
            </Button>
          )}
        </div>
        {isRealAdmin && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[20rem] flex-1 sm:max-w-xs">
              <Search
                className="text-muted-foreground absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2"
                aria-hidden
              />
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t("admin.users.searchPlaceholder", {
                  defaultValue: "Search email, company, contact…",
                })}
                className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring h-8 w-full rounded-md border py-1 pr-3 pl-8 text-xs focus-visible:ring-1 focus-visible:outline-none"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
              className="border-input bg-background h-8 rounded-md border px-2 text-xs"
              aria-label={t("admin.users.roleFilter", { defaultValue: "Role filter" })}
            >
              <option value="all">{t("admin.users.roleAll", { defaultValue: "All users" })}</option>
              <option value="admin">
                {t("admin.users.roleStaff", { defaultValue: "Staff (admin)" })}
              </option>
              <option value="user">
                {t("admin.users.rolePlatform", { defaultValue: "Platform users" })}
              </option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="border-input bg-background h-8 rounded-md border px-2 text-xs"
              aria-label={t("admin.users.statusFilter", { defaultValue: "Status filter" })}
            >
              <option value="all">
                {t("admin.users.statusAll", { defaultValue: "All statuses" })}
              </option>
              <option value="active">{t("admin.status.active")}</option>
              <option value="suspended">{t("admin.status.suspended")}</option>
            </select>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={handleClearFilters}
              disabled={!hasActiveFilters}
            >
              <X className="h-3.5 w-3.5" aria-hidden />
              {t("admin.users.clearFilters", { defaultValue: "Clear filters" })}
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardContent className="!p-0 !pt-5">
          {isRealAdmin && isListLoading && (
            <p className="text-muted-foreground px-4 py-6 text-sm">
              {t("common.loading", { defaultValue: "Loading..." })}
            </p>
          )}
          {isRealAdmin && isListError && !isListLoading && (
            <p className="text-muted-foreground px-4 py-6 text-sm">
              {t("admin.users.loadError", { defaultValue: "Unable to load users right now." })}
            </p>
          )}
          {(!isRealAdmin || (!isListLoading && !isListError)) && (
            <div className={`overflow-x-auto ${isRefreshing ? "opacity-60" : ""}`}>
              <table className="w-full">
                <thead>
                  <tr className="border-border bg-body-table-dark-hover border-b border-gray-300">
                    <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium uppercase">
                      {t("admin.users.name")}
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
                  {rows.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-muted-foreground px-4 py-8 text-center text-sm"
                      >
                        {t("admin.users.empty", { defaultValue: "No users found." })}
                      </td>
                    </tr>
                  )}
                  {rows.map((u) => (
                    <tr
                      key={u.id}
                      className="border-border/50 hover:bg-muted/20 hover:bg-body-table-dark-hover border-b"
                    >
                      <td className="px-4 py-3">
                        <p className="text-foreground text-sm font-medium">{u.contactName}</p>
                        <p className="text-muted-foreground text-xs">{u.email}</p>
                      </td>
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
                      <td className="text-muted-foreground px-4 py-3 text-sm">
                        {formatDateTimeForLocale(u.lastLogin, i18n.language)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={u.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:!bg-header-red-dark h-8 hover:!text-white"
                            title={
                              u.status === "active"
                                ? t("admin.users.suspend")
                                : t("admin.users.enable")
                            }
                            disabled={!isRealAdmin || updatingUserId === u.id}
                            onClick={() => {
                              const nextIsActive = u.status !== "active"
                              void handleToggleUserActive(u.id, nextIsActive)
                            }}
                          >
                            {u.status === "active" ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <Ban className="text-muted-foreground h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {pagination && <AdminPaginationBar pagination={pagination} setPage={setPage} />}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("admin.users.recentLogins")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentLoginRows.length === 0 && (
              <p className="text-muted-foreground text-sm">
                {t("admin.users.recentLoginsEmpty", { defaultValue: "No recent logins." })}
              </p>
            )}
            {recentLoginRows.map((u) => (
              <div
                key={u.id}
                className="border-border/50 flex items-center justify-between border-b py-2 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium">
                    {u.contactName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{u.contactName}</p>
                    <p className="text-muted-foreground text-xs">{u.email}</p>
                  </div>
                </div>
                <span className="text-muted-foreground text-xs">
                  {formatDateTimeForLocale(u.lastLogin, i18n.language)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Toast
        message={toast.message}
        variant={toast.variant}
        visible={toast.visible}
        onClose={hideToast}
        duration={4500}
      />

      <Dialog
        open={isAddUserOpen}
        onOpenChange={(open) => {
          if (!open) handleAddUserClose()
        }}
      >
        <DialogContent
          className={cn(
            "flex flex-col overflow-hidden p-0",
            newUserRole === "user" ? "sm:max-w-3xl" : "max-w-md"
          )}
        >
          <DialogHeader className="bg-background relative shrink-0 border-b">
            <DialogTitle className="pr-12">{t("admin.users.addUserTitle")}</DialogTitle>
            <button
              type="button"
              onClick={handleAddUserClose}
              className="text-muted-foreground hover:text-foreground absolute top-4 right-4 rounded-md p-2 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              aria-label={t("common.close", { defaultValue: "Close" })}
            >
              <X className="h-5 w-5" />
            </button>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="space-y-1.5 px-6 pt-6">
              <Label htmlFor="new-user-role">{t("admin.users.role")}</Label>
              <select
                id="new-user-role"
                value={newUserRole}
                onChange={(e) => setNewUserRole(e.target.value as "admin" | "user")}
                className="border-input bg-background focus-visible:ring-primary h-10 w-full rounded-md border border-gray-300 px-3 text-sm focus-visible:ring-2 focus-visible:outline-none"
              >
                <option value="admin">{t("admin.users.roleAdmin")}</option>
                <option value="user">{t("admin.users.formRoleUser")}</option>
              </select>
            </div>

            {newUserRole === "admin" && (
              <form className="space-y-5 px-6 pt-4 pb-6" onSubmit={handleAdminSubmit}>
                <div className="space-y-1.5">
                  <Label htmlFor="new-user-name">{t("admin.users.formFullName")}</Label>
                  <Input
                    id="new-user-name"
                    placeholder={t("admin.users.formFullNamePlaceholder")}
                    value={addUserForm.fullName}
                    onChange={(e) => setAddUserForm((f) => ({ ...f, fullName: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="new-user-email">{t("admin.users.formEmail")}</Label>
                  <Input
                    id="new-user-email"
                    type="email"
                    placeholder={t("admin.users.formEmailPlaceholder")}
                    value={addUserForm.email}
                    onChange={(e) => setAddUserForm((f) => ({ ...f, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="new-user-password">{t("admin.users.formPassword")}</Label>
                  <div className="relative">
                    <Input
                      id="new-user-password"
                      type={showPassword ? "text" : "password"}
                      placeholder={t("admin.users.formPasswordPlaceholder")}
                      value={addUserForm.password}
                      onChange={(e) => setAddUserForm((f) => ({ ...f, password: e.target.value }))}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2"
                      onClick={() => setShowPassword((v) => !v)}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="new-user-confirm-password">
                    {t("admin.users.formConfirmPassword")}
                  </Label>
                  <div className="relative">
                    <Input
                      id="new-user-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder={t("admin.users.formConfirmPasswordPlaceholder")}
                      value={addUserForm.confirmPassword}
                      onChange={(e) =>
                        setAddUserForm((f) => ({ ...f, confirmPassword: e.target.value }))
                      }
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" size="sm" onClick={handleAddUserClose}>
                    {t("common.cancel")}
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={createAdminUserMutation.isPending}
                  >
                    {createAdminUserMutation.isPending
                      ? t("common.saving")
                      : t("admin.users.formCreate")}
                  </Button>
                </div>
              </form>
            )}

            {newUserRole === "user" && (
              <AddMemberForm
                onSuccess={() => {
                  handleAddUserClose()
                  showToast(t("admin.users.createSuccess"), "success")
                }}
                onCancel={handleAddUserClose}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
