import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { join, normalize } from 'node:path'
import { PassThrough } from 'node:stream'

import { fetch, Response } from 'undici'

async function upload(url: string, tmpDirPath: string, oggFileName: string) {
  const boundary = `----sndcnv${crypto.randomUUID()}`
  const header =
    `\r\n--${boundary}` +
    `\r\nContent-Disposition: form-data; name="file"; filename="${oggFileName}"` +
    `\r\nContent-Type: application/octet-stream\r\n\r\n`
  const footer = `\r\n\r\n--${boundary}--`

  const pathName = join(tmpDirPath, normalize(oggFileName))
  const stats = await stat(pathName)
  const rs = createReadStream(pathName)
  const ps = new PassThrough()

  ps.write(header, () => {
    rs.on('end', () => ps.end(footer))
    rs.pipe(ps, { end: false })
  })

  let res: Response | null = null

  try {
    res = await fetch(url, {
      method: 'POST',
      body: ps,
      duplex: 'half',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': (stats.size + header.length + footer.length).toString(),
        'Content-Encoding': 'UTF-8',
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : ''
    console.error(err)
    throw Error(`Upload failed: ${msg}`)
  } finally {
    if (!rs.closed) rs.close()
  }

  if (res.status !== 200) {
    const msg = `${res.status}, ${res.statusText}`
    console.warn(`Upload status: ${msg}`)
    throw Error(msg)
  }
}

export { upload }
