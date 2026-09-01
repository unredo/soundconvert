import { getErrorMsg } from '../../utils/error'

const url = '/files'

function logError(msg: string) {
  console.error(`Upload failed: ${msg}`)
}

async function upload(files: File[], fd: FormData) {
  for (const f of files) {
    fd.append('file', f, f.name)
  }

  let result: Response | null = null

  try {
    result = await fetch(url, { method: 'POST', body: fd })
  } catch (err) {
    const msg = getErrorMsg(err)
    logError(msg)
    return msg
  }

  if (result && !result.ok) {
    const { status } = result
    logError(status.toString())
    switch (status) {
      case 404:
        return 'Could not connect to the service'
      default:
        return 'Something went wrong...'
    }
  }
}

export { upload }
