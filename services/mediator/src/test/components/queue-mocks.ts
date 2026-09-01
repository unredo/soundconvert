import { mock, type TestContext } from 'node:test'

import { jobConfig } from '../../components/jobs/data/config.js'

interface FlowJobData {
  id: string
  folder: string
  state: string
}

const queueModuleCleanup = '../../components/jobs/data/queueCleanup.js'
const queueModuleConvert = '../../components/jobs/data/queueConvert.js'
const queueModuleFlow = '../../components/jobs/data/queueFlow.js'

class MockJob {
  id: string
  state: string
  data = { folder: '', download: false, cleanup: false }

  constructor(data: FlowJobData) {
    const { id, state, folder } = data
    this.id = id
    this.state = state
    this.data.folder = folder
  }

  getState() {
    return Promise.resolve(this.state)
  }

  updateData(d: any) {
    this.data = d
    return Promise.resolve()
  }
}

const mockJobData = {
  count: 1,
  jobs: [
    {
      id: 'some',
      progress: 0,
      state: 'state',
      timestamp: Date.now(),
      actions: {
        cleanup: false,
      },
      files: [{ name: 'some.wav', done: false }],
      children: {
        done: 0,
        todo: 1,
        failed: 0,
      },
    },
  ],
}

function mockQueueCleanup(t: TestContext) {
  return t.mock.module(queueModuleCleanup, {
    exports: {
      addCleanupJob: async () => null,
    },
  })
}

function mockQueueConvert(t: TestContext) {
  return t.mock.module(queueModuleConvert, {
    exports: {
      getConvertJob: async () => ({
        data: { file: 'some.file.wav', folder: '/tmp/test' },
      }),
    },
  })
}

function mockQueueFlow(t: TestContext, data?: FlowJobData) {
  const addJobMock = mock.fn(async () => 22)

  return t.mock.module(queueModuleFlow, {
    exports: {
      jobsPerPage: jobConfig.jobsPerPage,
      addJob: addJobMock,
      getFlowJob: async () => (data ? new MockJob(data) : {}),
      getJobInfo: async () => mockJobData,
      getJobCountByTypes: async () => 1,
      removeFlowJob: async () => undefined,
    },
  })
}

function mockDelUpdateIdsQueue() {
  return {
    upsertJobsScheduler: () => undefined,
  }
}

function mockAllQueues(t: TestContext, flowData?: FlowJobData) {
  return {
    cleanup: mockQueueCleanup(t),
    step: mockQueueConvert(t),
    flow: mockQueueFlow(t, flowData),
    delUpdateIdsQueue: mockDelUpdateIdsQueue(),
  }
}

export {
  mockAllQueues,
  mockQueueFlow,
  mockQueueConvert,
  mockQueueCleanup,
  mockJobData,
  type FlowJobData,
}
