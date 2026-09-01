function createUploadUrl(baseUrl: URL, id: string, file: string) {
  return new URL(`/file/${id}?file=${file}`, baseUrl)
}

export { createUploadUrl }
