"use client"

import { useEffect } from "react"
import { checkAuthSession, getStoredToken } from "@/api/auth"

const CHECK_INTERVAL_MS = 2 * 60 * 1000

function runCheckIfLoggedIn(): void {
  if (typeof window === "undefined" || !getStoredToken()) return
  checkAuthSession().catch(() => {})
}

export function useAuthSessionCheck(): void {
  useEffect(() => {
    const intervalId = setInterval(runCheckIfLoggedIn, CHECK_INTERVAL_MS)
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") runCheckIfLoggedIn()
    }
    document.addEventListener("visibilitychange", onVisibilityChange)
    return () => {
      clearInterval(intervalId)
      document.removeEventListener("visibilitychange", onVisibilityChange)
    }
  }, [])
}
