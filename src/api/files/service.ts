import { api } from "@/lib/api"
import type { UploadFilesResponse } from "./types"

export async function uploadFiles(files: File[], folder?: string): Promise<UploadFilesResponse> {
  const form = new FormData()

  files.forEach((file) => {
    form.append("files", file, file.name)
  })

  if (folder) {
    form.append("folder", folder)
  }

  return api.request<UploadFilesResponse>("/files/upload-multiple", {
    method: "POST",
    body: form,
  })
}
