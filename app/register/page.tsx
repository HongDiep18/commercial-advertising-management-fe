'use client'

import Header from '../../src/components/layout/Header'
import Footer from '../../src/components/layout/Footer'
import RegisterForm from '../../src/components/register/RegisterForm'

export default function RegisterPage() {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <RegisterForm />
            <Footer />
        </div>
    )
}
