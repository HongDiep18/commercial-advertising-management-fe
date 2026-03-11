import { api } from "@/lib/api"
import type { CreateAdOrderInput, CreateAdOrderResponse } from "../../types/types"

export async function createAdOrder(input: CreateAdOrderInput): Promise<CreateAdOrderResponse> {
  return api.request<CreateAdOrderResponse>("/ad-orders", {
    method: "POST",
    body: input,
  })
}
