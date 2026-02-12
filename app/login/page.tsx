'use client'

import Header from '../../src/components/layout/Header'
import Footer from '../../src/components/layout/Footer'
import LoginForm from '../../src/components/login/LoginForm'

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <LoginForm />
            <Footer />
        </div>
    )
}
