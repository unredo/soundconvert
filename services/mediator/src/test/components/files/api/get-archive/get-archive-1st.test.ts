import { equal } from 'node:assert'
import test, { describe, mock } from 'node:test'

import { vol, fs } from 'memfs'

import { mockAllQueues } from '../../../queue-mocks.js'
import { folder, filePath, fileData, appModulePath, inject, id } from './config.js'

mock.module('node:fs', { exports: fs })
mock.module('node:fs/promises', { exports: fs.promises })

describe('GET /archive', () => {
  vol.fromJSON({ [filePath]: fileData })

  test('short id', async (t) => {
    const shortId = 'short'
    mockAllQueues(t, { folder, id: shortId, state: 'completed' })

    const { app } = await import(appModulePath)
    const res = await inject(app!, shortId)
    equal(res.statusCode, 400)
  })

  test('long id', async (t) => {
    const longId = 'x'.repeat(33)
    mockAllQueues(t, { folder, id: longId, state: 'completed' })

    const { app } = await import(appModulePath)
    const res = await inject(app!, longId)
    equal(res.statusCode, 400)
  })

  test('success', async (t) => {
    mockAllQueues(t, { folder, id, state: 'completed' })

    const { app } = await import(appModulePath)
    const res = await inject(app!)

    equal(res.payload, fileData)
    equal(res.statusCode, 200)
  })
})
