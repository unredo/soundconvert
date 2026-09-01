import { type JobProgress, type JobsOptions, type JobType } from 'bullmq'
import type { FastifyBaseLogger } from 'fastify'
import { nanoid } from 'nanoid'

import { jobConfig, queueNames } from './config.js'
import type { ConvertJobData } from './queueConvert.js'
import { flowProducer, queues } from './queueSetup.js'

interface FlowJobData {
  cleanup: boolean
  download: boolean
  files: string[]
  folder: string
}

interface JobInfo {
  actions: {
    cleanup: boolean
  }
  children: { todo: number; failed: number; done: number }
  id: string
  files: {
    name: string
    done: boolean
  }[]
  progress: JobProgress
  state: string
  timestamp: number
}

const createJobOptions: () => JobsOptions = () => ({
  removeOnComplete: {
    age: jobConfig.jobCompletedAge,
  },
  removeOnFail: {
    age: jobConfig.jobFailedAge,
  },
  jobId: nanoid(),
})

async function removeFlowJob(id: string) {
  const { flowQueue } = queues
  const job = await flowQueue?.getJob(id)
  await job?.updateData({ ...job.data, cleanup: true })
  queues.flowQueue?.remove(id, { removeChildren: true })
}

async function addJob(logger: FastifyBaseLogger, data: ConvertJobData) {
  const convertJobs = data.files.map((f) => ({
    name: 'convert',
    data: {
      folder: data.folder,
      file: f,
    },
    queueName: queueNames.convert,
    opts: createJobOptions(),
  }))

  try {
    const flow = await flowProducer.add({
      name: 'flow',
      queueName: queueNames.flow,
      data: {
        folder: data.folder,
        download: false,
        cleanup: false,
        files: data.files,
      },
      children: convertJobs,
      opts: createJobOptions(),
    })

    return flow.job.id
  } catch (err) {
    logger.error(err)
  }
}

async function getFlowJob(id: string) {
  return await queues.flowQueue?.getJob(id)
}

function calcStartEnd(count: number, page: number) {
  const { jobsPerPage } = jobConfig

  const pages = Math.ceil(count / jobsPerPage)
  const start = page * jobsPerPage
  const end = start + jobsPerPage

  if (page >= pages) {
    const rest = count % jobsPerPage
    return { start: count - rest, end: count }
  }

  if (page < 0) {
    return { start: 0, end: jobsPerPage }
  }

  return { start, end }
}

async function getJobInfo(page: number) {
  const { flowQueue } = queues

  const types: JobType[] = ['waiting-children', 'wait', 'waiting', 'completed', 'active']
  const result: JobInfo[] = []

  const count = await flowQueue?.getJobCountByTypes(...types)
  const { start, end } = calcStartEnd(count || 0, page)

  // all jobs start/end param gets applied to every type, not all jobs
  const allJobs = await flowQueue?.getJobs(types)
  const jobs = allJobs?.slice(start, end) || []

  for (const job of jobs) {
    const { cleanup, files } = job.data
    const state = await job.getState()
    const deps = await job.getDependencies()

    const processed = Object.values(deps.processed || []).map((f) => {
      if (!f) return ''
      const parts = f.split('.')
      parts[parts.length - 1] = 'wav'
      return parts.join('.')
    })

    result.push({
      id: job.id || 'n/a',
      progress: job.progress,
      timestamp: job.timestamp,
      state,
      actions: {
        cleanup,
      },
      files: files.map((f: string) => ({
        name: f,
        done: processed.includes(f),
      })),
      children: {
        failed: deps.failed?.length || 0,
        todo: deps.unprocessed?.length || 0,
        done: processed.length,
      },
    })
  }

  return { count, jobs: result }
}

export { addJob, getFlowJob, getJobInfo, removeFlowJob, type ConvertJobData, type FlowJobData }
