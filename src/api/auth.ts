import { api } from "@/lib/api"
import type {
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
  UpdateProfilePayload,
  UpdateProfileResponse,
} from "@/types/auth"

const TOKEN_STORAGE_KEY = "token"

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const data = await api.request<LoginResponse>("/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: payload,
  })

  if ((data as { success?: boolean }).success === false) {
    throw new Error((data as { message?: string }).message || "Login failed")
  }

  const d = data.data as { accessToken?: string; access_token?: string; token?: string } | undefined
  const token =
    d?.accessToken ??
    d?.access_token ??
    d?.token ??
    (data as { accessToken?: string; access_token?: string }).accessToken ??
    (data as { access_token?: string }).access_token ??
    data.token ??
    null
  if (token && typeof window !== "undefined") {
    localStorage.setItem(TOKEN_STORAGE_KEY, token)
  }

  return data
}

export async function register(payload: RegisterPayload): Promise<RegisterResponse> {
  return api.request<RegisterResponse>("/auth/register", {
    method: "POST",
    body: payload,
  })
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<UpdateProfileResponse> {
  return api.request<UpdateProfileResponse>("/auth/update-profile", {
    method: "PATCH",
    body: payload,
  })
}
