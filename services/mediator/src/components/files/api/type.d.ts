import { fastify } from 'fastify'

import type { FileInfo } from '../domain/file-info.ts'

declare module 'fastify' {
  interface FastifyRequest {
    fileData: {
      fileInfo: FileInfo
      tempPath: string
    }
  }
}
