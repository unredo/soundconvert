import { deepStrictEqual, equal } from 'node:assert'
import test, { describe, before, mock } from 'node:test'

const timestamp = 1234

const testJobObjects = [
  createJobObject('1'),
  createJobObject('2'),
  createJobObject('3'),
  createJobObject('4'),
  createJobObject('5'),
  createJobObject('6'),
  createJobObject('7'),
]

function createJobObject(id: string) {
  return {
    getDependencies: async () => ({
      processed: { 'some-weird-id': 'file.wav' },
      unprocessed: ['some-other-id'],
      failed: [],
    }),
    getState: async () => 'state',
    data: { cleanup: false, files: ['file.wav'] },
    timestamp,
    progress: 0,
    id,
  }
}

const createJobResult = (id: string) => ({
  id,
  progress: 0,
  state: 'state',
  timestamp,
  actions: {
    cleanup: false,
  },
  files: [{ name: 'file.wav', done: true }],
  children: { done: 1, todo: 1, failed: 0 },
})

const mockJob = {}

class MockQueue {
  async getJobCountByTypes() {
    return testJobObjects.length
  }
  async getJobs() {
    return testJobObjects
  }
  async getJob() {
    return mockJob
  }
  upsertJobScheduler() {}
}

class MockFlowProducer {
  add() {}
}

class MockQueueEvents {}

describe('flowQueue', async () => {
  let getJobInfo: any | null = null
  let getFlowJob: any | null = null

  before(async () => {
    mock.module('bullmq', {
      exports: {
        Queue: MockQueue,
        FlowProducer: MockFlowProducer,
        QueueEvents: MockQueueEvents,
      },
    })

    const mod = await import('../../../../components/jobs/data/queueSetup.js')
    mod.createQueues()
    ;({ getJobInfo, getFlowJob } = await import('../../../../components/jobs/data/queueFlow.js'))
  })

  describe('getFlowJob', () => {
    test(async () => {
      const res = await getFlowJob('id')
      equal(res, mockJob)
    })
  })

  describe('getJobInfo', () => {
    test('valid page', async () => {
      const info = await getJobInfo!(0)
      deepStrictEqual(info, {
        count: testJobObjects.length,
        jobs: [
          createJobResult('1'),
          createJobResult('2'),
          createJobResult('3'),
          createJobResult('4'),
          createJobResult('5'),
          createJobResult('6'),
        ],
      })
    })

    test('page beyond upper limit', async () => {
      const info = await getJobInfo!(10)
      equal(info.count, testJobObjects.length)
      equal(info.jobs.length, 1)
      equal(info.jobs[0].id, '7')
    })

    test('page below 0', async () => {
      const info = await getJobInfo!(-1)
      deepStrictEqual(info, {
        count: testJobObjects.length,
        jobs: [
          createJobResult('1'),
          createJobResult('2'),
          createJobResult('3'),
          createJobResult('4'),
          createJobResult('5'),
          createJobResult('6'),
        ],
      })
    })
  })
})
