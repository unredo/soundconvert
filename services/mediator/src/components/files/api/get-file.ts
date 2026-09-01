import { createReadStream } from 'node:fs'
import { join } from 'node:path'

import { type FastifyReply, type FastifyRequest } from 'fastify'

import { getConvertJob } from '../../jobs/data/queueConvert.js'
import { getFileSchema } from './get-file.schema.js'

type FileGetRequest = FastifyRequest<{
  Params: { id: string }
  Querystring: { file: string }
}>

const getFileRouteConfig = {
  schema: getFileSchema,
  url: '/file/:id',
  method: 'GET',
  handler: getHandler,
}

async function getHandler(req: FileGetRequest, rep: FastifyReply) {
  const { file } = req.query
  const { id } = req.params

  if (!id || !file) {
    throw Error('Missing query params')
  }

  const job = await getConvertJob(req.log, id)
  if (!job) {
    return rep.callNotFound()
  }

  const path = join(job.data.folder, file)
  const stream = createReadStream(path)

  rep.header('content-type', 'application/octet-stream')
  return rep.send(stream)
}

export { getFileRouteConfig, getHandler }
