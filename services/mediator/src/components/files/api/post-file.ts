import { rm } from 'node:fs/promises'
import { join, normalize } from 'node:path'

import type { FastifyReply, FastifyRequest } from 'fastify'

import { getConvertJob } from '../../jobs/data/queueConvert.js'
import { changeFileEnding } from '../domain/file-ending.js'
import { createFileInfo } from '../domain/file-info.js'
import { multiFileSchema } from './post-files.schema.js'

type FilePostRequest = FastifyRequest<{
  Params: { id: string }
}>

const postFileRouteConfig = {
  schema: multiFileSchema,
  method: 'POST',
  url: '/file/:id',
  onRequest,
  handler,
  onResponse,
}

async function onRequest(req: FilePostRequest) {
  const { id } = req.params
  const job = await getConvertJob(req.log, id)
  if (!job) {
    throw Error('Missing job')
  }
  req.fileData = {
    tempPath: job.data.folder,
    fileInfo: createFileInfo(),
  }
}

async function handler(req: FilePostRequest, rep: FastifyReply) {
  const { id } = req.params
  return rep.send({ id, info: req.fileData.fileInfo })
}

async function onResponse(req: FilePostRequest, rep: FastifyReply) {
  if (rep.statusCode === 200) {
    const { tempPath, fileInfo } = req.fileData
    for (const file of fileInfo.files) {
      const wavName = changeFileEnding(file.name, 'wav')
      await rm(join(tempPath, normalize(wavName)))
    }
  }
}

export { postFileRouteConfig }
