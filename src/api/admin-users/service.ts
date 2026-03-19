import { api } from "@/lib/api"
import type { AdminListUsersQuery, AdminUserDto, AdminUserRow, AdminUsersResponse } from "./types"

function normalizeRole(role: string | undefined | null): string {
  const r = String(role ?? "")
    .trim()
    .toUpperCase()
  if (!r) return "free"
  if (r === "SUPER_ADMIN" || r === "ADMIN") return "admin"
  if (r === "MEMBER") return "paid"
  return r.toLowerCase()
}

function normalizeStatus(u: AdminUserDto): "active" | "suspended" | string {
  if (typeof u.status === "string" && u.status.trim()) return u.status.trim().toLowerCase()
  if (typeof u.isActive === "boolean") return u.isActive ? "active" : "suspended"
  return "active"
}

function pickLastLogin(u: AdminUserDto): string {
  const v = u.lastLoginAt ?? ""
  return typeof v === "string" && v.trim() ? v : "-"
}

export function toAdminUserRow(u: AdminUserDto): AdminUserRow {
  const companyName = u.companyNameVi ?? u.companyNameCn ?? ""
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
  const q = new URLSearchParams()
  q.set("page", String(query.page ?? 1))
  q.set("limit", String(query.limit ?? 50))
  q.set("sortBy", query.sortBy ?? "createdAt")
  q.set("sortOrder", query.sortOrder ?? "desc")
  const qs = q.toString()
  return qs ? `?${qs}` : ""
}

/**
 * Real admin-only endpoint.
 * Backend path: GET /api/v1/admin/users?page=...&limit=...&sortBy=...&sortOrder=...
 */
export async function listAdminUsers(query: AdminListUsersQuery = {}): Promise<AdminUsersResponse> {
  const qs = buildQuery(query)
  return api.request<AdminUsersResponse>(`/admin/users${qs}`, { method: "GET" })
}

export async function listAdminUserRows(
  query: AdminListUsersQuery = {}
): Promise<{ rows: AdminUserRow[]; pagination?: AdminUsersResponse["pagination"] }> {
  const res = await listAdminUsers(query)
  return { rows: (res.users ?? []).map(toAdminUserRow), pagination: res.pagination }
}
