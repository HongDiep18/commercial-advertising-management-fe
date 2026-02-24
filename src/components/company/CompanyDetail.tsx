'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Button from '../ui/Button'
import Card, { CardContent } from '../ui/Card'
import {
    MapPin,
    Phone,
    Mail,
    Globe,
    User,
    Building2,
    Heart,
    Share2,
    ArrowLeft,
    Copy,
    Check,
    ExternalLink,
    Lock,
    Crown,
    FileText,
} from 'lucide-react'
import { useUser, MEMBERSHIP_THRESHOLDS } from '../../contexts/user-context'
import { useTranslation } from 'react-i18next'
import { getCompanyData } from '../../data/mockCompanies'
import { maskCompanyName, truncateIntroduction, maskIntroductionCompanyNames, categoryNameToIdMap } from '../../utils/companyHelpers'

interface CompanyDetailProps {
    companyId: string
}

export default function CompanyDetail({ companyId }: CompanyDetailProps) {
    const searchParams = useSearchParams()
    const fromCategory = searchParams.get('fromCategory')
    const { t, i18n } = useTranslation()
    const { user, isLoggedIn, getTotalPoints } = useUser()
    const [isFavorite, setIsFavorite] = useState(false)
    const [copiedEmail, setCopiedEmail] = useState(false)
    const [copiedPhone, setCopiedPhone] = useState(false)

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [companyId])

    const company = getCompanyData(companyId)
    
    const companyNameCn = t(`companyDetail.companies.${companyId}.nameCn`, { defaultValue: company.nameCn })
    const companyNameEn = t(`companyDetail.companies.${companyId}.nameEn`, { defaultValue: company.nameEn })
    const companyNameVn = company.nameVn ? t(`companyDetail.companies.${companyId}.nameVn`, { defaultValue: company.nameVn }) : undefined

    const categoryId = categoryNameToIdMap[company.category] || ''
    const translatedCategory = categoryId ? t(`directory.categories.${categoryId}`) : company.category

    const totalPoints = getTotalPoints()

    const isGuest = !isLoggedIn || !user || totalPoints < MEMBERSHIP_THRESHOLDS.bronze
    const isBronze = isLoggedIn && user && totalPoints >= MEMBERSHIP_THRESHOLDS.bronze && totalPoints < MEMBERSHIP_THRESHOLDS.silver
    const isSilverOrAbove = isLoggedIn && user && (totalPoints >= MEMBERSHIP_THRESHOLDS.silver || user.role === 'admin')

    const isFreeUser = !isSilverOrAbove

    const handleCopyEmail = async () => {
        await navigator.clipboard.writeText(company.email)
        setCopiedEmail(true)
        setTimeout(() => setCopiedEmail(false), 2000)
    }

    const handleCopyPhone = async () => {
        await navigator.clipboard.writeText(company.phone)
        setCopiedPhone(true)
        setTimeout(() => setCopiedPhone(false), 2000)
    }

    const handleShare = async () => {
        if (navigator.share) {
            await navigator.share({
                title: companyNameCn,
                text: `查看 ${companyNameCn} 的企業資訊`,
                url: window.location.href,
            })
        } else {
            await navigator.clipboard.writeText(window.location.href)
        }
    }

    return (
        <div className="bg-body-bg-dark ">
            {/* Upgrade Banner */}
            {(isGuest || isBronze) && (
                <div className="sticky top-14 z-40 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                        <div className="flex items-center justify-center gap-4 flex-wrap">
                            <div className="flex items-center gap-2">
                                <Lock className="w-5 h-5" />
                                <span className="font-medium">
                                    {isGuest
                                        ? t('companyDetail.upgradeBanner.guest') || '您目前為訪客，僅可查看部分公司名稱與地區'
                                        : t('companyDetail.upgradeBanner.bronze') || '您目前為銅牌會員，升級可查看官網、電話、地址等完整資訊'}
                                </span>
                            </div>
                            <Button size="sm" className="bg-white !text-amber-600 hover:bg-white/90 font-semibold" asChild>
                                <Link href={isGuest ? '/register' : '/account'}>
                                    <Crown className="w-4 h-4 mr-2" />
                                    {isGuest ? t('companyDetail.upgradeBanner.register') || '註冊成為會員' : t('companyDetail.upgradeBanner.upgrade') || '升級解鎖完整資訊'}
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Breadcrumb */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <Link
                    href={fromCategory ? `/directory?category=${encodeURIComponent(fromCategory)}` : '/directory'}
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t('companyDetail.breadcrumb') || '返回企業名錄'}
                </Link>
            </div>

{/* 123 */}
            {/* Main Company Info Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                <Card className="bg-card border-border/50 overflow-hidden">
                    <CardContent className="p-0">
                        <div className="bg-body-bg-light flex flex-col lg:flex-row">
                            {/* Left - Company Logo */}
                            <div className="bg-body-bg-dark lg:w-1/3 lg:p-8 flex items-center justify-center bg-muted/30">
                                <div className="relative w-full max-w-[280px] aspect-square rounded-lg overflow-hidden border border-border/50 bg-white">
                                    <Image
                                        src={company.logo || '/placeholder.svg'}
                                        alt={companyNameCn}
                                        fill
                                        className={`object-contain p-4 ${isGuest ? 'blur-sm' : ''}`}
                                    />
                                </div>
                            </div>

                            {/* Right - Company Info */}
                            <div className="lg:w-2/3 lg:p-8">
                                {/* Company Names */}
                                <div className="mb-6">
                                    <h1 key={i18n.language} className="text-3xl font-bold text-foreground mb-2">
                                        {isGuest ? maskCompanyName(companyNameCn) : companyNameCn}
                                    </h1>
                                    <p key={`${i18n.language}-en`} className="text-lg text-muted-foreground mb-1">
                                        {isGuest ? maskCompanyName(companyNameEn) : companyNameEn}
                                    </p>
                                    {companyNameVn && (
                                        <p key={`${i18n.language}-vn`} className="text-base text-muted-foreground">
                                            {isGuest ? maskCompanyName(companyNameVn) : companyNameVn}
                                        </p>
                                    )}
                                </div>

                                {/* Category Tags */}
                                <div className="flex flex-wrap gap-2 mb-6">
                                    <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                                        {translatedCategory}
                                    </span>
                                    {company.categoryTags.map((tag) => {
                                        const translatedTag = t(`directory.categoryTags.${tag}`, { defaultValue: tag })
                                        return (
                                            <span key={tag} className="px-3 py-1 bg-muted text-muted-foreground text-sm rounded-full">
                                                {translatedTag}
                                            </span>
                                        )
                                    })}
                                </div>

                                {/* Info Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                    {/* Address */}
                                    <div className="flex items-start gap-3">
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isFreeUser ? 'bg-muted' : 'bg-primary/10'}`}
                                        >
                                            {isFreeUser ? <Lock className="w-5 h-5 text-muted-foreground" /> : <MapPin className="w-5 h-5 text-primary" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-muted-foreground">{t('companyDetail.address') || '地址'}</p>
                                            <p
                                                className={`text-sm font-medium ${isFreeUser ? 'text-muted-foreground/40 blur-[3px] select-none' : ''}`}
                                            >
                                                {company.address}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div className="flex items-start gap-3">
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isFreeUser ? 'bg-muted' : 'bg-primary/10'}`}
                                        >
                                            {isFreeUser ? <Lock className="w-5 h-5 text-muted-foreground" /> : <Phone className="w-5 h-5 text-primary" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-muted-foreground">{t('companyDetail.phone') || '電話'}</p>
                                            {isFreeUser ? (
                                                <p className="text-sm font-medium text-muted-foreground/40 blur-[3px] select-none">{company.phone}</p>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-medium">{company.phone}</p>
                                                    <button onClick={handleCopyPhone} className="text-muted-foreground hover:text-primary transition-colors">
                                                        {copiedPhone ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="flex items-start gap-3">
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isFreeUser ? 'bg-muted' : 'bg-primary/10'}`}
                                        >
                                            {isFreeUser ? <Lock className="w-5 h-5 text-muted-foreground" /> : <Mail className="w-5 h-5 text-primary" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-muted-foreground">Email</p>
                                            {isFreeUser ? (
                                                <p className="text-sm font-medium text-muted-foreground/40 blur-[3px] select-none">{company.email}</p>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-medium">{company.email}</p>
                                                    <button onClick={handleCopyEmail} className="text-muted-foreground hover:text-primary transition-colors">
                                                        {copiedEmail ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Website */}
                                    {company.website && (
                                        <div className="flex items-start gap-3">
                                            <div
                                                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isFreeUser ? 'bg-muted' : 'bg-primary/10'}`}
                                            >
                                                {isFreeUser ? <Lock className="w-5 h-5 text-muted-foreground" /> : <Globe className="w-5 h-5 text-primary" />}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm text-muted-foreground">{t('companyDetail.website') || '官網'}</p>
                                                {isFreeUser ? (
                                                    <p className="text-sm font-medium text-muted-foreground/40 blur-[3px] select-none">{company.website}</p>
                                                ) : (
                                                    <a
                                                        href={`https://${company.website}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
                                                    >
                                                        {company.website}
                                                        <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Contact Person */}
                                    <div className="flex items-start gap-3">
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isFreeUser ? 'bg-muted' : 'bg-primary/10'}`}
                                        >
                                            {isFreeUser ? <Lock className="w-5 h-5 text-muted-foreground" /> : <User className="w-5 h-5 text-primary" />}
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">{t('companyDetail.contactPerson') || '聯絡人'}</p>
                                            <p className={`text-sm font-medium ${isFreeUser ? 'text-muted-foreground/40 blur-[3px] select-none' : ''}`}>
                                                {company.contactPerson}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Region */}
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <Building2 className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">{t('companyDetail.region') || '地區'}</p>
                                            <p className="text-sm font-medium">{t(`companyDetail.regions.${company.region}`, { defaultValue: company.region })}</p>
                                        </div>
                                    </div>

                                    {/* Tax ID */}
                                    {company.taxId && (
                                        <div className="flex items-start gap-3">
                                            <div
                                                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isSilverOrAbove ? 'bg-primary/10' : 'bg-muted'}`}
                                            >
                                                {isSilverOrAbove ? <FileText className="w-5 h-5 text-primary" /> : <Lock className="w-5 h-5 text-muted-foreground" />}
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">{t('companyDetail.taxId') || '稅號'}</p>
                                                <p className={`text-sm font-medium ${!isSilverOrAbove ? 'text-muted-foreground/40 blur-[3px] select-none' : ''}`}>
                                                    {company.taxId}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* CTA Buttons */}
                                {!isFreeUser && (
                                    <div className="flex flex-wrap gap-3">
                                        <Button variant="primary" asChild>
                                            <a href={`mailto:${company.email}`}>
                                                <Mail className="w-4 h-4 mr-2" />
                                                {t('companyDetail.contactCompany') || '聯絡公司'}
                                            </a>
                                        </Button>
                                        <Button variant="outline" onClick={() => setIsFavorite(!isFavorite)} className={isFavorite ? 'border-primary text-primary' : ''}>
                                            <Heart className={`w-4 h-4 mr-2 ${isFavorite ? 'fill-primary' : ''}`} />
                                            {isFavorite ? t('companyDetail.favorited') || '已收藏' : t('companyDetail.addToFavorites') || '加入收藏'}
                                        </Button>
                                        <Button variant="outline" onClick={handleShare}>
                                            <Share2 className="w-4 h-4 mr-2" />
                                            {t('companyDetail.share') || '分享'}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </section>


            {/* Company Introduction Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                <Card className="bg-card border-border/50 relative overflow-hidden">
                    <CardContent className="bg-body-bg-light p-6 lg:p-8">
                        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                            <div className="w-1 h-6 bg-primary rounded-full" />
                            {t('companyDetail.introduction') || '公司簡介'}
                        </h2>

                        {(() => {
                            const translatedIntroduction = t(`companyDetail.introductions.${companyId}`, { 
                                defaultValue: company.introduction 
                            })
                            
                            return isSilverOrAbove ? (
                                <div className="text-muted-foreground leading-relaxed whitespace-pre-line">{translatedIntroduction}</div>
                            ) : (
                                <div className="relative">
                                    <div className="text-muted-foreground leading-relaxed">
                                        {isGuest
                                            ? maskIntroductionCompanyNames(truncateIntroduction(translatedIntroduction, 50), companyNameCn)
                                            : truncateIntroduction(translatedIntroduction, 50)}
                                    </div>
                                    <div className="mt-4 relative">
                                        <div className="text-muted-foreground leading-relaxed whitespace-pre-line blur-[4px] select-none opacity-50">
                                            {translatedIntroduction.substring(50, 200)}...
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background" />
                                    </div>
                                </div>
                            )
                        })()}
                    </CardContent>
                </Card>
            </section>

            {/* Products Section */}
            {company.products && company.products.length > 0 && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                    <Card className="bg-card border-border/50">
                        <CardContent className="p-6 lg:p-8">
                            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                                <div className="w-1 h-6 bg-primary rounded-full" />
                                {t('companyDetail.productsLabel') || '產品'}
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {company.products.map((product, index) => {
                                    const translatedProduct = t(`companyDetail.products.${product}`, { defaultValue: product })
                                    return (
                                        <span key={index} className="px-3 py-1 bg-muted text-muted-foreground text-sm rounded-full">
                                            {translatedProduct}
                                        </span>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </section>
            )}

            {/* Services Section */}
            {company.services && company.services.length > 0 && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                    <Card className="bg-card border-border/50">
                        <CardContent className="p-6 lg:p-8">
                            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                                <div className="w-1 h-6 bg-primary rounded-full" />
                                {t('companyDetail.servicesLabel') || '服務'}
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {company.services.map((service, index) => {
                                    const translatedService = t(`companyDetail.services.${service}`, { defaultValue: service })
                                    return (
                                        <span key={index} className="px-3 py-1 bg-muted text-muted-foreground text-sm rounded-full">
                                            {translatedService}
                                        </span>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </section>
            )}

            {/* Related Companies Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                <Card className="bg-card border-border/50">
                    <CardContent className="bg-body-bg-light p-6 lg:p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                <div className="w-1 h-6 bg-primary rounded-full" />
                                {t('companyDetail.relatedCompanies') || '相關企業'}
                            </h2>
                            <Link
                                href={fromCategory ? `/directory?category=${encodeURIComponent(fromCategory)}` : '/directory'}
                                className="text-sm text-primary hover:underline"
                                onClick={() => window.scrollTo(0, 0)}
                            >
                                {t('companyDetail.viewMore') || '查看更多'}
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {[1, 2, 3, 4, 5, 6].map((i) => {
                                const relatedCompanyName = companyNameCn.replace(/\d+/, String(i + 10))
                                return (
                                    <Link
                                        key={i}
                                        href={`/directory/${companyId.split('-')[0]}-${i + 10}${fromCategory ? `?fromCategory=${encodeURIComponent(fromCategory)}` : ''}`}
                                        className="group"
                                    >
                                        <div className="relative aspect-square rounded-lg overflow-hidden bg-muted mb-2">
                                            <Image
                                                src="/assets/images/companies/product-design-concept.png"
                                                alt={`相關企業 ${i}`}
                                                fill
                                                className={`object-cover group-hover:scale-105 transition-transform duration-300 ${isFreeUser ? 'blur-[3px]' : ''}`}
                                            />
                                        </div>
                                        <p className="text-xs font-medium group-hover:text-primary transition-colors line-clamp-2">
                                            {isFreeUser ? maskCompanyName(relatedCompanyName) : relatedCompanyName}
                                        </p>
                                    </Link>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            </section>
        </div>
    )
}
