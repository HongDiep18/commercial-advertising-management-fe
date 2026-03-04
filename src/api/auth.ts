import { api } from "@/lib/api"
import type { LoginPayload, LoginResponse, RegisterPayload, RegisterResponse } from "@/types/auth"

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  return api.request<LoginResponse>("/api/v1/auth/login", {
    method: "POST",
    body: payload,
  })
}

export async function register(payload: RegisterPayload): Promise<RegisterResponse> {
  return api.request<RegisterResponse>("/api/v1/auth/register", {
    method: "POST",
    body: payload,
  })
}
