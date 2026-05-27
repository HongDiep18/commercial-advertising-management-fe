import { api } from "@/lib/api"
import type {
  AdminListUsersQuery,
  AdminUserDto,
  AdminUserRow,
  AdminUsersResponse,
  AdminUserStatus,
} from "./types"
import {
  ADMIN_USERS_DEFAULT_LIMIT,
  ADMIN_USERS_DEFAULT_PAGE,
  ADMIN_USERS_DEFAULT_SORT_BY,
  ADMIN_USERS_DEFAULT_SORT_ORDER,
} from "./types"

function normalizeRole(role: string | undefined | null): string {
  const r = String(role ?? "")
    .trim()
    .toUpperCase()
  if (!r) return "free"
  if (r === "SUPER_ADMIN" || r === "ADMIN") return "admin"
  if (r === "MEMBER") return "paid"
  return r.toLowerCase()
}

function normalizeStatus(u: AdminUserDto): AdminUserStatus {
  if (u.status === "suspended") return "suspended"
  if (u.status === "active") return "active"
  if (typeof u.isActive === "boolean") return u.isActive ? "active" : "suspended"
  return "active"
}

function pickLastLogin(u: AdminUserDto): string {
  const v = u.lastLoginAt ?? ""
  return typeof v === "string" && v.trim() ? v : "-"
}

export function toAdminUserRow(u: AdminUserDto): AdminUserRow {
  const companyName = u.companyNameVi ?? u.companyNameZh ?? u.companyNameCn ?? ""
  const contactName = u.contactName ?? ""

  return {
    id: u.userId,
    contactName: String(contactName || "-"),
    email: String(u.email || "-"),
    company: String(companyName || "-"),
    role: normalizeRole(u.role),
    lastLogin: pickLastLogin(u),
    status: normalizeStatus(u),
  }
}

function buildQuery(query: AdminListUsersQuery): string {
  const params = new URLSearchParams()
  params.set("page", String(query.page ?? ADMIN_USERS_DEFAULT_PAGE))
  params.set("limit", String(query.limit ?? ADMIN_USERS_DEFAULT_LIMIT))
  params.set("sortBy", query.sortBy ?? ADMIN_USERS_DEFAULT_SORT_BY)
  params.set("sortOrder", query.sortOrder ?? ADMIN_USERS_DEFAULT_SORT_ORDER)
  if (query.search?.trim()) params.set("search", query.search.trim())
  if (query.status) params.set("status", query.status)
  if (query.role) params.set("role", query.role)
  return `?${params.toString()}`
}

export async function listAdminUsers(query: AdminListUsersQuery = {}): Promise<AdminUsersResponse> {
  const qs = buildQuery(query)
  return api.request<AdminUsersResponse>(`/admin/users${qs}`, { method: "GET" })
}

export async function listAdminUserRows(query: AdminListUsersQuery = {}): Promise<{
  rows: AdminUserRow[]
  pagination: AdminUsersResponse["pagination"]
}> {
  const res = await listAdminUsers(query)
  return {
    rows: (res.users ?? []).map(toAdminUserRow),
    pagination: res.pagination,
  }
}
