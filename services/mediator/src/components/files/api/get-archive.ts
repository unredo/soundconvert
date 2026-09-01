import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { join } from 'node:path'

import { type FastifyReply, type FastifyRequest } from 'fastify'

import { getFlowJob } from '../../jobs/data/queueFlow.js'
import { getArchiveSchema } from './get-archive.schema.js'

type ArchiveGetRequest = FastifyRequest<{
  Params: { id: string }
}>

const getArchiveRouteConfig = {
  schema: getArchiveSchema,
  url: '/archive/:id/archive.zip',
  method: 'GET',
  handler: getHandler,
  onResponse: onResponse,
}

async function getHandler(req: ArchiveGetRequest, rep: FastifyReply) {
  req.raw.on('close', () => {
    req.log.info(`destroyed: ${req.raw.destroyed}`)
    if (req.raw.aborted) {
      req.log.info('request closed')
    }
  })

  const { id } = req.params

  if (!id) {
    throw Error('Missing query params')
  }

  const job = await getFlowJob(id)
  if (!job) {
    return rep.callNotFound()
  }

  const { cleanup } = job.data

  const state = await job.getState()
  if (state !== 'completed' || cleanup) {
    return rep.callNotFound()
  }

  try {
    const info = await stat(job.data.folder)
    if (!info.isDirectory()) {
      rep.status(410)
      return rep.send()
    }

    const path = join(job.data.folder, 'archive.zip')
    const stream = createReadStream(path)

    rep.header('content-type', 'application/octet-stream')
    return rep.send(stream)
  } catch (err) {
    const msg = err instanceof Error ? err.message : ''
    req.log.error(`Archive handler: ${msg}`)
    return rep.callNotFound()
  }
}

async function onResponse(req: ArchiveGetRequest, rep: FastifyReply) {
  if (rep.statusCode !== 200) {
    return
  }

  const { id } = req.params
  const job = await getFlowJob(id)
  if (!job) {
    return rep.callNotFound()
  }

  if (job?.data.download) {
    return
  }

  await job?.updateData({ ...job.data, download: true })
}

export { getArchiveRouteConfig, getHandler }
