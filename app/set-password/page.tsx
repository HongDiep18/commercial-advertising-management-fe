"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useTranslation } from "react-i18next"
import { Eye, EyeOff } from "lucide-react"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import Card from "@/components/ui/Card"
import Input from "@/components/ui/Input"
import Label from "@/components/ui/Label"
import Button from "@/components/ui/Button"
import { Toast, type ToastVariant } from "@/components/ui/Toast"
import { setPassword as setPasswordApi } from "@/api/auth"
import {
  validateSetPassword,
  MIN_PASSWORD_LENGTH,
  MAX_PASSWORD_LENGTH,
} from "@/lib/passwordValidation"

function SetPasswordContent() {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")?.trim() ?? ""

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState<{
    message: string
    variant: ToastVariant
    visible: boolean
  }>({ message: "", variant: "info", visible: false })

  const showToast = (message: string, variant: ToastVariant = "info") =>
    setToast({ message, variant, visible: true })
  const hideToast = () => setToast((prev) => ({ ...prev, visible: false }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validation = validateSetPassword(password, confirmPassword)
    if (!validation.valid) {
      showToast(t(validation.errorKey), "error")
      return
    }
    if (!token) {
      showToast(t("setPassword.invalidLink"), "error")
      return
    }
    setIsLoading(true)
    try {
      await setPasswordApi({ token, password: password.trim() })
      showToast(t("setPassword.success"), "success")
      setTimeout(() => router.push("/login"), 1500)
    } catch (err) {
      const msg =
        (err as { message?: string })?.message ||
        t("setPassword.error") ||
        "Failed to set password. The link may have expired."
      showToast(msg, "error")
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <main className="from-muted/30 via-background to-muted/50 flex min-h-screen flex-col bg-gradient-to-br pt-14">
        <Header />
        <div className="container mx-auto flex flex-1 items-center justify-center px-4 py-12">
          <Card className="border-border/50 w-full max-w-md shadow-lg">
            <Card.Header className="space-y-1 pb-4">
              <Card.Title className="text-destructive text-center text-xl">
                {t("setPassword.invalidLink")}
              </Card.Title>
            </Card.Header>
            <Card.Content className="space-y-4">
              <p className="text-muted-foreground text-center text-sm">
                {t("setPassword.invalidLinkHint")}
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/login">{t("setPassword.backToLogin")}</Link>
              </Button>
            </Card.Content>
          </Card>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="from-muted/30 via-background to-muted/50 flex min-h-screen flex-col bg-gradient-to-br pt-14">
      <Header />
      <div className="container mx-auto flex flex-1 items-center justify-center px-4 py-12">
        <div className="mx-auto w-full max-w-md">
          <Card className="border-border/50 shadow-lg">
            <Card.Header className="space-y-1 pb-4">
              <Card.Title className="text-center text-2xl">{t("setPassword.title")}</Card.Title>
              <p className="text-muted-foreground text-center text-sm">
                {t("setPassword.description")}
              </p>
            </Card.Header>
            <Card.Content className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">{t("setPassword.password")}</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder={t("setPassword.placeholders.password", {
                        min: MIN_PASSWORD_LENGTH,
                        max: MAX_PASSWORD_LENGTH,
                      })}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={MIN_PASSWORD_LENGTH}
                      maxLength={MAX_PASSWORD_LENGTH}
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
                  <p className="text-muted-foreground text-xs">{t("setPassword.hint")}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t("setPassword.confirm")}</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder={t("setPassword.placeholders.confirm")}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      maxLength={MAX_PASSWORD_LENGTH}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="text-muted-foreground hover:text-foreground focus:ring-primary/30 absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 focus:ring-2 focus:outline-none"
                      aria-label={
                        showConfirmPassword ? "Hide confirm password" : "Show confirm password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <Button variant="primary" type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? t("setPassword.processing") : t("setPassword.submit")}
                </Button>
              </form>
              <div className="text-muted-foreground text-center text-sm">
                <Link href="/login" className="text-primary font-medium hover:underline">
                  {t("setPassword.backToLogin")}
                </Link>
              </div>
            </Card.Content>
          </Card>
        </div>
      </div>
      <Footer />
      <Toast
        message={toast.message}
        variant={toast.variant}
        visible={toast.visible}
        onClose={hideToast}
        duration={4000}
      />
    </main>
  )
}

export default function SetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen flex-col pt-14">
          <Header />
          <div className="flex flex-1 items-center justify-center">
            <p className="text-muted-foreground" />
          </div>
          <Footer />
        </main>
      }
    >
      <SetPasswordContent />
    </Suspense>
  )
}
