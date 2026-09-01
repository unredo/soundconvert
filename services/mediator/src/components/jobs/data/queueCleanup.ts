import { nanoid } from 'nanoid'

import { jobConfig } from './config.js'
import { queues } from './queueSetup.js'

interface CleanupJobData {
  id: string
  folder: string
}

async function addCleanupJob(id: string, folder: string, failed: boolean = false) {
  const { cleanupQueue } = queues
  const { jobFailedAge, jobCompletedAge } = jobConfig

  await cleanupQueue?.add(
    'cleanup',
    { id, folder },
    {
      jobId: nanoid(),
      removeOnComplete: true,
      delay: 1000 * (failed ? jobFailedAge : jobCompletedAge),
    },
  )
}

export { addCleanupJob, type CleanupJobData }
