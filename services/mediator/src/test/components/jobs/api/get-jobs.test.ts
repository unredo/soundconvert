import { deepEqual, equal } from 'node:assert'
import test from 'node:test'

import type { FastifyInstance } from 'fastify'

import { mockJobData, mockAllQueues } from '../../queue-mocks.js'

test('GET /jobs', (t) => {
  let app: FastifyInstance

  t.before(async () => {
    mockAllQueues(t)
    ;({ app } = await import('../../../../app.js'))
  })

  test('success', async () => {
    const res = await app!.inject({
      url: '/jobs?page=0',
      method: 'GET',
    })

    deepEqual(res.json(), { ...mockJobData, pagination: { current: 0, pages: 1 } })
    equal(res.statusCode, 200)
  })
})
