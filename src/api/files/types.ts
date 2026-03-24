export type UploadedFileItem = {
  url: string
  filename: string
  sizeKb?: number
}

export type UploadFilesResponse = {
  files: UploadedFileItem[]
}
