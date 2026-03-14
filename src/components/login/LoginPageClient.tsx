"use client"

import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import LoginForm from "@/components/login/LoginForm"

export default function LoginPage() {
  return (
    <div className="bg-background min-h-screen">
      <Header />
      <LoginForm />
      <Footer />
    </div>
  )
}
