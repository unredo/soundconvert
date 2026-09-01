import { deepEqual, equal } from 'node:assert'
import test from 'node:test'

import type { FastifyInstance } from 'fastify'

import {
  addEvent,
  deleteEventsInterval,
  type UpdateEvent,
  type UpdateType,
} from '../../../../components/jobs/domain/updates.js'
import { mockAllQueues } from '../../queue-mocks.js'

const createEvent = (id: string, timestamp: number, type: UpdateType): UpdateEvent => ({
  id,
  timestamp,
  type,
})

test('GET /jobs/updates', (t) => {
  const ts = Date.now()
  let app: FastifyInstance

  t.before(async () => {
    mockAllQueues(t)
    ;({ app } = await import('../../../../app.js'))
  })

  test('success', async () => {
    const evs = [
      createEvent('1', ts + 1, 'change'),
      createEvent('2', ts + 1, 'delete'),
      createEvent('3', ts - deleteEventsInterval, 'new'),
    ]
    for (const e of evs) {
      addEvent(e)
    }

    const res = await app!.inject({
      url: '/jobs/updates?ts=' + ts,
      method: 'GET',
    })

    deepEqual(res.json(), [evs[0], evs[1]])
    equal(res.statusCode, 200)
  })
})
