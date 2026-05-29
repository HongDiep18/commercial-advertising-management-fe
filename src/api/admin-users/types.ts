export type AdminUserStatus = "active" | "suspended"

/** `admin` = ADMIN + SUPER_ADMIN; `user` = MEMBER + VISITOR. */
export type AdminListUserRoleFilter = "admin" | "user"

export type AdminListUsersSortBy = "createdAt" | "lastLoginAt" | "email" | "companyName" | "status"

export type AdminListUsersSortOrder = "asc" | "desc"

export type AdminUsersPagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type AdminUserDto = {
  userId: string
  email: string
  contactName?: string | null
  role: string
  isActive?: boolean
  status?: AdminUserStatus | string
  lastLoginAt?: string | null
  companyId?: string | null
  companyNameVi?: string | null
  companyNameCn?: string | null
  companyNameZh?: string | null
  deletedAt?: string | null
}

export type AdminUsersResponse = {
  users: AdminUserDto[]
  pagination: AdminUsersPagination
}

export type AdminListUsersQuery = {
  page?: number
  limit?: number
  sortBy?: AdminListUsersSortBy
  sortOrder?: AdminListUsersSortOrder
  search?: string
  status?: AdminUserStatus
  role?: AdminListUserRoleFilter
}

export type AdminUserRow = {
  id: string
  contactName: string
  email: string
  company: string
  role: "admin" | "paid" | "free" | string
  lastLogin: string
  status: AdminUserStatus
}

export const ADMIN_USERS_DEFAULT_PAGE = 1
export const ADMIN_USERS_DEFAULT_LIMIT = 10
export const ADMIN_USERS_MAX_LIMIT = 100
export const ADMIN_USERS_DEFAULT_SORT_BY: AdminListUsersSortBy = "lastLoginAt"
export const ADMIN_USERS_DEFAULT_SORT_ORDER: AdminListUsersSortOrder = "desc"
