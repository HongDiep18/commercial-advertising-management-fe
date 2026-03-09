"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, Eye, EyeOff } from "lucide-react"
import { useTranslation } from "react-i18next"
import Card from "../ui/Card"
import Input from "../ui/Input"
import Label from "../ui/Label"
import Button from "../ui/Button"
import { Toast, type ToastVariant } from "../ui/Toast"
import { login as loginApi } from "@/api/auth"
import { useUser, UserRole } from "@/contexts/user-context"
import { DemoLoginButtons, DEMO_USERS, DEMO_ACCOUNTS } from "./demo"
import {
  type LoginResponse,
  isLoginSuccess,
  getLoginErrorMessage,
  extractUserFromLoginResponse,
  mapApiUserToUser,
} from "@/types/login"
import { LOGIN_TAGS, LOGIN_TAG_FALLBACKS } from "./LoginMessages"
import { INITIAL_LOGIN_FORM, type LoginFormData } from "./loginConstants"

function getErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "data" in err) {
    const data = (err as { data?: { message?: string } }).data
    if (data && typeof data.message === "string") return data.message
  }
  return ""
}

export default function LoginForm() {
  const { t } = useTranslation()
  const router = useRouter()
  const { setUser } = useUser()
  const [formData, setFormData] = useState<LoginFormData>(INITIAL_LOGIN_FORM)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; variant: ToastVariant; visible: boolean }>({
    message: "",
    variant: "info",
    visible: false,
  })

  const showToast = (message: string, variant: ToastVariant = "info") =>
    setToast({ message, variant, visible: true })
  const hideToast = () => setToast((prev) => ({ ...prev, visible: false }))

  const doLogin = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const demoAccount = DEMO_ACCOUNTS.find((a) => a.email === email && a.password === password)
      if (demoAccount) {
        const demoUser = DEMO_USERS[demoAccount.tier]
        if (demoUser) {
          setUser(demoUser)
          showToast(t(LOGIN_TAGS.success) || LOGIN_TAG_FALLBACKS.success, "success")
          setFormData({ ...INITIAL_LOGIN_FORM })
          setTimeout(() => {
            router.push(demoAccount.tier === UserRole.Admin ? "/admin/demo" : "/account")
          }, 500)
          return
        }
      }

      const res = await loginApi({ email, password })
      const resTyped: LoginResponse = res

      if (!isLoginSuccess(resTyped)) {
        const msg =
          getLoginErrorMessage(resTyped) || t(LOGIN_TAGS.failed) || LOGIN_TAG_FALLBACKS.failed
        showToast(msg, "error")
        return
      }

      const payload = extractUserFromLoginResponse(resTyped, email)
      let role: string | undefined
      if (payload) {
        setUser(mapApiUserToUser(payload, email))
        role = payload.role
      } else {
        setUser({
          id: `api-${Date.now()}`,
          email,
          name: email.split("@")[0] ?? "User",
          role: UserRole.Free,
          contributionPoints: 0,
          commercialPoints: 0,
          createdAt: new Date().toISOString().slice(0, 10),
        })
      }

      showToast(t(LOGIN_TAGS.success) || LOGIN_TAG_FALLBACKS.success, "success")
      setFormData({ ...INITIAL_LOGIN_FORM })
      setTimeout(() => {
        router.push(role === UserRole.Admin ? "/account" : "/account")
      }, 1000)
    } catch (err) {
      const msg = getErrorMessage(err) || t(LOGIN_TAGS.failed) || LOGIN_TAG_FALLBACKS.failed
      showToast(msg, "error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await doLogin(formData.email, formData.password)
  }

  return (
    <main className="from-muted/30 via-background to-muted/50 flex min-h-screen items-center bg-gradient-to-br pt-14">
      <div className="container mx-auto flex items-center justify-center px-4 py-12">
        <div className="mx-auto w-full max-w-md">
          <Card className="border-border/50 shadow-lg">
            <Card.Header className="space-y-1 pb-4">
              <Card.Title className="text-center text-2xl">
                {t("login.title") || "登入帳號"}
              </Card.Title>
            </Card.Header>
            <Card.Content className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t("login.email") || "電子郵件"}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("login.placeholders.email") || "your@email.com"}
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">{t("login.password") || "密碼"}</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={t("login.placeholders.password") || "••••••••"}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, password: e.target.value }))
                      }
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="text-muted-foreground hover:text-foreground focus:ring-primary/30 absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 focus:ring-2 focus:outline-none"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button variant="primary" type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? t("login.processing") || "登入中..." : t("login.submit") || "登入"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>

              <DemoLoginButtons disabled={isLoading} />

              <div className="text-muted-foreground text-center text-sm">
                {t("login.noAccount") || "還沒有帳號？"}{" "}
                <Link href="/register" className="text-primary font-medium hover:underline">
                  {t("login.registerLink") || "免費註冊"}
                </Link>
              </div>
            </Card.Content>
          </Card>

          <p className="text-muted-foreground mt-4 text-center text-xs">
            {t("login.terms.text") || "登入即表示您同意我們的"}{" "}
            <Link href="/terms" className="hover:text-foreground underline">
              {t("login.terms.service") || "服務條款"}
            </Link>{" "}
            {t("login.terms.and") || "和"}{" "}
            <Link href="/privacy" className="hover:text-foreground underline">
              {t("login.terms.privacy") || "隱私政策"}
            </Link>
          </p>
        </div>
      </div>

      <Toast
        message={toast.message}
        variant={toast.variant}
        visible={toast.visible}
        onClose={hideToast}
        duration={3500}
      />
    </main>
  )
}
