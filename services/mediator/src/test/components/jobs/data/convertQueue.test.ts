import { deepStrictEqual } from 'node:assert'
import test, { describe } from 'node:test'

import type { FastifyBaseLogger } from 'fastify'

import { mockQueueConvert } from '../../queue-mocks.js'

describe('queueConvert', () => {
  test('getConvertJob', async (t) => {
    await mockQueueConvert(t)
    const { getConvertJob } = await import('../../../../components/jobs/data/queueConvert.js')
    const result = await getConvertJob({} as FastifyBaseLogger, 'some-id')
    deepStrictEqual(result, { data: { file: 'some.file.wav', folder: '/tmp/test' } })
  })
})
