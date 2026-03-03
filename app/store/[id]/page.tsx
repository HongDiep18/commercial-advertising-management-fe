"use client"

import { useParams } from "next/navigation"
import { StoreDetail } from "@/components/store/StoreDetail"

export default function StorePage() {
  const params = useParams()
  const productId = params.id as string

  return <StoreDetail productId={productId} />
}
