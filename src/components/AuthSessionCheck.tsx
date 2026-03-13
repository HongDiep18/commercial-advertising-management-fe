"use client"

import { useAuthSessionCheck } from "@/hooks/useAuthSessionCheck"

export function AuthSessionCheck() {
  useAuthSessionCheck()
  return null
}
