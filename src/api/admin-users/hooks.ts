import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import type { AdminListUsersQuery, AdminUserRow } from "./types"
import { listAdminUserRows } from "./service"

const adminUsersKeys = {
  all: ["admin", "users"] as const,
  list: (query: AdminListUsersQuery) => [...adminUsersKeys.all, "list", query] as const,
}

export function useAdminUsers(
  enabled: boolean,
  query: AdminListUsersQuery = { page: 1, limit: 100, sortBy: "createdAt", sortOrder: "desc" }
): {
  data?: AdminUserRow[]
  isLoading: boolean
  isError: boolean
} {
  const { t } = useTranslation()
  const { data, isLoading, isError } = useQuery({
    queryKey: adminUsersKeys.list(query),
    queryFn: async () => {
      const res = await listAdminUserRows(query)
      return res.rows
    },
    enabled,
    meta: { errorMessage: t("error.failedToLoadUsers") },
  })

  return { data, isLoading, isError }
}
