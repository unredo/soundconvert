const boundary = '--test'

function createHeaders(contentLength: string) {
  return {
    'content-type': 'multipart/form-data; boundary=' + boundary,
    'content-length': contentLength,
    'content-encoding': 'utf-8',
  }
}

function createForm(...args: { data: string; name: string }[]) {
  const form = new FormData()
  for (const arg of args) {
    form.append('file', new Blob(arg.data.split('')), arg.name)
  }
  return form
}

export { boundary, createHeaders, createForm }
