"use client"

import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import RegisterForm from "@/components/register/RegisterForm"

export default function RegisterPage() {
  return (
    <div className="bg-background min-h-screen">
      <Header />
      <RegisterForm />
      <Footer />
    </div>
  )
}
