"use client"

import { requestPasswordReset } from "@/api/auth"
import Footer from "@/components/layout/Footer"
import Header from "@/components/layout/Header"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import Input from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Toast, type ToastVariant } from "@/components/ui/Toast"
import Link from "next/link"
import { useState } from "react"
import { useTranslation } from "react-i18next"

export default function ForgotPasswordPage() {
  const { t } = useTranslation()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [toast, setToast] = useState<{ message: string; variant: ToastVariant; visible: boolean }>({
    message: "",
    variant: "info",
    visible: false,
  })

  const showToast = (message: string, variant: ToastVariant = "info") =>
    setToast({ message, variant, visible: true })
  const hideToast = () => setToast((prev) => ({ ...prev, visible: false }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setIsLoading(true)
    try {
      await requestPasswordReset(email)
      setSent(true)
    } catch (err) {
      const msg =
        (err as { message?: string })?.message || t("forgotPassword.error", "Request failed")
      showToast(msg, "error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-background min-h-screen">
      <Header />
      <main className="from-muted/30 via-background to-muted/50 flex min-h-screen items-center bg-gradient-to-br pt-14">
        <div className="container mx-auto flex items-center justify-center px-4 py-12">
          <div className="mx-auto w-full max-w-md">
            <Card className="border-border/50 shadow-lg">
              <Card.Header className="space-y-1 pb-4">
                <Card.Title className="text-center text-2xl">
                  {t("forgotPassword.title")}
                </Card.Title>
              </Card.Header>
              <Card.Content className="space-y-6">
                {sent ? (
                  <p className="text-muted-foreground text-center text-sm">
                    {t("forgotPassword.success")}
                  </p>
                ) : (
                  <>
                    <p className="text-muted-foreground text-center text-sm">
                      {t("forgotPassword.description")}
                    </p>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="forgot-email">{t("forgotPassword.email")}</Label>
                        <Input
                          id="forgot-email"
                          type="email"
                          placeholder={t("login.placeholders.email")}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <Button
                        variant="primary"
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? t("forgotPassword.processing") : t("forgotPassword.submit")}
                      </Button>
                    </form>
                  </>
                )}
                <div className="text-center">
                  <Link href="/login" className="text-primary text-sm font-medium hover:underline">
                    {t("forgotPassword.backToLogin")}
                  </Link>
                </div>
              </Card.Content>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
      <Toast
        message={toast.message}
        variant={toast.variant}
        visible={toast.visible}
        onClose={hideToast}
      />
    </div>
  )
}
