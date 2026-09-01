import { equal } from 'assert'
import test, { describe } from 'node:test'

import { vol } from 'memfs'

import { mockAllQueues } from '../../../queue-mocks.js'
import { appModulePath, folder, id, inject } from './config.js'

describe('GET /archive', () => {
  test('unavailable zip', async (t) => {
    mockAllQueues(t, { folder, id, state: 'completed' })
    vol.fromJSON({})
    const { app } = await import(appModulePath)
    const res = await inject(app!)
    equal(res.statusCode, 404)
  })
})
