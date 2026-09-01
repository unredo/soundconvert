import { rm, stat } from 'fs/promises'
import { normalize } from 'path'

import type { Job } from 'bullmq'
import { Worker } from 'bullmq'
import type { FastifyBaseLogger } from 'fastify'

import { queueNames } from '../data/config.js'
import { connection } from '../data/env.js'
import type { CleanupJobData } from '../data/queueCleanup.js'
import { getFlowJob, type FlowJobData } from '../data/queueFlow.js'
import { createArchive } from './archive.js'
import { deleteOldEvents } from './updates.js'

const workers: Worker[] = []

function createArchiveWorker(logger: FastifyBaseLogger) {
  const worker = new Worker(
    queueNames.flow,
    async (job: Job<FlowJobData>) => {
      const { data, id } = job
      const folder = normalize(data.folder)

      try {
        const info = await stat(folder)
        if (!info.isDirectory()) {
          throw Error(`Archive job ${id}: Illegal folder`)
        }

        logger.info(`Archive job running [${id}, ${folder}]`)

        await createArchive(logger, id || 'n/a', folder)
      } catch (err) {
        logger.error(err)
        throw err
      }
    },
    { connection },
  )

  worker.on('error', (err) => logger.error(`Archive error: ${err}`))
  worker.on('completed', (job: Job) =>
    logger.info(`Archive completed [${job.id}, ${job.data.folder}]`),
  )

  workers.push(worker)
  return worker
}

function createCleanupWorker(logger: FastifyBaseLogger) {
  const worker = new Worker(
    queueNames.cleanup,
    async (job: Job<CleanupJobData>) => {
      const {
        data: { id: flowJobId, folder },
        id,
      } = job

      const targetFolder = normalize(folder)
      logger.info(`Cleanup job running [${id}, ${targetFolder}]`)

      const flowJob = await getFlowJob(flowJobId)
      if (!flowJob) {
        logger.warn(`Cleanup: missing job [${flowJobId}]`)
      } else {
        await flowJob?.updateData({ ...flowJob.data, cleanup: true })
      }

      try {
        const info = await stat(targetFolder)
        if (!info.isDirectory()) {
          throw Error(`Cleanup job ${id}: Illegal folder`)
        }

        await rm(targetFolder, { force: true, recursive: true })
      } catch (err) {
        logger.error(err)
        throw err
      }
    },
    { connection },
  )

  worker.on('error', (e) => logger.error(`Cleanup error: ${e}`))
  worker.on('completed', (job: Job) =>
    logger.info(`Cleanup completed [${job.id}, ${job.data.folder}]`),
  )

  workers.push(worker)
  return worker
}

function createDeleteUpdateIdsWorker(logger: FastifyBaseLogger) {
  const worker = new Worker(
    queueNames.deleteIds,
    async (job: Job) => {
      logger.debug(`Delete Update IDs [${job.data.timestamp}]`)
      deleteOldEvents()
    },
    { connection },
  )
  workers.push(worker)
  return worker
}

async function closeAllWorkers() {
  await Promise.allSettled(workers.map((w) => w.close))
}

export { createArchiveWorker, createCleanupWorker, createDeleteUpdateIdsWorker, closeAllWorkers }
