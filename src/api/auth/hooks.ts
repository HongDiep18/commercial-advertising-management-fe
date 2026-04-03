import { register } from "@/api/auth"
import type { RegisterPayload, RegisterResponse } from "@/types/auth"
import { useMutation } from "@tanstack/react-query"

export const authKeys = {
  all: ["auth"] as const,
}

export function useRegisterMutation() {
  return useMutation<RegisterResponse, Error & { status?: number; data?: unknown }, RegisterPayload>({
    mutationFn: (payload) => register(payload),
  })
}
