"use client"

import Header from "../../src/components/layout/Header"
import Footer from "../../src/components/layout/Footer"
import LoginForm from "../../src/components/login/LoginForm"

export default function LoginPage() {
  return (
    <div className="bg-background min-h-screen">
      <Header />
      <LoginForm />
      <Footer />
    </div>
  )
}
