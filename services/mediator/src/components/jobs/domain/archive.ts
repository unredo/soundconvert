import { ReadStream, createWriteStream, createReadStream } from 'fs'
import { opendir, rm } from 'fs/promises'
import { join } from 'path'

import { ZipArchive } from 'archiver'
import type { FastifyBaseLogger } from 'fastify'

async function deleteAllBesides(path: string, keeper: string) {
  const d = await opendir(path)
  for await (const item of d) {
    const { name } = item
    if (item.isFile() && name === keeper) {
      continue
    }
    await rm(join(path, name))
  }
}

async function createArchive(logger: FastifyBaseLogger, id: string, path: string) {
  const errMsg = (type: string, err: string | Error) => `Job [${id}, ${path}] ${type}: ${err}`

  const archiveName = 'archive.zip'
  const readStreams: ReadStream[] = []
  const archive = new ZipArchive()
  const ws = createWriteStream(join(path, archiveName))
  archive.pipe(ws)

  const cleanup = () => {
    for (const rs of readStreams) {
      if (!rs.closed) rs.close()
    }
  }

  archive.on('error', (err) => {
    if (!ws.closed) ws.close()
    archive.destroy()
    cleanup()
    throw err
  })

  archive.on('warning', (msg) => logger.warn(errMsg('warning', msg)))

  const dir = await opendir(path)
  for await (const item of dir) {
    const { name } = item
    if (!item.isFile() || name.split('.').reverse()[0] !== 'ogg') {
      continue
    }
    const rs = createReadStream(join(path, name))
    readStreams.push(rs)
    archive.append(rs, { name })
  }
  await archive.finalize()
  await deleteAllBesides(path, archiveName)
}

export { createArchive }
