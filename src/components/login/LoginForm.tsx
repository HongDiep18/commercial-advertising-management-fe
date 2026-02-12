'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Card from '../ui/Card'
import Input from '../ui/Input'
import Label from '../ui/Label'
import Button from '../ui/Button'

interface DemoAccount {
    tier: string
    title: string
    email: string
    password: string
}

export default function LoginForm() {
    const { t } = useTranslation()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const demoAccounts: DemoAccount[] = [
        {
            tier: 'bronze',
            title: t('login.demo.bronze') || '銅牌會員',
            email: 'bronze@example.com',
            password: 'demo123',
        },
        {
            tier: 'silver',
            title: t('login.demo.silver') || '銀牌會員',
            email: 'silver@example.com',
            password: 'demo123',
        },
        {
            tier: 'gold',
            title: t('login.demo.gold') || '金牌會員',
            email: 'gold@example.com',
            password: 'demo123',
        },
        {
            tier: 'diamond',
            title: t('login.demo.diamond') || '鑽石會員',
            email: 'diamond@example.com',
            password: 'demo123',
        },
        {
            tier: 'admin',
            title: t('login.demo.admin') || '管理員',
            email: 'admin@example.com',
            password: 'demo123',
        },
    ]

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            console.log('Login attempt:', { email, password })
            await new Promise((resolve) => setTimeout(resolve, 1500))
            alert(t('login.success') || '登入成功！')
        } catch (error) {
            alert(t('login.errors.failed') || '登入失敗，請檢查您的帳號密碼')
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDemoLogin = async (tier: string) => {
        const account = demoAccounts.find((acc) => acc.tier === tier)
        if (!account) return

        setEmail(account.email)
        setPassword(account.password)
        setIsLoading(true)

        try {
            console.log('Demo login:', account)
            await new Promise((resolve) => setTimeout(resolve, 1500))
            alert(t('login.success') || '登入成功！')
        } catch (error) {
            alert(t('login.errors.failed') || '登入失敗，請稍後再試')
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-muted/30 via-background to-muted/50 pt-14 flex items-center">
            <div className="container mx-auto px-4 flex items-center justify-center py-12">
                <div className="w-full max-w-md mx-auto">
                    <Card className="border-border/50 shadow-lg">
                        <Card.Header className="space-y-1 pb-4">
                            <Card.Title className="text-2xl text-center">
                                {t('login.title') || '登入帳號'}
                            </Card.Title>
                        </Card.Header>
                        <Card.Content className="space-y-6">
                            <form onSubmit={handleEmailLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">
                                        {t('login.email') || '電子郵件'}
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder={t('login.placeholders.email') || 'your@email.com'}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">
                                        {t('login.password') || '密碼'}
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder={t('login.placeholders.password') || '••••••••'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <Button variant="primary" type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? t('login.processing') || '登入中...' : t('login.submit') || '登入'}
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </form>

                            <div className="flex flex-wrap justify-center gap-2 pt-2">
                                {demoAccounts.map((account) => (
                                    <button
                                        key={account.tier}
                                        onClick={() => handleDemoLogin(account.tier)}
                                        disabled={isLoading}
                                        className="text-xs text-muted-foreground/60 hover:text-muted-foreground underline disabled:opacity-50"
                                    >
                                        {account.title}
                                    </button>
                                ))}
                            </div>

                            <div className="text-center text-sm text-muted-foreground">
                                {t('login.noAccount') || '還沒有帳號？'}{' '}
                                <Link href="/register" className="text-primary hover:underline font-medium">
                                    {t('login.registerLink') || '免費註冊'}
                                </Link>
                            </div>
                        </Card.Content>
                    </Card>

                    <p className="mt-4 text-center text-xs text-muted-foreground">
                        {t('login.terms.text') || '登入即表示您同意我們的'}{' '}
                        <Link href="/terms" className="underline hover:text-foreground">
                            {t('login.terms.service') || '服務條款'}
                        </Link>
                        {' '}{t('login.terms.and') || '和'}{' '}
                        <Link href="/privacy" className="underline hover:text-foreground">
                            {t('login.terms.privacy') || '隱私政策'}
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    )
}
