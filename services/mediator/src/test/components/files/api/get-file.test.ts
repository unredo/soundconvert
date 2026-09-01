import { deepEqual, equal } from 'node:assert'
import test from 'node:test'

import type { FastifyInstance } from 'fastify'

import { mockJobFolder, mockFs, mockReadableMessage } from '../../fs-mocks.js'
import { mockAllQueues } from '../../queue-mocks.js'

test('GET /file/:id', (t) => {
  let collectedPaths: string[] = []
  let app: FastifyInstance

  const fileName = 'test.wav'

  t.before(async () => {
    mockAllQueues(t)
    collectedPaths = await mockFs()

    ;({ app } = await import('../../../../app.js'))
  })

  test('single download', async () => {
    const res = await app!.inject({
      url: `/file/00xx00xx?file=${fileName}`,
      method: 'GET',
    })

    equal(res.body, mockReadableMessage)
    equal(res.statusCode, 200)
    deepEqual(collectedPaths, [`${mockJobFolder}/${fileName}`])
  })
})
