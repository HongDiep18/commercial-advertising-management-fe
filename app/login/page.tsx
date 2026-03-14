import type { Metadata } from "next"
import LoginPageClient from "@/components/login/LoginPageClient"

export const metadata: Metadata = {
  title: "Login | VN Buyer Guide - Sign In to Your Account",
  description:
    "Sign in to your VN Buyer Guide account: manage your profile, access business tools, and connect with quality business partners in Vietnam.",
  openGraph: {
    title: "Login | VN Buyer Guide - Sign In to Your Account",
    description:
      "Sign in to your VN Buyer Guide account: manage your profile and access business tools.",
    type: "website",
  },
}

export default function LoginPage() {
  return <LoginPageClient />
}
