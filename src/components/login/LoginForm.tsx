"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useTranslation } from "react-i18next"
import Card from "../ui/Card"
import Input from "../ui/Input"
import Label from "../ui/Label"
import Button from "../ui/Button"
import { login } from "@/api/auth"
import {
  INITIAL_LOGIN_FORM,
  DEMO_ACCOUNTS,
  DEMO_TITLE_FALLBACKS,
  type LoginFormData,
} from "./loginConstants"

function getErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "data" in err) {
    const data = (err as { data?: { message?: string } }).data
    if (data && typeof data.message === "string") return data.message
  }
  return ""
}

export default function LoginForm() {
  const { t } = useTranslation()
  const [formData, setFormData] = useState<LoginFormData>(INITIAL_LOGIN_FORM)
  const [isLoading, setIsLoading] = useState(false)

  const doLogin = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      await login({ email, password })
      alert(t("login.success") || "登入成功！")
      setFormData({ ...INITIAL_LOGIN_FORM })
    } catch (err) {
      const msg = getErrorMessage(err)
      alert(msg || t("login.errors.failed") || "登入失敗，請檢查您的帳號密碼")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await doLogin(formData.email, formData.password)
  }

  const handleDemoLogin = async (tier: string) => {
    const account = DEMO_ACCOUNTS.find((acc) => acc.tier === tier)
    if (!account) return
    setFormData({ email: account.email, password: account.password })
    await doLogin(account.email, account.password)
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
                  <Input
                    id="password"
                    type="password"
                    placeholder={t("login.placeholders.password") || "••••••••"}
                    value={formData.password}
                    onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </div>
                <Button variant="primary" type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? t("login.processing") || "登入中..." : t("login.submit") || "登入"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>

              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {DEMO_ACCOUNTS.map((account) => (
                  <button
                    key={account.tier}
                    type="button"
                    onClick={() => handleDemoLogin(account.tier)}
                    disabled={isLoading}
                    className="text-muted-foreground/60 hover:text-muted-foreground text-xs underline disabled:opacity-50"
                  >
                    {t(`login.demo.${account.tier}`) ||
                      DEMO_TITLE_FALLBACKS[account.tier] ||
                      account.tier}
                  </button>
                ))}
              </div>

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
    </main>
  )
}
