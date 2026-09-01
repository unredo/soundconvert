import { createWriteStream } from 'node:fs'
import { join, normalize } from 'node:path'
import { pipeline } from 'node:stream/promises'

import type { MultipartFile } from '@fastify/multipart'
import type { FastifyRequest } from 'fastify'

async function onFileHandler(this: FastifyRequest, file: MultipartFile) {
  const { tempPath, fileInfo } = this.fileData

  try {
    const filePath = join(tempPath, normalize(file.filename))
    await pipeline(file.file, createWriteStream(filePath))
  } catch (e) {
    this.log.error(e)
    file.file.resume()
    throw Error()
  }

  if (fileInfo) {
    fileInfo.count += 1
    fileInfo.files.push({
      encoding: file.encoding,
      name: file.filename,
      type: file.mimetype,
    })
  }
}

export { onFileHandler }
