import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { createAdminUser, listAdminUserRows } from "./service"
import type { CreateAdminUserPayload } from "./service"
import type { AdminListUsersQuery, AdminUserRow, AdminUsersPagination } from "./types"
import {
  ADMIN_USERS_DEFAULT_LIMIT,
  ADMIN_USERS_DEFAULT_PAGE,
  ADMIN_USERS_DEFAULT_SORT_BY,
  ADMIN_USERS_DEFAULT_SORT_ORDER,
} from "./types"

const adminUsersKeys = {
  all: ["admin", "users"] as const,
  list: (query: AdminListUsersQuery) => [...adminUsersKeys.all, "list", query] as const,
}

export const defaultAdminUsersQuery: AdminListUsersQuery = {
  page: ADMIN_USERS_DEFAULT_PAGE,
  limit: ADMIN_USERS_DEFAULT_LIMIT,
  sortBy: ADMIN_USERS_DEFAULT_SORT_BY,
  sortOrder: ADMIN_USERS_DEFAULT_SORT_ORDER,
}

export type AdminUsersListResult = {
  rows: AdminUserRow[]
  pagination: AdminUsersPagination
}

export function useAdminUsersList(
  enabled: boolean,
  query: AdminListUsersQuery = defaultAdminUsersQuery
) {
  const { t } = useTranslation()
  return useQuery({
    queryKey: adminUsersKeys.list(query),
    queryFn: () => listAdminUserRows(query),
    enabled,
    placeholderData: keepPreviousData,
    meta: { errorMessage: t("error.failedToLoadUsers") },
  })
}

export function useCreateAdminUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateAdminUserPayload) => createAdminUser(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminUsersKeys.all })
    },
  })
}

export function useAdminUsers(
  enabled: boolean,
  query: AdminListUsersQuery = defaultAdminUsersQuery
): {
  data?: AdminUserRow[]
  isLoading: boolean
  isError: boolean
} {
  const { data, isLoading, isError } = useAdminUsersList(enabled, query)
  return { data: data?.rows, isLoading, isError }
}
