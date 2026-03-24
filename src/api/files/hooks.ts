import { useMutation } from "@tanstack/react-query"
import { uploadFiles } from "./service"
import type { UploadFilesResponse } from "./types"

export function useUploadFiles(): {
  upload: (args: { files: File[]; folder?: string }) => Promise<UploadFilesResponse>
  isPending: boolean
} {
  const mutation = useMutation({
    mutationFn: ({ files, folder }: { files: File[]; folder?: string }) =>
      uploadFiles(files, folder),
  })

  return {
    upload: mutation.mutateAsync,
    isPending: mutation.isPending,
  }
}
