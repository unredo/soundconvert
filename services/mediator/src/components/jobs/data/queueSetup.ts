import { FlowProducer, Queue, QueueEvents } from 'bullmq'

import { deleteEventsInterval, addEvent, type UpdateType } from '../domain/updates.js'
import { queueNames } from './config.js'
import { connection } from './env.js'
import { addCleanupJob, type CleanupJobData } from './queueCleanup.js'
import type { ConvertJobData, FlowJobData } from './queueFlow.js'

const queues: {
  flowQueue: Queue<FlowJobData> | null
  convertQueue: Queue<ConvertJobData> | null
  cleanupQueue: Queue<CleanupJobData> | null
  delUpdateIdsQueue: Queue | null
} = {
  flowQueue: null,
  convertQueue: null,
  cleanupQueue: null,
  delUpdateIdsQueue: null,
}

let flowProducer: FlowProducer
let queueEvents: QueueEvents

function createFlowProducer() {
  flowProducer = new FlowProducer({ connection })
}

function createQueues() {
  queues.flowQueue = new Queue(queueNames.flow, { connection })
  queues.convertQueue = new Queue(queueNames.convert, { connection })
  queues.cleanupQueue = new Queue(queueNames.cleanup, { connection })
  queues.delUpdateIdsQueue = new Queue(queueNames.deleteIds, { connection })

  queues.delUpdateIdsQueue.upsertJobScheduler(
    'delUpdateIds',
    { every: deleteEventsInterval },
    {
      name: 'deleteUpdateIds',
      data: { timestamp: Date.now() },
      opts: { removeOnComplete: true, removeOnFail: true },
    },
  )
}

function createListener() {
  queueEvents = new QueueEvents(queueNames.flow, { connection })

  const createCleanupJob = async (id: string, failed: boolean) => {
    const job = await queues.flowQueue?.getJob(id)
    if (!job) return
    await addCleanupJob(id, job.data.folder, failed)
  }

  const createHandler =
    (type: UpdateType) =>
    ({ jobId }: { jobId: string }) =>
      addEvent({ id: jobId, type, timestamp: Date.now() })

  queueEvents.on('added', createHandler('new'))
  queueEvents.on('removed', createHandler('delete'))
  queueEvents.on('completed', async (jobData) => {
    await createCleanupJob(jobData.jobId, false)
    createHandler('change')({ jobId: jobData.jobId })
  })
  queueEvents.on('failed', async (jobData) => {
    await createCleanupJob(jobData.jobId, true)
    createHandler('change')({ jobId: jobData.jobId })
  })
}

async function closeAllQueues() {
  const { cleanupQueue, convertQueue, flowQueue, delUpdateIdsQueue } = queues
  await flowProducer?.close()
  await queueEvents?.close()
  await cleanupQueue?.close()
  await convertQueue?.close()
  await flowQueue?.close()
  await delUpdateIdsQueue?.close()
}

export { createListener, createQueues, queues, flowProducer, createFlowProducer, closeAllQueues }
