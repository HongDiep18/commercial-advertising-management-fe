'use client'

import Header from '../../../src/components/layout/Header'
import Footer from '../../../src/components/layout/Footer'
import CompanyDetail from '../../../src/components/company/CompanyDetail'
import React from 'react'


export default function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = React.use(params)
    const {id} = resolvedParams
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="pt-16">
                <CompanyDetail companyId={id} />
            </main>
            <Footer />
        </div>
    )
}
