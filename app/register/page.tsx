import type { Metadata } from "next"
import RegisterPageClient from "@/components/register/RegisterPageClient"

export const metadata: Metadata = {
  title: "Register | VN Buyer Guide - Create Your Account",
  description:
    "Create your VN Buyer Guide account: register as a member, manage your profile, access business tools, and connect with quality business partners in Vietnam.",
  openGraph: {
    title: "Register | VN Buyer Guide - Create Your Account",
    description:
      "Create your VN Buyer Guide account: register as a member and access business tools.",
    type: "website",
  },
}

export default function RegisterPage() {
  return <RegisterPageClient />
}
