'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Textarea from '../ui/Textarea'
import Button from '../ui/Button'

interface FormData {
    companyNameVi: string
    companyNameCn: string
    phone: string
    taxId: string
    contactPerson: string
    contactPhone: string
    companyAddress: string
    email: string
    country: string
    region: string
    industry: string
    website: string
    introduction: string
}

export default function RegisterForm() {
    const { t } = useTranslation()
    const [formData, setFormData] = useState<FormData>({
        companyNameVi: '',
        companyNameCn: '',
        phone: '',
        taxId: '',
        contactPerson: '',
        contactPhone: '',
        companyAddress: '',
        email: '',
        country: '',
        region: '',
        industry: '',
        website: '',
        introduction: '',
    })
    const [captchaInput, setCaptchaInput] = useState('')
    const [captchaCode, setCaptchaCode] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const generateCaptcha = (): string => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
        let code = ''
        for (let i = 0; i < 5; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return code
    }

    const drawCaptcha = (text: string) => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        ctx.fillStyle = '#f3f4f6'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        for (let i = 0; i < 5; i++) {
            ctx.strokeStyle = `rgba(${Math.random() * 100}, ${Math.random() * 100}, ${Math.random() * 100}, 0.3)`
            ctx.beginPath()
            ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height)
            ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height)
            ctx.stroke()
        }

        for (let i = 0; i < 50; i++) {
            ctx.fillStyle = `rgba(${Math.random() * 150}, ${Math.random() * 150}, ${Math.random() * 150}, 0.5)`
            ctx.beginPath()
            ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1, 0, Math.PI * 2)
            ctx.fill()
        }

        ctx.font = 'bold 28px Arial'
        ctx.fillStyle = '#333'
        ctx.textBaseline = 'middle'

        for (let i = 0; i < text.length; i++) {
            const x = 15 + i * 22
            const y = canvas.height / 2 + (Math.random() - 0.5) * 10
            const rotation = (Math.random() - 0.5) * 0.4

            ctx.save()
            ctx.translate(x, y)
            ctx.rotate(rotation)
            ctx.fillText(text[i], 0, 0)
            ctx.restore()
        }
    }

    const refreshCaptcha = () => {
        const newCaptcha = generateCaptcha()
        setCaptchaCode(newCaptcha)
        setCaptchaInput('')
        setTimeout(() => drawCaptcha(newCaptcha), 0)
    }

    const countries = [
        { value: 'vietnam', label: t('register.countries.vietnam') || '越南' },
        { value: 'taiwan', label: t('register.countries.taiwan') || '台灣' },
        { value: 'china', label: t('register.countries.china') || '中國' },
        { value: 'singapore', label: t('register.countries.singapore') || '新加坡' },
        { value: 'other', label: t('register.countries.other') || '其他' },
    ]

    const regions: Record<string, Array<{ value: string; label: string }>> = {
        vietnam: [
            { value: 'hcm', label: t('register.regions.hcm') || '胡志明市' },
            { value: 'hanoi', label: t('register.regions.hanoi') || '河內' },
            { value: 'binhduong', label: t('register.regions.binhduong') || '平陽' },
            { value: 'dongnai', label: t('register.regions.dongnai') || '同奈' },
            { value: 'danang', label: t('register.regions.danang') || '峴港' },
            { value: 'haiphong', label: t('register.regions.haiphong') || '海防' },
        ],
        taiwan: [
            { value: 'taipei', label: t('register.regions.taipei') || '台北' },
            { value: 'taichung', label: t('register.regions.taichung') || '台中' },
            { value: 'kaohsiung', label: t('register.regions.kaohsiung') || '高雄' },
        ],
        china: [
            { value: 'beijing', label: t('register.regions.beijing') || '北京' },
            { value: 'shanghai', label: t('register.regions.shanghai') || '上海' },
            { value: 'guangzhou', label: t('register.regions.guangzhou') || '廣州' },
        ],
        singapore: [{ value: 'singapore', label: t('register.regions.singapore') || '新加坡' }],
        other: [{ value: 'other', label: t('register.regions.other') || '其他' }],
    }

    const availableRegions = formData.country ? regions[formData.country] || [] : []

    const categories = [
        { id: 'semi', name: t('search.categories.semi') },
        { id: 'elec', name: t('search.categories.elec') },
        { id: 'textile', name: t('search.categories.textile') },
        { id: 'food', name: t('search.categories.food') },
        { id: 'machine', name: t('search.categories.machine') },
        { id: 'plastic', name: t('search.categories.plastic') },
    ]

    useEffect(() => {
        refreshCaptcha()
    }, [])

    const handleInputChange = (field: keyof FormData, value: string) => {
        if (field === 'country') {
            setFormData((prev) => ({ ...prev, [field]: value, region: '' }))
        } else {
            setFormData((prev) => ({ ...prev, [field]: value }))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (captchaInput.toUpperCase() !== captchaCode) {
            alert(t('register.errors.captcha') || '驗證碼錯誤，請重新輸入')
            refreshCaptcha()
            return
        }

        setIsLoading(true)
        try {
            console.log('Form submitted:', formData)
            await new Promise((resolve) => setTimeout(resolve, 2000))
            alert(t('register.success') || '註冊成功！')
            setFormData({
                companyNameVi: '',
                companyNameCn: '',
                phone: '',
                taxId: '',
                contactPerson: '',
                contactPhone: '',
                companyAddress: '',
                email: '',
                country: '',
                region: '',
                industry: '',
                website: '',
                introduction: '',
            })
            refreshCaptcha()
        } catch (error) {
            alert(t('register.errors.submit') || '註冊失敗，請稍後再試')
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="pt-14 bg-body-bg-dark">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <Link
                    href="/"
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    {t('register.backToHome') || '返回首頁'}
                </Link>

                <div className="bg-body-bg-light border border-gray-300 rounded-lg p-6 md:p-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-primary text-center mb-8">
                        {t('register.title') || '會員註冊'}
                    </h1>

                    <form onSubmit={handleSubmit} className="space-y-4 registration-form">
                        <div className="space-y-4 ">
                            <div className="grid md:grid-cols-2 gap-4 ">
                                <div>
                                    <Input
                                        placeholder={t('register.placeholders.companyNameVi') || '公司名稱（越文）'}
                                        value={formData.companyNameVi}
                                        onChange={(e) => handleInputChange('companyNameVi', e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <Input
                                        placeholder={t('register.placeholders.companyNameCn') || '公司名稱（中文）'}
                                        value={formData.companyNameCn}
                                        onChange={(e) => handleInputChange('companyNameCn', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Input
                                        placeholder={t('register.placeholders.phone') || '電話'}
                                        value={formData.phone}
                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <Input
                                        placeholder={t('register.placeholders.taxId') || '稅號'}
                                        value={formData.taxId}
                                        onChange={(e) => handleInputChange('taxId', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Input
                                        placeholder={t('register.placeholders.contactPerson') || '聯絡人'}
                                        value={formData.contactPerson}
                                        onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <Input
                                        placeholder={t('register.placeholders.contactPhone') || '聯絡人電話號碼'}
                                        value={formData.contactPhone}
                                        onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Input
                                        placeholder={t('register.placeholders.companyAddress') || '公司地址'}
                                        value={formData.companyAddress}
                                        onChange={(e) => handleInputChange('companyAddress', e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <Input
                                        type="email"
                                        placeholder={t('register.placeholders.email') || '電子郵件'}
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 registration-form ">
                                <Select
                                    value={formData.country}
                                    onValueChange={(value) => handleInputChange('country', value)}
                                    required
                                >
                                    <Select.Trigger className="w-full ">
                                        <Select.Value placeholder={t('register.placeholders.country') || '選擇國家 *'} />
                                    </Select.Trigger>
                                    <Select.Content>
                                        {countries.map((country) => (
                                            <Select.Item key={country.value} value={country.value}>
                                                {country.label}
                                            </Select.Item>
                                        ))}
                                    </Select.Content>
                                </Select>
                                <Select
                                    value={formData.region}
                                    onValueChange={(value) => handleInputChange('region', value)}
                                    disabled={!formData.country}
                                    required
                                >
                                    <Select.Trigger className="w-full">
                                        <Select.Value
                                            placeholder={
                                                !formData.country
                                                    ? (t('register.placeholders.selectCountryFirst') || '請先選擇國家')
                                                    : (t('register.placeholders.region') || '選擇地區 *')
                                            }
                                        />
                                    </Select.Trigger>
                                    <Select.Content>
                                        {availableRegions.length > 0 ? (
                                            availableRegions.map((region) => (
                                                <Select.Item key={region.value} value={region.value}>
                                                    {region.label}
                                                </Select.Item>
                                            ))
                                        ) : (
                                            <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                                {t('register.noRegions') || '無可用地區'}
                                            </div>
                                        )}
                                    </Select.Content>
                                </Select>
                                <Select
                                    value={formData.industry}
                                    onValueChange={(value) => handleInputChange('industry', value)}
                                    required
                                >
                                    <Select.Trigger className="w-full">
                                        <Select.Value placeholder={t('register.placeholders.industry') || '選擇產業類別 *'} />
                                    </Select.Trigger>
                                    <Select.Content>
                                        {categories.map((category) => (
                                            <Select.Item key={category.id} value={category.id}>
                                                {category.name}
                                            </Select.Item>
                                        ))}
                                    </Select.Content>
                                </Select>
                            </div>

                            <div>
                                <Input
                                    placeholder={t('register.placeholders.website') || '網站 *'}
                                    value={formData.website}
                                    onChange={(e) => handleInputChange('website', e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <Textarea
                                    placeholder={t('register.placeholders.introduction') || '簡單介紹 *'}
                                    value={formData.introduction}
                                    onChange={(e) => handleInputChange('introduction', e.target.value)}
                                    rows={4}
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex justify-center items-center gap-4 pt-4">
                            <Input
                                placeholder={t('register.placeholders.captcha') || '請輸入驗證碼'}
                                value={captchaInput}
                                onChange={(e) => setCaptchaInput(e.target.value)}
                                required
                                className="w-[20%]"
                            />
                            <canvas
                                ref={canvasRef}
                                width={150}
                                height={45}
                                className="border border-border rounded cursor-pointer"
                                onClick={refreshCaptcha}
                                title={t('register.captchaRefresh') || '點擊刷新驗證碼'}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={refreshCaptcha}
                                className="h-9 w-9"
                                title={t('register.captchaRefresh') || '刷新驗證碼'}
                            >
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="flex justify-center pt-6">
                            <Button
                                type="submit" variant="primary"
                                className="w-full max-w-md bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6"
                                disabled={isLoading}
                            >
                                {isLoading ? t('register.processing') || '處理中...' : t('register.submit') || '會員註冊'}
                            </Button>
                        </div>

                        <div className="text-center text-sm text-muted-foreground pt-2">
                            {t('register.hasAccount') || '已經有帳號？'}{' '}
                            <Link href="/login" className="text-primary hover:underline font-medium">
                                {t('register.loginLink') || '立即登入'}
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
