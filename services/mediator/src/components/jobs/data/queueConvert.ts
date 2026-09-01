import type { FastifyBaseLogger } from 'fastify'

import { queues } from './queueSetup.js'

interface ConvertJobData {
  folder: string
  files: string[]
}

async function getConvertJob(logger: FastifyBaseLogger, id: string) {
  try {
    return await queues.convertQueue?.getJob(id)
  } catch (err) {
    logger.error(err)
  }
}

export { type ConvertJobData, getConvertJob }
