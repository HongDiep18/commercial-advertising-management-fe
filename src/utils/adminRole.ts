import { UserRole } from "@/types/user"

export function isAdminRole(role: UserRole | undefined | null): boolean {
  return role === UserRole.Admin || role === UserRole.SuperAdmin
}
