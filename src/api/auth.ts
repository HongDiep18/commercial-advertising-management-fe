import { api } from "@/lib/api"
import { AUTH_TOKEN_KEY } from "@/lib/storage-keys"
import type {
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
  SetPasswordPayload,
  SetPasswordResponse,
  UpdateProfilePayload,
  UpdateProfileResponse,
} from "@/types/auth"

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export { clearSessionAndRedirectToLogin } from "@/lib/session"

export async function checkAuthSession(): Promise<void> {
  await api.request<unknown>("/auth/profile", { method: "GET" })
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const data = await api.request<LoginResponse>("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
    localStorage.setItem(AUTH_TOKEN_KEY, token)
  }

  return data
}

export async function register(payload: RegisterPayload): Promise<RegisterResponse> {
  return api.request<RegisterResponse>("/auth/register", {
    method: "POST",
    body: payload,
  })
}

function profilePayloadToFormData(payload: Omit<UpdateProfilePayload, "upload_logo">): FormData {
  const form = new FormData()
  for (const [key, value] of Object.entries(payload)) {
    if (key === "industry" && Array.isArray(value)) {
      for (const id of value) {
        form.append(key, id)
      }
      continue
    }
    if (value !== undefined && value !== null) {
      form.append(key, String(value))
    }
  }
  return form
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<UpdateProfileResponse> {
  return api.request<UpdateProfileResponse>("/auth/update-profile", {
    method: "PATCH",
    body: payload,
  })
}

export async function updateProfileWithLogo(
  payload: Omit<UpdateProfilePayload, "upload_logo">,
  logoFile: File
): Promise<UpdateProfileResponse> {
  const form = profilePayloadToFormData(payload)
  form.append("logo_url", logoFile, logoFile.name)
  return api.request<UpdateProfileResponse>("/auth/update-profile", {
    method: "PATCH",
    body: form,
  })
}

export async function setPassword(payload: SetPasswordPayload): Promise<SetPasswordResponse> {
  return api.request<SetPasswordResponse>("/auth/set-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: { token: payload.token, password: payload.password },
  })
}

export async function requestPasswordReset(email: string): Promise<{ message?: string }> {
  return api.request<{ message?: string }>("/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: { email: email.trim() },
  })
}
