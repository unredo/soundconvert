import { rm } from 'fs/promises'

import { type FastifyReply, type FastifyRequest, type RouteOptions } from 'fastify'

import { addJob } from '../../jobs/data/queueFlow.js'
import { makeTempDir } from '../domain/directory.js'
import { createFileInfo } from '../domain/file-info.js'
import { multiFileSchema } from './post-files.schema.js'

const postFilesRouteConfig: RouteOptions = {
  schema: multiFileSchema,
  url: '/files',
  method: 'POST',
  handler,
  onRequest,
  onResponse,
}

async function onRequest(req: FastifyRequest) {
  req.fileData = {
    tempPath: await makeTempDir(),
    fileInfo: createFileInfo(),
  }
}

async function handler(req: FastifyRequest, rep: FastifyReply) {
  const { fileInfo, tempPath } = req.fileData

  if (fileInfo.count < 1) {
    return rep.send({ id: 'n/a', info: req.fileData.fileInfo })
  }

  const id = await addJob(req.log, {
    folder: tempPath,
    files: fileInfo.files.map((f) => f.name),
  })
  if (!id) {
    throw Error('Internal error')
  }

  return rep.send({ id, info: req.fileData.fileInfo })
}

async function onResponse(req: FastifyRequest, rep: FastifyReply) {
  const { fileInfo, tempPath } = req.fileData

  if (rep.statusCode !== 200 || fileInfo.count < 1) {
    await rm(tempPath!, { recursive: true, force: true })
  }
}

export { postFilesRouteConfig }
