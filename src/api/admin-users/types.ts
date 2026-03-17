export type AdminUserDto = {
  userId: string
  email: string
  contactName?: string | null
  role: string
  isActive?: boolean
  status?: string
  lastLoginAt?: string | null
  companyId?: string | null
  companyNameVi?: string | null
  companyNameCn?: string | null
  deletedAt?: string | null
}

export type AdminUsersResponse = {
  users: AdminUserDto[]
  pagination?: { page: number; limit: number; total: number; totalPages: number }
}

export type AdminListUsersQuery = {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export type AdminUserRow = {
  id: string
  contactName: string
  email: string
  company: string
  role: "admin" | "paid" | "free" | string
  lastLogin: string
  status: "active" | "suspended" | "deleted" | string
}
